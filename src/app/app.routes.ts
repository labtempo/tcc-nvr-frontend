import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { CameraListComponent } from './camera-list/camera-list';
import { CameraCreateComponent } from './camera-create/camera-create';
import { CameraEditComponent } from './camera-edit/camera-edit';
import { authGuard } from './auth/auth-guard';
import { CameraViewComponent } from './camera-view/camera-view';
import { CameraPlaybackComponent } from './camera-playback/camera-playback';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    loadComponent: () => import('./layout/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/camera-grid/camera-grid.component').then(m => m.CameraGridComponent) },
      { path: 'cameras', component: CameraListComponent },
      { path: 'cameras/create', component: CameraCreateComponent },
      { path: 'cameras/edit/:id', component: CameraEditComponent },
      { path: 'cameras/view/:id', component: CameraViewComponent },
      { path: 'cameras/playback/:id', component: CameraPlaybackComponent },

    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];