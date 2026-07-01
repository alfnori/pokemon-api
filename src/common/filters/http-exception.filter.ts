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

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object') {
        const body = exResponse as Record<string, unknown>;
        message = (body.message as string | string[]) ?? message;
      }

      if (status >= 500) {
        this.logger.error(
          `[${request.method}] ${request.url} -> ${status}`,
          exception.stack,
        );
      } else {
        this.logger.warn(
          `[${request.method}] ${request.url} -> ${status} - ${JSON.stringify(message)}`,
        );
      }
    } else {
      const error = exception as Error;
      this.logger.error(
        `[${request.method}] ${request.url} -> 500 - ${error.message}`,
        error.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
