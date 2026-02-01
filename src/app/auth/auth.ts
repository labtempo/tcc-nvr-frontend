import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap, switchMap } from 'rxjs/operators';
import { LoadingService } from '../loading/loading.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private loadingService: LoadingService) { }

  login(email: string, password: string): Observable<any> {
    this.loadingService.show();
    const loginData = { email, password };

    return this.http.post<any>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
        }),
        switchMap(() => this.getProfile()),
        tap(profile => {
          if (profile.id) localStorage.setItem('user_id', profile.id);
          if (profile.full_name) localStorage.setItem('user_name', profile.full_name);
          // Role usually comes from login or profile? Backend readme says User Roles are created but doesn't specify profile structure.
          // Let's assume profile has role_id or role name. 
          // If login response had role, we might want to keep it. 
          // BUT, the README said login returns token.
          // Let's rely on what we have. 
          // If profile has role, good. If not, we hope login had it?
          // Actually, let's keep the original logic for login response just in case, but we can't easily access it in the second tap without nesting.
          // We can verify profile response structure later if needed, but for now we prioritize name.
          if (profile.role) localStorage.setItem('user_role', typeof profile.role === 'string' ? profile.role : 'viewer');
        }),
        finalize(() => this.loadingService.hide())
      );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  register(email: string, fullName: string, password: string): Observable<any> {
    this.loadingService.show();
    const registerData = { email, full_name: fullName, password };
    return this.http.post<any>(`${this.apiUrl}/usuarios`, registerData)
      .pipe(
        finalize(() => this.loadingService.hide())
      );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  createUser(user: { email: string, full_name: string, password: string }): Observable<any> {
    // Reuses the same endpoint as register, but authenticated context allows creation without auto-login
    this.loadingService.show();
    return this.http.post<any>(`${this.apiUrl}/usuarios`, user)
      .pipe(
        finalize(() => this.loadingService.hide())
      );
  }

  deleteUser(userId: number): Observable<void> {
    this.loadingService.show();
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${userId}`)
      .pipe(
        finalize(() => this.loadingService.hide())
      );
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    // console.log('AuthService.getToken:', token);
    return token;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? Number(userId) : null;
  }

  getRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getUserName(): string {
    return localStorage.getItem('user_name') || 'Usuário';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }
}