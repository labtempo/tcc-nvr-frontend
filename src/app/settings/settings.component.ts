import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from './settings.service';
import { ToastService } from '../shared/toast/toast.service';
import { CameraService } from '../camera';
import { Camera } from '../camera.model';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    settings: AppSettings;
    availableCameras: Camera[] = [];
    showFavoritesModal: boolean = false;
    modalSearchTerm: string = '';


    // Local copies for form binding to avoid strict mode issues
    retentionDays: number = 30;

    constructor(
        private settingsService: SettingsService,
        private toastService: ToastService,
        private cameraService: CameraService
    ) {
        this.settings = this.settingsService.currentSettings;
    }

    ngOnInit() {
        this.settingsService.settings$.subscribe(s => {
            this.settings = JSON.parse(JSON.stringify(s)); // Deep copy 
            this.retentionDays = this.settings.storage.retentionDays;
        });

        // Load cameras purely for naming purposes in the priorities list
        this.cameraService.getCameras().subscribe(cams => this.availableCameras = cams);
    }

    saveSettings() {
        // Update individual bound fields back to object
        this.settings.storage.retentionDays = this.retentionDays;

        this.settingsService.updateSettings(this.settings);
        this.toastService.success('Configurações salvas com sucesso!');
    }

    resetDefaults() {
        if (confirm('Restaurar configurações padrão?')) {
            localStorage.removeItem('app_settings');
            window.location.reload();
        }
    }

    // Priority/Favorites Helpers
    isFavorite(id: number): boolean {
        return (this.settings.interface.cameraPriorities || {})[id] === 1;
    }

    toggleFavorite(id: number) {
        const current = this.isFavorite(id) ? 999 : 1;
        // Update local object immediately for UI feedback
        if (!this.settings.interface.cameraPriorities) this.settings.interface.cameraPriorities = {};
        this.settings.interface.cameraPriorities[id] = current;

        // Persist
        this.settingsService.setCameraPriority(id, current);
    }

    // Modal Actions
    openFavoritesModal() {
        this.showFavoritesModal = true;
    }

    closeFavoritesModal() {
        this.showFavoritesModal = false;
        this.modalSearchTerm = '';
    }

    get filteredModalCameras() {
        if (!this.modalSearchTerm) return this.availableCameras;
        const term = this.modalSearchTerm.toLowerCase();
        return this.availableCameras.filter(c => c.name.toLowerCase().includes(term));
    }

    get hiddenFavoritesCount() {
        return this.availableCameras.filter(c => this.isFavorite(c.id)).length;
    }
}
