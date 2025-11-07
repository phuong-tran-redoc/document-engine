import { BreadcrumbSeparator } from './breadcrumb.type';

export interface BreadcrumbConfig {
  maxItems: number;
  mobileMaxItems: number;
  showHomeIcon: boolean;
  separator: BreadcrumbSeparator;
}
