import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'weather-dashboard',
    loadComponent: () =>
      import('./routes/weather-dashboard/weather-dashboard.component').then(
        (m) => m.WeatherDashboardComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'weather-dashboard',
    pathMatch: 'full',
  },
];
