import { HttpContextToken } from '@angular/common/http';

export const HTTP_ERROR_SKIP_NAVIGATION = new HttpContextToken<boolean>(() => false);
export const HTTP_ERROR_EXCLUDE_STATUS_CODES = new HttpContextToken<number[]>(() => []);

export const HTTP_ERROR_SKIP_TRANSFORMATION = new HttpContextToken<boolean>(() => false);
