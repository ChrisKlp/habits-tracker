import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { DrizzleQueryError } from 'drizzle-orm';

@Catch()
export class DrizzleExceptionFilter extends BaseExceptionFilter {
  catch(exception: object, host: ArgumentsHost) {
    if (exception instanceof DrizzleQueryError) {
      const error = exception.cause as unknown as {
        code?: string;
        detail?: string;
      };
      if (error.code) {
        switch (error.code) {
          case '23505': // PostgreSQL unique_violation
            throw new ConflictException(error.detail);
          case '42501': // PostgreSQL insufficient_privilege
            throw new ForbiddenException(error.detail);
          default:
            throw new BadRequestException(error.detail);
        }
      }
    }

    super.catch(exception, host);
  }
}
