import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
interface StandardResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<StandardResponse<T>> | Promise<Observable<StandardResponse<T>>>;
}
export {};
