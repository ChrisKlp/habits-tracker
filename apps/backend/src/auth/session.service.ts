import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { DeviceType } from '@/common/decorators/device.decorator';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { sessionsTable } from '@/drizzle/schema';

import { hashValue, validateValue } from './utils/hash';

@Injectable()
export class SessionService {
  private readonly MAX_SESSIONS = 1;

  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async addSession(userId: string, device: DeviceType, refreshToken: string) {
    const now = new Date().toISOString();

    try {
      await this.db.transaction(async trx => {
        const session = await trx
          .select()
          .from(sessionsTable)
          .where(eq(sessionsTable.userId, userId))
          .orderBy(asc(sessionsTable.createdAt));

        if (session.length >= this.MAX_SESSIONS) {
          const toDeleteIds = session
            .slice(0, session.length - this.MAX_SESSIONS + 1)
            .map(s => s.id);

          await trx.delete(sessionsTable).where(inArray(sessionsTable.id, toDeleteIds));
        }

        await trx.insert(sessionsTable).values({
          userId,
          ip: device.ip,
          refreshToken: await hashValue(refreshToken),
          createdAt: now,
          updatedAt: now,
          deviceType: device.deviceType,
          deviceName: device.deviceName,
          deviceOs: device.deviceOs,
          browser: device.browser,
        });
      });
    } catch {
      throw new ConflictException('Failed to create session');
    }
  }

  async removeSession(sessionId: string) {
    await this.db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  }

  async removeAllSessions(userId: string) {
    await this.db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
  }

  async getUserSessions(userId: string) {
    return this.db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId));
  }

  async validateSession(userId: string, refreshToken: string) {
    const sessions = await this.getUserSessions(userId);

    for (const s of sessions) {
      if (await validateValue(refreshToken, s.refreshToken)) {
        return s;
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }
}
