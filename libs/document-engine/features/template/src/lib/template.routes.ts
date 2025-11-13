import { Route } from '@angular/router';

export const TEMPLATE_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'document-builder',
    pathMatch: 'full',
  },
  {
    path: 'document-builder',
    data: { breadcrumb: 'Document Builder' },
    loadComponent: () => import('./document-builder').then((m) => m.DocumentBuilderComponent),
  },
  {
    path: 'template-a',
    data: { breadcrumb: 'Template A' },
    loadComponent: () => import('./template-a').then((m) => m.TemplateAComponent),
  },
  {
    path: 'template-b',
    data: { breadcrumb: 'Template B' },
    loadComponent: () => import('./template-b').then((m) => m.TemplateBComponent),
  },
];

