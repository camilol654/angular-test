import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboards/dashboards.component').then(c => c.DashboardsComponent),
  },
];