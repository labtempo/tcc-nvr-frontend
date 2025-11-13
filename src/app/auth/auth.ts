import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1'; 

  constructor(private http: HttpClient, private loadingService: LoadingService) { }

  login(email: string, password: string): Observable<any> {
    this.loadingService.show();
    const loginData = { email, password };
    
    return this.http.post<any>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_id', response.user_id);
        }),
        finalize(() => this.loadingService.hide())
      );
  }

  register(email: string, fullName: string, password: string): Observable<any> {
    this.loadingService.show();
    const registerData = { email, full_name: fullName, password };
    return this.http.post<any>(`${this.apiUrl}/usuarios`, registerData)
      .pipe(
        finalize(() => this.loadingService.hide())
      );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
  }

  getUserId(): number | null {
  const userId = localStorage.getItem('user_id');
  return userId ? Number(userId) : null;
}
}