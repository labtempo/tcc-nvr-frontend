import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { CameraListComponent } from './camera-list/camera-list';
import { CameraCreateComponent } from './camera-create/camera-create';
import { CameraEditComponent } from './camera-edit/camera-edit';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cameras', component: CameraListComponent },
  { path: 'cameras/create', component: CameraCreateComponent },
  { path: 'cameras/edit/:id', component: CameraEditComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];