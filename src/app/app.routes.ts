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
  { path: 'cameras', component: CameraListComponent, canActivate: [authGuard] },
  { path: 'cameras/create', component: CameraCreateComponent, canActivate: [authGuard] },
  { path: 'cameras/edit/:id', component: CameraEditComponent, canActivate: [authGuard] },
  { path: 'cameras/view/:id', component: CameraViewComponent, canActivate: [authGuard] },
  { path: 'cameras/playback/:id', component: CameraPlaybackComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];