import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecordingSegment {
  start: string;
  duration: number;
  url: string;
}

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
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        return new Observable(observer => observer.error('User not logged in'));
    }
    return this.http.get<any[]>(`${this.apiUrl}/camera/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  createCamera(camera: any): Observable<any> {
  const userId = localStorage.getItem('user_id');
  const cameraWithUser = { ...camera, created_by_user_Id: userId };
  return this.http.post<any>(`${this.apiUrl}/camera`, cameraWithUser, { headers: this.getAuthHeaders() });
}

  updateCamera(id: number, camera: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cameras/${id}`, camera, { headers: this.getAuthHeaders() });
  }

  deleteCamera(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cameras/${id}`, { headers: this.getAuthHeaders() });
  }

  getCameraById(id: number): Observable<any> {
   return this.http.get<any>(`${this.apiUrl}/camera/${id}`);
  }

  getRecordings(id: number, start?: string, end?: string): Observable<RecordingSegment[]> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);

    return this.http.get<RecordingSegment[]>(`${this.apiUrl}/camera/${id}/recordings`, { 
      headers: this.getAuthHeaders(),
      params: params 
    });
  }

  getPlaybackUrl(id: number, start: string, duration: number): Observable<{ playbackUrl: string }> {
    const params = new HttpParams()
      .set('start', start)
      .set('duration', duration.toString());

    return this.http.get<{ playbackUrl: string }>(`${this.apiUrl}/camera/${id}/playback-url`, { 
      headers: this.getAuthHeaders(),
      params: params 
    });
  }

  getApiBaseUrl(): string {
    return this.apiUrl;
  }

}