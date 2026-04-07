import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CdkDropList, CdkDrag, moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CameraFeedComponent } from '../camera-feed/camera-feed.component';
import { CameraService } from '../../camera';
import { Camera } from '../../camera.model';
import { SettingsService } from '../../settings/settings.service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-camera-grid',
  standalone: true,
  imports: [CommonModule, CameraFeedComponent, CdkDropList, CdkDrag],
  template: `
    <div class="page-layout">
      <div class="toolbar glass-panel">
         <span class="toolbar-label">LAYOUT:</span>
         <div class="btn-group">
           <button class="btn-tiny" [class.active]="gridSize===1" (click)="setGrid(1)" title="1x1">
             <div class="grid-icon grid-1"><span></span></div>
           </button>
           <button class="btn-tiny" [class.active]="gridSize===2" (click)="setGrid(2)" title="2x2">
             <div class="grid-icon grid-2">
               <span></span><span></span><span></span><span></span>
             </div>
           </button>
           <button class="btn-tiny" [class.active]="gridSize===3" (click)="setGrid(3)" title="3x3">
             <div class="grid-icon grid-3">
               <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
             </div>
           </button>
           <button class="btn-tiny" [class.active]="gridSize===4" (click)="setGrid(4)" title="4x4">
            <div class="grid-icon grid-4">
              <span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span>
            </div>
           </button>
           <button class="btn-tiny" [class.active]="gridSize===5" (click)="setGrid(5)" title="5x5">
            <div class="grid-icon grid-5">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
           </button>
         </div>
      </div>

      <div class="grid-container" [ngStyle]="gridStyle" cdkDropList [cdkDropListData]="cameras" (cdkDropListDropped)="onCameraDropped($event)" (cdkDragEnded)="onDragEnded()" [cdkDropListSortingDisabled]="true">
        <div class="grid-item" 
             *ngFor="let cam of cameras; let i = index" 
             cdkDrag 
             [cdkDragData]="i" 
             (cdkDragStarted)="onDragStarted($event)"
             (cdkDragMoved)="onDragMoved($event)"
             [class.target-position]="targetDropIndex === i && isDragging && draggedIndex !== i"
             [class.shift-away]="isDragging && draggedIndex !== null && shouldShiftAway(i)"
             [class.dragging-item]="draggedIndex === i && isDragging">
          <app-camera-feed 
            [name]="cam.name" 
            [status]="getStatus(cam)" 
            [hlsUrl]="''"
            [webrtcUrl]="cam.visualisation_url_webrtc || ''"
            [iframeUrl]="getIframeUrl(cam)"
            [rawUrl]="getRawUrl(cam)">
          </app-camera-feed>
          <!-- Explicit Overlay for Clicking -->
          <div class="click-overlay" (click)="viewCamera(cam)"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-layout {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .toolbar {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 50;
      padding: 0.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(0,0,0,0.8);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
    }
    
    .toolbar-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 1px;
    }

    .btn-group {
      display: flex;
      gap: 0.5rem;
    }

    .btn-tiny {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: var(--text-secondary);
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-tiny:hover {
      border-color: white;
      color: white;
      background: rgba(255,255,255,0.1);
    }

    .btn-tiny.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
      box-shadow: 0 0 10px var(--color-primary-glow);
    }

    .grid-icon {
      width: 20px;
      height: 20px;
      display: grid;
      gap: 1px;
    }
    
    .grid-icon span {
      background-color: currentColor;
      opacity: 0.8;
      border-radius: 1px;
    }

    .grid-1 { grid-template-columns: 1fr; }
    .grid-2 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); }
    .grid-5 { grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); }

    .grid-container {
      display: grid;
      /* Columns set via Binding, Rows auto */
      height: 100%;
      width: 100%;
      max-width: calc((100vh - 120px) * 1.777); 
      margin: 0 auto;
      gap: 4px;
      background: black;
      padding: 4px;
      overflow-y: auto; 
      align-content: start; 
    }

    .grid-item {
      background-color: #111;
      overflow: hidden;
      min-height: 0;
      border: 1px solid #333;
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      transition: all 0.3s ease;
    }

    .grid-item:hover {
      z-index: 10;
      transform: scale(1.02);
      box-shadow: 0 0 20px rgba(0,0,0,0.7);
      border-color: var(--color-primary);
    }

    .grid-item.target-position {
      background-color: rgba(59, 130, 246, 0.3) !important;
      border: 3px solid var(--color-primary) !important;
      box-shadow: 
        inset 0 0 30px rgba(59, 130, 246, 0.5), 
        0 0 25px rgba(59, 130, 246, 0.6),
        0 0 40px rgba(59, 130, 246, 0.4) !important;
      animation: targetPulse 0.6s ease-in-out infinite;
      z-index: 50 !important;
    }

    .grid-item.shift-away {
      opacity: 0.6;
      transform: scale(0.95);
      transition: all 0.25s ease-out;
      filter: brightness(0.8);
    }

    .grid-item.dragging-item {
      opacity: 0.4;
      z-index: 0;
    }

    @keyframes targetPulse {
      0%, 100% { 
        box-shadow: 
          inset 0 0 30px rgba(59, 130, 246, 0.5), 
          0 0 25px rgba(59, 130, 246, 0.6),
          0 0 40px rgba(59, 130, 246, 0.4);
      }
      50% { 
        box-shadow: 
          inset 0 0 50px rgba(59, 130, 246, 0.8), 
          0 0 35px rgba(59, 130, 246, 0.9),
          0 0 60px rgba(59, 130, 246, 0.6);
      }
    }

    .grid-item.cdk-drag-preview {
      opacity: 0.9;
      box-shadow: 0 10px 40px rgba(59, 130, 246, 0.6);
      border: 3px solid var(--color-primary);
      z-index: 1000;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.1) 100%);
      width: 200px !important;
      height: 112.5px !important;
      padding-top: 0 !important;
      position: relative !important;
    }

    .grid-item.cdk-drag-placeholder {
      opacity: 0 !important;
      display: none !important;
    }

    .grid-item.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .grid-item app-camera-feed {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
    }

    .click-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 20;
      cursor: pointer;
      background: transparent;
    }
  `]
})
export class CameraGridComponent implements OnInit {
  cameras: Camera[] = [];
  gridSize: number = 2;
  urlCache: Map<number, SafeResourceUrl> = new Map();
  rawUrlCache: Map<number, string> = new Map();

