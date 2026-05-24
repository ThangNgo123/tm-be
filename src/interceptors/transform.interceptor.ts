import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface IResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IResponse<T>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const requestPath = (req?.originalUrl || req?.url || '').split('?')[0];
    const isMetricsEndpoint = /(^|\/)metrics$/.test(requestPath);

    if (isMetricsEndpoint) {
      return next.handle() as Observable<IResponse<T>>;
    }

    return next.handle().pipe(
      map((result: any) => {
        const message = result?.message || 'Request successful';
        const data = result?.data !== undefined ? result.data : result;

        return {
          statusCode: res.statusCode,
          message: message,
          data: data,
        };
      }),
    );
  }
}
