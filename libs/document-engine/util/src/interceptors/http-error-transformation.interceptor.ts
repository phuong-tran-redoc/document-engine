import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { HTTP_ERROR_SKIP_TRANSFORMATION } from '../tokens/http-error.token';
import { IHttpError } from '../types/http-error.interface';

export function httpErrorTransformationInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    catchError((error) => {
      const skipTransformation = req.context.get(HTTP_ERROR_SKIP_TRANSFORMATION);
      if (skipTransformation) return throwError(() => error);
      return throwError(() => error.error as IHttpError);
    }),
  );
}
