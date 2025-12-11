import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraFeedComponent } from '../camera-feed/camera-feed.component';
import { CameraService } from '../../camera';
import { Camera } from '../../camera.model';

@Component({
  selector: 'app-camera-grid',
  standalone: true,
  imports: [CommonModule, CameraFeedComponent],
  template: `
    <div class="page-layout">
      <!-- Toolbar -->
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

      <!-- Grid -->
      <div class="grid-container" [ngStyle]="gridStyle">
        <div class="grid-item" *ngFor="let cam of cameras">
          <app-camera-feed 
            [name]="cam.name" 
            [status]="getStatus(cam)" 
            [timestamp]="getTimestamp()"
            [hlsUrl]="cam.visualisation_url_hls || ''">
          </app-camera-feed>
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

    /* CSS Grid Icons */
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

    /* Exact Grids */
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
    }
    
    .grid-item ::ng-deep app-camera-feed {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
    }
  `]
})
export class CameraGridComponent implements OnInit {
  cameras: Camera[] = [];
  gridSize: number = 2;

  constructor(private cameraService: CameraService) { }

  ngOnInit() {
    this.loadCameras();
  }

  loadCameras() {
    this.cameraService.getCameras().subscribe({
      next: (data) => this.cameras = data,
      error: (err) => console.error(err)
    });
  }

  setGrid(size: number) {
    this.gridSize = size;
  }

  get gridStyle() {
    return {
      'grid-template-columns': `repeat(${this.gridSize}, 1fr)`
      // Removed fixed rows to allow scrolling
    };
  }

  getStatus(cam: Camera): string {
    return cam.visualisation_url_hls ? 'LIVE' : 'OFFLINE';
  }

  getTimestamp(): string {
    return new Date().toLocaleString('pt-BR');
  }
}