  isSavingOrder: boolean = false;
  targetDropIndex: number | null = null;
  isDragging: boolean = false;
  draggedIndex: number | null = null;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private cameraService: CameraService,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.applySettings();
    this.loadCameras();

    this.settingsService.settings$.subscribe(() => {
      this.applySettings();
      this.sortCameras();
    });
  }

  applySettings() {
    const settings = this.settingsService.currentSettings;

    switch (settings.interface.defaultGrid) {
      case '1x1': this.gridSize = 1; break;
      case '2x2': this.gridSize = 2; break;
      case '3x3': this.gridSize = 3; break;
      case '4x4': this.gridSize = 4; break;
      case '5x5': this.gridSize = 5; break;
      default: this.gridSize = 2;
    }
  }

  loadCameras() {
    this.cameraService.getCameras().subscribe({
      next: (data) => {
        this.cameras = data;
        this.updateUrlCache(); // Logic from feat/dashboard
        this.sortCameras();    // Logic from feat/settings-page
      },
      error: (err) => console.error(err)
    });
  }

  updateUrlCache() {
    this.cameras.forEach(cam => {
      // Use path_id from database instead of formatting the name
      // This ensures the URL matches the backend streaming path
      const liveUrl = cam.path_id_low ? `http://localhost:8889/${cam.path_id_low}/` : '';

      if (liveUrl && !this.urlCache.has(cam.id)) {
        this.urlCache.set(cam.id, this.sanitizer.bypassSecurityTrustResourceUrl(liveUrl));
        this.rawUrlCache.set(cam.id, liveUrl);
      }
    });
  }

  sortCameras() {
    if (!this.cameras) return;
    this.cameras.sort((a, b) => {
      const pA = this.settingsService.getCameraPriority(a.id);
      const pB = this.settingsService.getCameraPriority(b.id);

      if (pA !== pB) return pA - pB;

      return a.name.localeCompare(b.name);
    });
  }

  viewCamera(cam: Camera) {
    this.router.navigate(['/cameras/view', cam.id]);
  }

  getIframeUrl(cam: Camera): SafeResourceUrl | null {
    return this.urlCache.get(cam.id) || null;
  }

  getRawUrl(cam: Camera): string {
    return this.rawUrlCache.get(cam.id) || '';
  }

  setGrid(size: number) {
    this.gridSize = size;
    // Persistir a mudança de grid nas settings
    const currentSettings = this.settingsService.currentSettings;
    const gridMap = { 1: '1x1', 2: '2x2', 3: '3x3', 4: '4x4', 5: '5x5' } as any;
    currentSettings.interface.defaultGrid = gridMap[size] as any;
    this.settingsService.updateSettings(currentSettings);
  }

  get gridStyle() {
    return {
      'grid-template-columns': `repeat(${this.gridSize}, 1fr)`
    };
  }

  getStatus(cam: Camera): string {
    return (cam.name) ? 'LIVE' : 'OFFLINE';
  }

  onDragStarted(event: any) {
    this.isDragging = true;
    this.draggedIndex = event.source.data;
    console.log('Drag started - draggedIndex:', this.draggedIndex, 'isDragging:', this.isDragging);
  }

  onDragMoved(event: any) {
    if (!event.pointerPosition) return;

    const gridContainer = document.querySelector('.grid-container') as HTMLElement;
    if (!gridContainer) return;

    const gridItems = Array.from(gridContainer.querySelectorAll('.grid-item')) as HTMLElement[];
    
    let closestIndex = 0;
    let closestDistance = Infinity;

    gridItems.forEach((item, idx) => {
      // Excluir o item sendo draggado do cálculo
      if (idx === this.draggedIndex) return;

      const rect = item.getBoundingClientRect();
      
      // Posição do centro do item em coordenadas absolutas
      const itemCenterX = rect.left + rect.width / 2;
      const itemCenterY = rect.top + rect.height / 2;
      
      // Posição do ponteiro em coordenadas absolutas
      const cursorX = event.pointerPosition.x;
      const cursorY = event.pointerPosition.y;
      
      const distance = Math.hypot(
        cursorX - itemCenterX,  
        cursorY - itemCenterY
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    console.log('onDragMoved - closestIndex:', closestIndex, 'draggedIndex:', this.draggedIndex, 'isDragging:', this.isDragging);
    this.targetDropIndex = closestIndex;
  }

  onDragEnded() {
    this.isDragging = false;
    this.targetDropIndex = null;
    this.draggedIndex = null;
  }

  shouldShiftAway(index: number): boolean {
    if (this.draggedIndex === null || this.targetDropIndex === null) return false;
    
    // Se o índice está entre o dragged e o target, fazer shift
    const minIndex = Math.min(this.draggedIndex, this.targetDropIndex);
    const maxIndex = Math.max(this.draggedIndex, this.targetDropIndex);
    
    // Câmeras no caminho do reordenamento ficam fora do caminho
    return index > minIndex && index <= maxIndex && index !== this.draggedIndex;
  }

  onCameraDropped(event: CdkDragDrop<Camera[]>) {
    const gridContainer = event.container.element.nativeElement as HTMLElement;
    const gridItems = Array.from(gridContainer.querySelectorAll('.grid-item')) as HTMLElement[];
    
    // Usar o draggedIndex que salvamos, não o event.previousIndex
    const fromIndex = this.draggedIndex !== null ? this.draggedIndex : event.previousIndex;
    
    let targetIndex = fromIndex;
    let closestDistance = Infinity;

    gridItems.forEach((item, idx) => {
      // Excluir o item sendo draggado
      if (idx === fromIndex) return;

      const rect = item.getBoundingClientRect();
      
      // Posição do centro do item em coordenadas absolutas
      const itemCenterX = rect.left + rect.width / 2;
      const itemCenterY = rect.top + rect.height / 2;
      
      // Posição do drop em coordenadas absolutas
      const dropX = event.dropPoint.x;
      const dropY = event.dropPoint.y;
      
      const distance = Math.hypot(
        dropX - itemCenterX,
        dropY - itemCenterY
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        targetIndex = idx;
      }
    });

    console.log('Drop: fromIndex:', fromIndex, 'targetIndex:', targetIndex);
    this.targetDropIndex = null;
    this.isDragging = false;
    this.draggedIndex = null;
    
    if (fromIndex !== targetIndex) {
      // Reordenar no array local
      moveItemInArray(this.cameras, fromIndex, targetIndex);
      
      // Atualizar prioridades com base na nova ordem
      const cameraPriorities: { [id: number]: number } = {};
      this.cameras.forEach((cam, index) => {
        cameraPriorities[cam.id] = index + 1; // 1º, 2º, 3º...
      });

      // Atualizar settingsService com as novas prioridades
      const currentSettings = this.settingsService.currentSettings;
      currentSettings.interface.cameraPriorities = cameraPriorities;
      this.settingsService.updateSettings(currentSettings);

      // Auto-save para backend
      this.saveOrder();
    }
  }

  saveOrder() {
    if (this.isSavingOrder) return;

    this.isSavingOrder = true;

    this.settingsService.syncCameraOrderWithBackend().subscribe({
      next: () => {
        console.log('Ordem de câmeras salva com sucesso!');
        this.isSavingOrder = false;
      },
      error: (err) => {
        console.error('Erro ao salvar ordem de câmeras:', err);
        this.toastService.error('Erro ao salvar nova ordem de câmeras.');
        this.isSavingOrder = false;
      }
    });
  }

}
