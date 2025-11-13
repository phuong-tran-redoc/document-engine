import { Route } from '@angular/router';

export const EDITOR_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'test-advanced',
    pathMatch: 'full',
  },
  {
    path: 'basic',
    data: { breadcrumb: 'Basic' },
    loadComponent: () => import('./editor-basic').then((m) => m.EditorBasicComponent),
  },
  {
    path: 'restricted',
    data: { breadcrumb: 'Restricted Editing' },
    loadComponent: () => import('./editor-restricted').then((m) => m.EditorRestrictedComponent),
  },
  {
    path: 'table',
    data: { breadcrumb: 'Table' },
    loadComponent: () => import('./editor-table').then((m) => m.EditorTableComponent),
  },
  {
    path: 'full',
    data: { breadcrumb: 'Full Features' },
    loadComponent: () => import('./editor-full').then((m) => m.EditorFullComponent),
  },
  {
    path: 'readonly',
    data: { breadcrumb: 'Readonly' },
    loadComponent: () => import('./editor-readonly').then((m) => m.EditorReadonlyComponent),
  },
  // {
  //   path: 'document-builder',
  //   data: { breadcrumb: 'Document Builder' },
  //   loadComponent: () => import('./editor-document-builder').then((m) => m.EditorDocumentBuilderComponent),
  // },
  // {
  //   path: 'bizgrow',
  //   data: { breadcrumb: 'Bizgrow' },
  //   loadComponent: () => import('./lo-templates/lo-template-viewer').then((m) => m.LOTemplateViewerComponent),
  // },
  // {
  //   path: 'bizprop',
  //   data: { breadcrumb: 'Bizprop' },
  //   loadComponent: () => import('./lo-templates/lo-bizprop').then((m) => m.LOBizpropComponent),
  // },
  {
    path: 'test-advanced',
    data: { breadcrumb: 'Document Engine Advanced' },
    loadComponent: () => import('./editor-test-advanced').then((m) => m.EditorTestAdvancedComponent),
  },
];
