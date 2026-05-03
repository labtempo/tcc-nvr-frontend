import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from './settings.service';
import { UserPreferencesService } from './user-preferences.service';
import { CameraOrderModalComponent } from './camera-order-modal/camera-order-modal.component';
import { ToastService } from '../shared/toast/toast.service';
import { CameraService } from '../camera';
import { Camera } from '../camera.model';
import { AuthService } from '../auth/auth';
import { UserCreateModalComponent } from './user-create-modal/user-create-modal.component';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, UserCreateModalComponent, CameraOrderModalComponent],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    settings: AppSettings;
    availableCameras: Camera[] = [];
    showFavoritesModal: boolean = false;
    showOrderingModal: boolean = false;
    modalSearchTerm: string = '';

    // MySQL Users
    users: any[] = [];
    showUserModal: boolean = false;

    // Deletion Modal
    showDeleteModal: boolean = false;
    userToDelete: any = null;

    // Edit Modal
    showEditModal: boolean = false;
    userToEdit: any = null;
    newPassword: string = '';
    confirmPassword: string = '';

    // Local copies for form binding to avoid strict mode issues
    retentionDays: number = 30;
    recordingSplitMinutes: number = 1;

    // Sync status
    isSyncingPreferences: boolean = false;

    constructor(
        private settingsService: SettingsService,
        private userPreferencesService: UserPreferencesService,
        private toastService: ToastService,
        private cameraService: CameraService,
        public authService: AuthService
    ) {
        this.settings = this.settingsService.currentSettings;
    }

    ngOnInit() {
        this.settingsService.settings$.subscribe(s => {
            this.settings = JSON.parse(JSON.stringify(s)); // Deep copy 
            this.retentionDays = this.settings.storage.retentionDays;
            this.recordingSplitMinutes = this.settings.storage.recordingSplitMinutes || 1;
        });

        // Load cameras purely for naming purposes in the priorities list
        this.loadCameras();

        // Load Users if Admin
        if (this.authService.isAdmin()) {
            this.loadUsers();
        }
    }

    loadCameras() {
        this.cameraService.getCameras().subscribe(cams => this.availableCameras = cams);
    }

    loadUsers() {
        this.authService.getUsers().subscribe({
            next: (data) => this.users = data,
            error: (err) => console.error("Error loading users", err)
        });
    }

    saveSettings() {
        // Update individual bound fields back to object
        this.settings.storage.retentionDays = this.retentionDays;
        this.settings.storage.recordingSplitMinutes = this.recordingSplitMinutes;

        this.settingsService.updateSettings(this.settings);

        // Sincronizar preferências de câmeras com o backend
        this.isSyncingPreferences = true;
        this.settingsService.syncCameraOrderWithBackend()
            .pipe(
                finalize(() => {
                    this.isSyncingPreferences = false;
                })
            )
            .subscribe({
                next: () => {
                    this.toastService.success('Configurações e preferências de câmeras salvas com sucesso!');
                },
                error: (err) => {
                    console.error('Error syncing camera preferences:', err);
                    this.toastService.error('Configurações salvas, mas não foi possível sincronizar preferências.');
                }
            });
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

        // Persist locally first for immediate UI feedback
        this.settingsService.setCameraPriority(id, current);

        // Sincronizar com o backend em background
        this.settingsService.syncCameraOrderWithBackend()
            .subscribe({
                next: () => {
                    // Silenciosamente sincronizado
                },
                error: (err) => {
                    console.error('Error syncing camera favorite:', err);
                    this.toastService.error('Favorito salvo localmente, mas falha ao sincronizar com servidor.');
                }
            });
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

    // Ordering Modal Methods
    openOrderingModal() {
        this.showOrderingModal = true;
    }

    closeOrderingModal() {
        this.showOrderingModal = false;
        // Recarregar câmeras para refletir possíveis mudanças
        this.loadCameras();
    }

    onCameraOrderUpdated(newOrder: number[]) {
        // Atualizar cameraPriorities baseado na nova ordem
        const cameraPriorities: { [id: number]: number } = {};
        newOrder.forEach((cameraId, index) => {
            cameraPriorities[cameraId] = index + 1; // 1, 2, 3...
        });

        // Câmeras não sorteadas recebem prioridade 999
        this.availableCameras.forEach(cam => {
            if (!cameraPriorities[cam.id]) {
                cameraPriorities[cam.id] = 999;
            }
        });

        // Atualizar settings
        this.settings.interface.cameraPriorities = cameraPriorities;
        this.settingsService.updateSettings(this.settings);
    }

    // User Modal Actions
    openUserModal() {
        this.showUserModal = true;
    }

    onUserCreated() {
        this.loadUsers();
    }

    // User Deletion Actions
    openDeleteModal(user: any) {
        this.userToDelete = user;
        this.showDeleteModal = true;
    }

    cancelDelete() {
        this.showDeleteModal = false;
        this.userToDelete = null;
    }

    confirmDelete() {
        if (!this.userToDelete) return;

        this.authService.deleteUser(this.userToDelete.id).subscribe({
            next: () => {
                this.toastService.success(`Usuário ${this.userToDelete.full_name} removido com sucesso.`);
                this.loadUsers(); // Reload list
                this.cancelDelete();
            },
            error: (err) => {
                console.error("Error deleting user", err);
                this.toastService.error("Erro ao remover usuário.");
                this.cancelDelete();
            }
        });
    }

    // User Edit Actions
    openEditModal(user: any) {
        this.userToEdit = user;
        this.newPassword = '';
        this.confirmPassword = '';
        this.showEditModal = true;
    }

    cancelEdit() {
        this.showEditModal = false;
        this.userToEdit = null;
        this.newPassword = '';
        this.confirmPassword = '';
    }

    confirmEdit() {
        if (!this.userToEdit) return;

        // Validações
        if (!this.newPassword) {
            this.toastService.error("Por favor, insira uma nova senha.");
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.toastService.error("As senhas não conferem.");
            return;
        }

        if (this.newPassword.length < 6) {
            this.toastService.error("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        this.authService.updateUserPassword(this.userToEdit.id, this.newPassword).subscribe({
            next: () => {
                this.toastService.success(`Senha de ${this.userToEdit.full_name} alterada com sucesso.`);
                this.loadUsers();
                this.cancelEdit();
            },
            error: (err) => {
                console.error("Error updating user password", err);
                this.toastService.error("Erro ao atualizar senha do usuário.");
                this.cancelEdit();
            }
        });
    }
}
