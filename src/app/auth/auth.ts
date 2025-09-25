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
        })
      );
  }

  register(email: string, fullName: string, password: string): Observable<any> {
    const registerData = { email, full_name: fullName, password };
    return this.http.post<any>(`${this.apiUrl}/usuarios`, registerData);
  }
}