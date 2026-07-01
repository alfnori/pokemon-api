import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: {
      statusCode: number;
      message: string | string[];
      error?: string;
    } = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      errorResponse.statusCode = exception.getStatus();
      const exResponse = exception.getResponse();

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
          exception.stack,
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
