import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { profilesTable } from '@/drizzle/schema';

import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfilesService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async create(userId: string, createProfileDto: CreateProfileDto) {
    const [existingProfile] = await this.db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));

    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    const [profile] = await this.db
      .insert(profilesTable)
      .values({
        ...createProfileDto,
        userId,
      })
      .returning();

    if (!profile) {
      throw new BadRequestException('Could not create profile with given data');
    }

    return profile;
  }

  async findOne(userId: string) {
    const [profile] = await this.db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    const [profile] = await this.db
      .update(profilesTable)
      .set(updateProfileDto)
      .where(eq(profilesTable.userId, userId))
      .returning();

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
