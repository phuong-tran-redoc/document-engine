import { BREADCRUMB_DEFAULT_CONFIG } from '../constants';
import { BreadcrumbConfig } from '../types';
import { BREADCRUMB_CONFIG } from './breadcrumb.token';

export function provideBreadcrumb(config?: Partial<BreadcrumbConfig>) {
  return [
    {
      provide: BREADCRUMB_CONFIG,
      useFactory: () => ({ ...BREADCRUMB_DEFAULT_CONFIG, ...config }),
    },
  ];
}
