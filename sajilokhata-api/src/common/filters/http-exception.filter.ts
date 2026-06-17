// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    // ✅ NestJS HTTP exceptions (BadRequestException, NotFoundException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
      error = exception.name;
    }

    // ✅ TypeORM DB errors
    else if (exception instanceof QueryFailedError) {
      const pg = exception.driverError as any;
this.logger.error('QueryFailedError:', exception.message, exception.stack); // 👈 add this
  this.logger.error('PG Error code:', pg.code, pg.detail);
      switch (pg.code) {
        case '23505': // unique violation
          status = HttpStatus.CONFLICT;
          error = 'Conflict';
          message = this.extractDuplicateField(pg.detail);
          break;

        case '23503': // foreign key violation
          status = HttpStatus.BAD_REQUEST;
          error = 'BadRequest';
          message = 'Referenced record does not exist';
          break;

        case '23502': // not null violation
          status = HttpStatus.BAD_REQUEST;
          error = 'BadRequest';
          message = `Field '${pg.column}' cannot be null`;
          break;

        default:
          status = HttpStatus.BAD_REQUEST;
          error = 'DatabaseError';
          message = 'A database error occurred';
      }
    }

    // ✅ Unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  // Extracts field name from: 'Key (email)=(owner1@test.com) already exists.'
  private extractDuplicateField(detail: string): string {
    const match = detail?.match(/Key \((.+?)\)=\((.+?)\)/);
    if (match) return `'${match[1]}' '${match[2]}' already exists`;
    return 'Duplicate value violates unique constraint';
  }
}