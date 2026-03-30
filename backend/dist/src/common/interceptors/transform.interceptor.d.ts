import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ResponseShape<T> {
    data: T;
    statusCode: number;
    timestamp: string;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, ResponseShape<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseShape<T>>;
}
