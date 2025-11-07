import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { HTTP_ERROR_EXCLUDE_STATUS_CODES, HTTP_ERROR_SKIP_NAVIGATION } from '../tokens/http-error.token';

export function httpErrorNavigationInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const skipNavigation = req.context.get(HTTP_ERROR_SKIP_NAVIGATION);

  if (skipNavigation) return next(req);

  return next(req).pipe(
    catchError((error) => {
      const statusCode = error.status;
      const excludeStatusCodes = req.context.get(HTTP_ERROR_EXCLUDE_STATUS_CODES);

      if (excludeStatusCodes.includes(statusCode)) return throwError(() => error);

      if ([403, 404].includes(statusCode)) {
        router.navigate([String(statusCode)], { skipLocationChange: true });
      }

      return throwError(() => error);
    }),
  );
}
