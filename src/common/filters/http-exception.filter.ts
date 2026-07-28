import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

        if(exception instanceof HttpException){
            status = exception.getStatus();
            const res = exception.getResponse();

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
      data = { message: 'Internal Server Error' };
    }

        response.status(status).json({
            success: false,
            data:{
                statusCode: status,
                ...data,
                path: request.url
            },
            timestamp: new Date().toISOString()
        })
    }
}