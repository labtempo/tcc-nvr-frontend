import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface UserPreferences {
  id?: number;
  user_id?: number;
  camera_order: number[];
  updated_at?: string;
}

/**
 * UserPreferencesService
 * 
 * Sincroniza as preferências do usuário com o backend.
 * Gerencia a ordem de câmeras que o usuário selecionou como favoritas.
 * 
 * Endpoints:
 * - GET /users/me/preferences
 * - PUT /users/me/preferences/camera-order
 */
@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private apiUrl = environment.apiUrl;
  private preferencesSubject = new BehaviorSubject<UserPreferences>({ camera_order: [] });
  preferences$ = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  /**
   * Carrega as preferências do usuário do backend
   */
  loadPreferences(): void {
    this.http.get<UserPreferences>(`${this.apiUrl}/users/me/preferences`)
      .pipe(
        tap(prefs => {
          if (!prefs.camera_order) {
            prefs.camera_order = [];
          }
          this.preferencesSubject.next(prefs);
        }),
        catchError(err => {
          console.warn('Could not load user preferences:', err);
          // Se não conseguir carregar, usa array vazio
          this.preferencesSubject.next({ camera_order: [] });
          return of({ camera_order: [] });
        })
      )
      .subscribe();
  }

  /**
   * Retorna as preferências atuais
   */
  getCurrentPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  /**
   * Retém o array de IDs de câmeras na ordem de preferência do usuário
   */
  getCameraOrder(): number[] {
    return this.preferencesSubject.value.camera_order || [];
  }

  /**
   * Atualiza a ordem de câmeras no backend
   * 
   * @param cameraIds Array de IDs de câmeras na ordem desejada
   * @returns Observable da resposta do servidor
   */
  updateCameraOrder(cameraIds: number[]): Observable<UserPreferences> {
    const payload = { camera_ids: cameraIds };
    
    return this.http.put<UserPreferences>(
      `${this.apiUrl}/users/me/preferences/camera-order`,
      payload
    ).pipe(
      tap(response => {
        if (!response.camera_order) {
          response.camera_order = [];
        }
        this.preferencesSubject.next(response);
      }),
      catchError(err => {
        console.error('Error updating camera order:', err);
        throw err;
      })
    );
  }
}
