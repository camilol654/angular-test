// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Lazy por componente standalone
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },

  // Lazy por grupo de rutas standalone
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
  },

  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES),
  },

  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES),
  },

  // Lazy + guard (canMatch)
  {
    path: 'admin',
    canMatch: [() => import('./services/admin.guard').then(g => g.adminOnlyGuard)],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  // 404 standalone
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
