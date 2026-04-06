import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDropList, CdkDrag, CdkDragHandle, moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Camera } from '../../camera.model';
import { SettingsService } from '../settings.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-camera-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './camera-order-modal.component.html',
  styleUrl: './camera-order-modal.component.css'
})
export class CameraOrderModalComponent implements OnInit {
  @Input() cameras: Camera[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() orderUpdated = new EventEmitter<number[]>();

  orderedFavorites: Camera[] = [];
  availableForAdd: Camera[] = [];
  searchTerm: string = '';
  isSaving: boolean = false;

  constructor(
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  private loadFavorites() {
    const favorites: Camera[] = [];
    const available: Camera[] = [];

    // Separar favoritos de não-favoritos
    this.cameras.forEach(cam => {
      const priority = this.settingsService.getCameraPriority(cam.id);
      if (priority !== 999) {
        favorites.push(cam);
      } else {
        available.push(cam);
      }
    });

    this.orderedFavorites = favorites;
    this.updateAvailableList();
  }

  updateAvailableList() {
    const favoriteIds = this.orderedFavorites.map(c => c.id);
    const available = this.cameras.filter(c => !favoriteIds.includes(c.id));

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      this.availableForAdd = available.filter(c => c.name.toLowerCase().includes(term));
    } else {
      this.availableForAdd = available;
    }
  }

  onFavoriteDropped(event: CdkDragDrop<Camera[]>) {
    // Aplicar a reordenação no array
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.orderedFavorites, event.previousIndex, event.currentIndex);
    }
  }

  moveUp(index: number) {
    if (index > 0) {
      moveItemInArray(this.orderedFavorites, index, index - 1);
    }
  }

  moveDown(index: number) {
    if (index < this.orderedFavorites.length - 1) {
      moveItemInArray(this.orderedFavorites, index, index + 1);
    }
  }

  addFavorite(cameraId: number) {
    const camera = this.cameras.find(c => c.id === cameraId);
    if (camera && !this.orderedFavorites.find(c => c.id === cameraId)) {
      this.orderedFavorites.push(camera);
      this.updateAvailableList();
    }
  }

  removeFavorite(cameraId: number) {
    this.orderedFavorites = this.orderedFavorites.filter(c => c.id !== cameraId);
    this.updateAvailableList();
  }

  save() {
    if (this.isSaving) return;

    this.isSaving = true;
    const newOrder = this.orderedFavorites.map(c => c.id);

    // Atualizar prioridades localmente para refletir a nova ordem
    const cameraPriorities: { [id: number]: number } = {};
    newOrder.forEach((cameraId, index) => {
      cameraPriorities[cameraId] = index + 1; // 1º, 2º, 3º...
    });

    // Câmeras não-favoritas recebem 999
    this.cameras.forEach(cam => {
      if (!cameraPriorities[cam.id]) {
        cameraPriorities[cam.id] = 999;
      }
    });

    // Atualizar o settingsService com as novas prioridades
    const currentSettings = this.settingsService.currentSettings;
    currentSettings.interface.cameraPriorities = cameraPriorities;
    this.settingsService.updateSettings(currentSettings);

    // Sincronizar com backend
    this.settingsService.syncCameraOrderWithBackend().subscribe({
      next: () => {
        this.toastService.success('Ordem de câmeras salva com sucesso!');
        this.isSaving = false;
        // Fechar o modal após sucesso
        setTimeout(() => {
          this.closed.emit();
        }, 500);
      },
      error: (err) => {
        console.error('Error saving camera order:', err);
        this.toastService.error('Erro ao salvar ordem de câmeras.');
        this.isSaving = false;
      }
    });
  }

  onClose() {
    this.closed.emit();
  }

  onBackdropClick() {
    this.closed.emit();
  }
}
