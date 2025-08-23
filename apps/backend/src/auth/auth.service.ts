import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { usersTable } from '@/users/schema';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';
import { UserDto } from '@/users/dto/user.dto';
import { DeviceType } from '@/common/decorators/device.decorator';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
        .then(([user]) => user);

      if (!user) {
        throw new NotFoundException();
      }

      if (!(await compare(password, user.password))) {
        throw new UnauthorizedException();
      }

      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async login(user: UserDto, device: DeviceType, response: Response) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return user;
  }

  async register(registerDto: RegisterDto) {
    try {
      const [user] = await this.db
        .insert(usersTable)
        .values({
          email: registerDto.email,
          password: await hash(registerDto.password, 10),
        })
        .returning();

      return user;
    } catch {
      throw new InternalServerErrorException('Failed to register user');
    }
  }
}
