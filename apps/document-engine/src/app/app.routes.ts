import { Route } from '@angular/router';
import { ROUTE } from '@document-engine/util';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ROUTE.HOME,
  },

  // Feature routes
  {
    path: '',
    // canActivate: [authGuard],
    // canActivateChild: [authGuard],
    data: { layout: 'classic' },
    children: [
      {
        path: ROUTE.HOME,
        data: { breadcrumb: 'Home' },
        loadComponent: () => import('@document-engine/home').then((m) => m.HomePageComponent),
      },
      // {
      //   path: ROUTE.ASSETS,
      //   data: { breadcrumb: 'Assets' },
      //   loadChildren: () => import('@dashboard/features/assets').then((m) => m.ASSETS_ROUTES),
      // },
      {
        path: ROUTE.EDITOR,
        data: { breadcrumb: 'Demo' },
        loadChildren: () => import('@document-engine/demo').then((m) => m.EDITOR_ROUTES),
      },
      {
        path: ROUTE.TEMPLATE,
        data: { breadcrumb: 'Template' },
        loadChildren: () => import('@document-engine/template').then((m) => m.TEMPLATE_ROUTES),
      },
      {
        path: ROUTE.CONTACT,
        data: { breadcrumb: 'About' },
        loadComponent: () => import('@document-engine/contact').then((m) => m.ContactPageComponent),
      },
      // {
      //   path: ROUTE.PLAYGROUND,
      //   data: { breadcrumb: 'Playground' },
      //   loadComponent: () => import('@dashboard/features/playground').then((m) => m.Playground),
      // },
    ],
  },
  // {
  //   path: '',
  //   // canActivate: [noAuthGuard],
  //   // canActivateChild: [noAuthGuard],
  //   data: { layout: 'empty' },
  //   children: [
  //     {
  //       path: ROUTE.LOGIN,
  //       data: { breadcrumb: 'Login' },
  //       loadComponent: () => import('@dashboard/features/auth').then((m) => m.LoginComponent),
  //     },
  //   ],
  // },

  // Testing routes (empty layout for E2E tests)
  {
    path: '',
    data: { layout: 'empty' },
    children: [
      {
        path: 'test-bench',
        loadComponent: () => import('@document-engine/test-bench').then((m) => m.TestBenchComponent),
      },
      {
        path: 'test-bench/table',
        loadComponent: () => import('@document-engine/test-bench').then((m) => m.TableTestBenchComponent),
      },
      {
        path: 'test-bench/dynamic-field',
        loadComponent: () => import('@document-engine/test-bench').then((m) => m.DynamicFieldTestBenchComponent),
      },
      {
        path: 'test-bench/toolbar',
        loadComponent: () => import('@document-engine/test-bench').then((m) => m.ToolbarTestBenchComponent),
      },
      {
        path: 'test-bench/template',
        loadComponent: () => import('@document-engine/test-bench').then((m) => m.TemplateTestBenchComponent),
      },
      {
        path: 'test-bench/tiptap-editor',
        loadComponent: () => import('@document-engine/test-bench').then((m) => m.TiptapEditorTestBenchComponent),
      },
    ],
  },

  // Error routes
  {
    path: '',
    data: { layout: 'empty' },
    children: [
      // {
      //   path: ROUTE.LOGOUT,
      //   data: { breadcrumb: 'Logout' },
      //   loadComponent: () => import('@document-engine/auth').then((m) => m.LogoutComponent),
      // },
      {
        path: ROUTE.ERROR.FORBIDDEN,
        data: { breadcrumb: 'Forbidden' },
        loadComponent: () => import('@document-engine/http-error').then((m) => m.Error403Component),
      },
      {
        path: ROUTE.ERROR.NOT_FOUND,
        data: { breadcrumb: 'Not Found' },
        loadComponent: () => import('@document-engine/http-error').then((m) => m.Error404Component),
      },
    ],
  },
  {
    path: '**',
    redirectTo: ROUTE.ERROR.NOT_FOUND,
  },
];
