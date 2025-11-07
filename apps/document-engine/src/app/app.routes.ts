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
        data: { breadcrumb: 'Editor' },
        loadChildren: () => import('@document-engine/demo').then((m) => m.EDITOR_ROUTES),
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
