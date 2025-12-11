import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CameraService } from '../camera';
import { Camera } from '../camera.model';

@Component({
  selector: 'app-camera-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">

      <div class="page-header glass-panel">
        <div class="header-content">
          <div>
            <h2 class="section-title">Gerenciamento de Câmeras</h2>
            <p class="section-subtitle">{{ filteredCameras.length }} câmeras encontradas</p>
          </div>
          
          <div class="actions-bar">

            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input type="text" 
                     class="form-control Search-input" 
                     placeholder="Buscar por nome ou IP..."
                     [(ngModel)]="searchTerm"
                     (input)="applyFilters()">
            </div>


             <div class="filter-group">
               <button class="btn btn-sm btn-filter" 
                       [class.active]="filterStatus === 'ALL'" 
                       (click)="setFilter('ALL')">Todos</button>
               <button class="btn btn-sm btn-filter" 
                       [class.active]="filterStatus === 'RECORDING'" 
                       (click)="setFilter('RECORDING')">
                       <span class="dot live"></span>Gravando
               </button>
               <button class="btn btn-sm btn-filter" 
                       [class.active]="filterStatus === 'STOPPED'" 
                       (click)="setFilter('STOPPED')">
                       <span class="dot offline"></span>Parado
               </button>
             </div>


            <button [routerLink]="['/cameras/create']" class="btn btn-primary">
              <i class="bi bi-plus-lg"></i>
              Nova Câmera
            </button>
          </div>
        </div>
      </div>


      <div class="camera-list">

        <div class="list-header">
           <div class="col-preview">PREVIEW</div>
           <div class="col-name">NOME</div>
           <div class="col-status">STATUS</div>
           <div class="col-rtsp">RTSP URL</div>
           <div class="col-actions">AÇÕES</div>
        </div>


        <div class="list-item glass-panel" *ngFor="let cam of filteredCameras">

          <div class="col-preview">
            <div class="preview-thumb">
               <i class="bi bi-camera-video"></i>
            </div>
          </div>


          <div class="col-name">
            <span class="cam-name">{{ cam.name }}</span>
          </div>


          <div class="col-status">
            <span class="status-badge" [class.live]="cam.is_recording" [class.offline]="!cam.is_recording">
               <span class="dot"></span>
               {{ cam.is_recording ? 'Gravando' : 'Parado' }}
            </span>
          </div>


          <div class="col-rtsp">
            {{ getMaskedUrl(cam.rtsp_url) }}
          </div>


          <div class="col-actions">
            <button class="btn-icon" title="Ver ao Vivo" [routerLink]="['/cameras/view', cam.id]">
               <i class="bi bi-eye"></i>
            </button>
            <button class="btn-icon" title="Gravações" [routerLink]="['/cameras/playback', cam.id]">
               <i class="bi bi-film"></i>
            </button>
            <button class="btn-icon" title="Editar" [routerLink]="['/cameras/edit', cam.id]">
               <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-icon danger" title="Excluir" (click)="deleteCamera(cam.id)">
               <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>


        <div *ngIf="filteredCameras.length === 0" class="empty-state">
            <i class="bi bi-camera-video-off"></i>
            <p>Nenhuma câmera encontrada para os filtros selecionados.</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;
      max-width: 1400px;
      margin: 0 auto;
    }


    .page-header {
      padding: 1rem 1.5rem; /* Reduced padding */
      border-radius: 12px;
      margin-bottom: 1.5rem; /* Reduced margin */
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.25rem; /* Reduced size */
      color: #ffffff;
      margin-bottom: 0.125rem;
    }

    .section-subtitle {
      color: #94a3b8; /* Light slate */
      font-size: 0.875rem;
      margin: 0;
    }

    .actions-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }


    .search-wrapper {
      position: relative;
      width: 300px;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .Search-input {
      padding-left: 35px;
      background-color: rgba(255,255,255,0.05); /* Slightly lighter background */
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .Search-input::placeholder {
      color: #94a3b8; /* Visible placeholder */
      opacity: 1;
    }


    .filter-group {
      display: flex;
      background: rgba(0,0,0,0.1); /* More transparent */
      padding: 3px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.05); /* Subtler border */
    }

    .btn-filter {
      background: transparent;
      color: #94a3b8;
      border: none;
      padding: 4px 10px; /* Smaller button */
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-filter.active {
      background-color: rgba(59, 130, 246, 0.5); /* More transparent active state */
      color: white;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .btn-filter:hover:not(.active) {
       color: #ffffff;
       background-color: rgba(255,255,255,0.05);
    }


    .camera-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem; /* Reduced gap */
    }

    .list-header {
      display: flex;
      padding: 0 1rem; /* Aligned with items */
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
      color: #cbd5e1; /* Brighter Slate for visibility */
    }
    

    .col-preview, .col-name, .col-status, .col-rtsp, .col-actions {
        display: flex;
        align-items: center;
        justify-content: center; /* FORCE CENTER */
        text-align: center;
    }
    
    .list-header .col-preview,
    .list-header .col-name,
    .list-header .col-status,
    .list-header .col-rtsp,
    .list-header .col-actions { 
       justify-content: center; 
    }
    
    .list-header .col-rtsp { color: #cbd5e1 !important; }

    .list-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem; /* Compact padding */
      border-radius: 8px; /* Slightly tighter radius */
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(30, 41, 59, 0.4); /* More transparent list items */
      color: var(--text-primary);
      height: 60px; /* Fixed compact height */
    }


    .list-item .col-preview { justify-content: center; }
    .list-item .col-name { justify-content: flex-start; padding-left: 1rem; }
    .list-item .col-status { justify-content: center; }
    .list-item .col-rtsp { justify-content: center; }
    .list-item .col-actions { justify-content: center; }


    .col-preview { width: 120px; }
    .col-name { flex: 2; }
    .col-status { flex: 1.5; }
    .col-rtsp { flex: 1.5; }
    .col-actions { flex: 1; }


    .list-header .col-preview { justify-content: center; }
    .list-header .col-name { justify-content: flex-start; padding-left: 1rem; }
    .list-header .col-status { justify-content: center; }
    .list-header .col-rtsp { justify-content: center; }
    .list-header .col-actions { justify-content: center; }
    

    .list-item:hover {
      background: rgba(30, 41, 59, 0.9);
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    /* Apply specific styles ONLY inside list-item */
    .list-item .col-name {
      font-weight: 600; 
      color: #ffffff; 
      font-size: 0.95rem; /* Slightly smaller */
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }

    /* Item text styles */
    .list-item .col-name {
      font-weight: 600; 
      color: #ffffff; 
      font-size: 0.95rem; 
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    
    .list-item .col-rtsp {
       font-size: 0.8rem; 
       color: #ffffff;
       font-family: 'JetBrains Mono', monospace;
       opacity: 0.9;
    }


    .preview-thumb {
      width: 60px; /* Smaller thumb */
      height: 36px;
      background-color: #0f172a;
      border-radius: 4px;
      border: 1px solid #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 1rem;
    }


    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem; /* Smaller badge */
      font-weight: 500;
      padding: 2px 10px;
      border-radius: 20px;
      color: #ffffff;
      background: rgba(255,255,255,0.05);
    }

    .status-badge.live { background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-badge.offline { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block; /* Ensure it renders */
    }
    
    /* Generic Dot Styles (for Filters) */
    .dot.live { background-color: var(--color-success); box-shadow: 0 0 8px var(--color-success-glow); }
    .dot.offline { background-color: var(--color-danger); }

    /* Status Badge Context (for List Items where dot doesn't have class) */
    .status-badge.live .dot { background-color: var(--color-success); box-shadow: 0 0 8px var(--color-success-glow); }
    .status-badge.offline .dot { background-color: var(--color-danger); }

    .btn-icon {
      opacity: 0.7;
      transition: all 0.2s;
    }
    .btn-icon:hover { opacity: 1; transform: scale(1.1); }
    
    .btn-icon.danger:hover {
      color: var(--color-danger);
      background-color: rgba(239, 68, 68, 0.1);
    }
    
    .empty-state {
        padding: 4rem;
        text-align: center;
        color: var(--text-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    .empty-state i { font-size: 3rem; opacity: 0.5; }
  `]
})
export class CameraListComponent implements OnInit {
  cameras: Camera[] = [];
  filteredCameras: Camera[] = [];

  searchTerm: string = '';
  filterStatus: 'ALL' | 'RECORDING' | 'STOPPED' = 'ALL';

  constructor(private cameraService: CameraService) { }

  ngOnInit(): void {
    this.loadCameras();
  }

  loadCameras() {
    this.cameraService.getCameras().subscribe({
      next: (data) => {
        this.cameras = data;
        this.applyFilters();
      },
      error: (err) => console.error(err)
    });
  }

  setFilter(status: 'ALL' | 'RECORDING' | 'STOPPED') {
    this.filterStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredCameras = this.cameras.filter(cam => {
      const matchesSearch = cam.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cam.rtsp_url.toLowerCase().includes(this.searchTerm.toLowerCase());

      let matchesStatus = true;
      if (this.filterStatus === 'RECORDING') matchesStatus = cam.is_recording;
      if (this.filterStatus === 'STOPPED') matchesStatus = !cam.is_recording;

      return matchesSearch && matchesStatus;
    });
  }

  getMaskedUrl(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/...`;
    } catch {
      return url.substring(0, 15) + '...';
    }
  }

  deleteCamera(id: number) {
    if (confirm('Tem certeza que deseja remover esta câmera?')) {
      this.cameraService.deleteCamera(id).subscribe(() => this.loadCameras());
    }
  }
}
