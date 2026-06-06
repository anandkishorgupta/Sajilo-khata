import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((response) => ({
        success: true,
        message: response?.message || 'Success',
        data: response?.data ?? response,
        meta: response?.meta ?? {
          total: response?.total,
          page: response?.page,
          limit: response?.limit,
          totalPages: response?.totalPages,
        },
      })),
    );
  }
}