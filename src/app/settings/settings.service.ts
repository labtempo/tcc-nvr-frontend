import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserPreferencesService } from './user-preferences.service';

export interface AppSettings {
    general: {
        theme: 'cyber-slate' | 'light';
        language: 'pt-BR' | 'en-US';
    };
    interface: {
        defaultGrid: '1x1' | '2x2' | '3x3' | '4x4' | '5x5';
        autoplay: boolean;
        cameraPriorities: { [id: number]: number };
    };
    storage: {
        retentionDays: number;
        recordingSplitMinutes: number; // New split option
        autoCleanup: boolean;
    };
    system: {
        streamQuality: 'high' | 'low';
    };
}

const DEFAULT_SETTINGS: AppSettings = {
    general: {
        theme: 'cyber-slate',
        language: 'pt-BR'
    },
    interface: {
        defaultGrid: '2x2',
        autoplay: true,
        cameraPriorities: {}
    },
    storage: {
        retentionDays: 30,
        recordingSplitMinutes: 1,
        autoCleanup: true
    },
    system: {
        streamQuality: 'high'
    }
};

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private settingsSubject = new BehaviorSubject<AppSettings>(this.loadSettings());
    settings$ = this.settingsSubject.asObservable();

    constructor(private userPreferencesService: UserPreferencesService) {
        this.initializePreferences();
    }

    /**
     * Inicializa as preferências a partir do UserPreferencesService (backend)
     * e carrega o mapa de prioridades de câmeras
     */
    private initializePreferences(): void {
        this.userPreferencesService.preferences$.subscribe(prefs => {
            if (prefs.camera_order && prefs.camera_order.length > 0) {
                // Converter array camera_order para mapa cameraPriorities
                const cameraPriorities: { [id: number]: number } = {};
                prefs.camera_order.forEach((cameraId, index) => {
                    cameraPriorities[cameraId] = index + 1; // 1, 2, 3, ... (favoritos em ordem)
                });

                // Atualizar as settings com as prioridades do backend
                const current = this.settingsSubject.value;
                const updated = {
                    ...current,
                    interface: {
                        ...current.interface,
                        cameraPriorities: cameraPriorities
                    }
                };
                this.settingsSubject.next(updated);
                // Não salvar no localStorage aqui - deixar o usuário controlar
            }
        });
    }

    private loadSettings(): AppSettings {
        const stored = localStorage.getItem('app_settings');
        const parsed = stored ? JSON.parse(stored) : {};

        // Merge deeply to ensure new fields like cameraPriorities exist
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            interface: { ...DEFAULT_SETTINGS.interface, ...parsed.interface },
            storage: { ...DEFAULT_SETTINGS.storage, ...parsed.storage }
        };
    }

    updateSettings(newSettings: Partial<AppSettings>) {
        const current = this.settingsSubject.value;
        const updated = { ...current, ...newSettings };

        this.settingsSubject.next(updated);
        localStorage.setItem('app_settings', JSON.stringify(updated));
    }

    get currentSettings() {
        return this.settingsSubject.value;
    }

    // --- Priority System ---

    getCameraPriority(id: number): number {
        const map = this.settingsSubject.value.interface.cameraPriorities || {};
        return map[id] !== undefined ? map[id] : 999;
    }

    setCameraPriority(id: number, priority: number) {
        const current = this.settingsSubject.value;
        const priorities = { ...(current.interface.cameraPriorities || {}), [id]: priority };

        // Create new settings object deeply to trigger observables
        const newSettings = {
            ...current,
            interface: {
                ...current.interface,
                cameraPriorities: priorities
            }
        };

        this.updateSettings(newSettings);
    }

    /**
     * Sincroniza a ordem de câmeras com o backend
     * Converte o mapa de prioridades para um array ordenado de IDs
     * 
     * @returns Observable que completa quando a sincronização termina
     */
    syncCameraOrderWithBackend() {
        const priorities = this.settingsSubject.value.interface.cameraPriorities || {};
        
        // Converter mapa de prioridades para array de IDs ordenado
        // Prioridade 1, 2, 3... são favoritos em ordem
        // Prioridade 999 são normais (não sincronizados)
        const cameraOrder = Object.entries(priorities)
            .filter(([_, priority]) => priority !== 999) // Pegar apenas os favoritos
            .sort((a, b) => a[1] - b[1]) // Ordenar por prioridade
            .map(([id, _]) => parseInt(id, 10));

        return this.userPreferencesService.updateCameraOrder(cameraOrder);
    }
}
