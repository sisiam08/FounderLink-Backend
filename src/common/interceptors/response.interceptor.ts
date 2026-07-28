import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

interface StandardResponse<T>{
    success: boolean,
    data: T,
    timestamp: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>>{
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<StandardResponse<T>> | Promise<Observable<StandardResponse<T>>> {
        return next.handle().pipe(
            map((data)=>{
                return {
                    success: true,
                    data,
                    timestamp: new Date().toISOString()
                }
            })
        )
    }
}