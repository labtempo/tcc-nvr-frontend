import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return { 'Authorization': `Bearer ${token}` };
  }

  getCameras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cameras`, { headers: this.getAuthHeaders() });
  }

  createCamera(camera: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cameras`, camera, { headers: this.getAuthHeaders() });
  }

  updateCamera(id: number, camera: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cameras/${id}`, camera, { headers: this.getAuthHeaders() });
  }

  deleteCamera(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cameras/${id}`, { headers: this.getAuthHeaders() });
  }
}