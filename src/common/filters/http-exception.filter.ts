import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';

function mapQueryFailedError(
  exception: QueryFailedError,
): HttpException | null {
  const driverError = (exception as any).driverError as
    | { code?: string; detail?: string; constraint?: string; table?: string }
    | undefined;

  if (!driverError?.code) {
    return null;
  }

  switch (driverError.code) {
    case PG_UNIQUE_VIOLATION: {
      const message = driverError.detail
        ? `Duplicate value: ${driverError.detail.replace(/^Key /, '').replace(/[()]/g, "'")}`
        : 'Resource already exists';
      return new ConflictException(message);
    }
    case PG_FOREIGN_KEY_VIOLATION: {
      return new ConflictException(
        `Referenced record not found (${driverError.constraint ?? driverError.table ?? 'unknown'})`,
      );
    }
    case PG_NOT_NULL_VIOLATION: {
      return new BadRequestException(
        `Required field cannot be null (${driverError.constraint ?? 'unknown'})`,
      );
    }
    default:
      return null;
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let httpException: HttpException | null = null;

    if (exception instanceof HttpException) {
      httpException = exception;
    } else if (exception instanceof QueryFailedError) {
      httpException = mapQueryFailedError(exception);
    }

    const errorResponse: {
      statusCode: number;
      message: string | string[];
      error?: string;
    } = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };

    if (httpException) {
      errorResponse.statusCode = httpException.getStatus();
      const exResponse = httpException.getResponse();

      if (typeof exResponse === 'string') {
        errorResponse.message = exResponse;
      } else if (typeof exResponse === 'object') {
        const body = exResponse as Record<string, unknown>;
        if (body.message) {
          errorResponse.message = body.message as string | string[];
        }
        errorResponse.error = body.error as string | undefined;
      }

      if (errorResponse.statusCode >= 500) {
        this.logger.error(
          `[${request.method}] ${request.url} -> ${errorResponse.statusCode}`,
          httpException.stack,
        );
      } else {
        this.logger.warn(
          `[${request.method}] ${request.url} -> ${errorResponse.statusCode} - ${JSON.stringify(errorResponse.message)}`,
        );
      }
    } else {
      const error = exception as Error;
      this.logger.error(
        `[${request.method}] ${request.url} -> 500 - ${error.message}`,
        error.stack,
      );
    }

    response.status(errorResponse.statusCode).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
