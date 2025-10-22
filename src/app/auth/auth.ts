import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1'; 

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    
    const loginData = { email, password };
    
    return this.http.post<any>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_id', response.user_id);
        })
      );
  }

  register(email: string, fullName: string, password: string): Observable<any> {
    const registerData = { email, full_name: fullName, password };
    return this.http.post<any>(`${this.apiUrl}/usuarios`, registerData);
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