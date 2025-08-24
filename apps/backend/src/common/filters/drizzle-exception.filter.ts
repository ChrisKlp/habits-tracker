import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
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
        constraint?: string;
        column?: string;
        message?: string;
      };
      if (error.code) {
        switch (error.code) {
          case '23505': // unique_violation
            throw new ConflictException(error.message);
          case '23503': // foreign_key_violation
            throw new NotFoundException(error.message);
          case '23502': // not_null_violation
            throw new BadRequestException(error.message);
          case '22P02': // invalid_text_representation
            throw new BadRequestException(error.message);
          case '42501': // insufficient_privilege
            throw new ForbiddenException(error.message);
          default:
            throw new InternalServerErrorException(error.message);
        }
      }
    }

    super.catch(exception, host);
  }
}
