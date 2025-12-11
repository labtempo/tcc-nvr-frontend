import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppSettings {
    general: {
        theme: 'cyber-slate' | 'light';
        language: 'pt-BR' | 'en-US';
    };
    interface: {
        defaultGrid: '2x2' | '3x3' | '4x4';
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

    constructor() { }

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
}
