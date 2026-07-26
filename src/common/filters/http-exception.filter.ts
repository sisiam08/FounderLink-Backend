import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let data: Record<string, unknown>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        data = { message: res };
      } else if (typeof res === 'object' && res !== null) {
        data = res as Record<string, unknown>;
      } else {
        data = { message: exception.message };
      }
    } else {
      status = 500;
      data = { message: 'Internal server error' };
      this.logger.error(
        `Unhandled exception: ${String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      data: {
        statusCode: status,
        ...data,
        path: request.url,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
