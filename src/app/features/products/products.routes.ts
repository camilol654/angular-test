// src/features/products/products.routes.ts
import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/list.component').then(c => c.ListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./form/form.component').then(c => c.FormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./form/form.component').then(c => c.FormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/detail.component').then(c => c.DetailComponent),
  },
];
