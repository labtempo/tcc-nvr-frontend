import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth';
import { environment } from '../environments/environment';
import { Camera } from './camera.model';

export interface RecordingSegment {
  start: string;
  duration: number;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getCameras(): Observable<Camera[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Camera[]>(`${this.apiUrl}/camera/user/${userId}`);
  }

  createCamera(camera: Partial<Camera>): Observable<Camera> {
    const userId = this.authService.getUserId();
    const cameraWithUser = { ...camera, created_by_user_Id: userId };
    return this.http.post<Camera>(`${this.apiUrl}/camera`, cameraWithUser);
  }

  updateCamera(id: number, camera: Partial<Camera>): Observable<Camera> {
    return this.http.put<Camera>(`${this.apiUrl}/camera/${id}`, camera);
  }

  deleteCamera(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/camera/${id}`);
  }

  getCameraById(id: number): Observable<Camera> {
    return this.http.get<Camera>(`${this.apiUrl}/camera/${id}`);
  }

  getRecordings(id: number, start?: string, end?: string): Observable<RecordingSegment[]> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);

    return this.http.get<RecordingSegment[]>(`${this.apiUrl}/camera/${id}/recordings`, {
      params: params
    });
  }

  getPlaybackUrl(id: number, start: string, duration: number): Observable<{ playbackUrl: string }> {
    const params = new HttpParams()
      .set('start', start)
      .set('duration', duration.toString());

    return this.http.get<{ playbackUrl: string }>(`${this.apiUrl}/camera/${id}/playback-url`, {
      params: params
    });
  }

  getApiBaseUrl(): string {
    return this.apiUrl;
  }

  static formatName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^\w_]/g, '');
  }
}