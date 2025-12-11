import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CameraService, RecordingSegment } from '../camera';

@Component({
  selector: 'app-camera-playback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="playback-layout">
       <!-- Sidebar: Playlist -->
      <aside class="playback-sidebar glass-panel">
        <div class="sidebar-header">
           <button class="btn btn-icon" [routerLink]="['/cameras']">
             <i class="bi bi-arrow-left"></i>
           </button>
           <h3>Histórico</h3>
        </div>

        <!-- Date Picker (Mock) -->
        <div class="date-selector">
           <button class="btn-icon"><i class="bi bi-chevron-left"></i></button>
           <div class="current-date">
             <i class="bi bi-calendar3"></i>
             <span>{{ selectedDate | date:'dd MMM yyyy' }}</span>
           </div>
           <button class="btn-icon"><i class="bi bi-chevron-right"></i></button>
        </div>

        <!-- Segments List -->
        <div class="segments-list">
          <div *ngFor="let seg of recordings" 
               class="segment-item" 
               (click)="playSegment(seg)"
               [class.active]="currentSegment === seg">
            
            <div class="seg-time">
              <span class="start">{{ seg.start | date:'HH:mm:ss' }}</span>
              <span class="duration">{{ formatDuration(seg.duration) }}</span>
            </div>
            <div class="seg-type">
               <i class="bi bi-film"></i>
            </div>
          </div>
          
          <div *ngIf="recordings.length === 0 && !isLoading" class="no-data">
             Nenhuma gravação encontrada.
          </div>
        </div>
      </aside>

      <!-- Main Area: Player -->
      <main class="player-area">
        <div class="video-wrapper">
             
           <!-- Video Element (or Placeholder) -->
           <video *ngIf="currentVideoUrl; else emptyPlayer" 
                  [src]="currentVideoUrl" 
                  controls 
                  autoplay 
                  class="main-video">
           </video>

           <ng-template #emptyPlayer>
              <div class="empty-player">
                <i class="bi bi-play-circle"></i>
                <p>Selecione um segmento para reproduzir</p>
              </div>
           </ng-template>

        </div>

        <!-- Timeline Control -->
        <div class="timeline-control glass-panel">
           <div class="time-display">
              {{ timelineValue | date:'HH:mm:ss' }} 
              <span class="text-muted">/ {{ timelineMax | date:'HH:mm:ss' }}</span>
           </div>
           
           <input type="range" 
                  class="timeline-slider" 
                  [min]="timelineMin" 
                  [max]="timelineMax" 
                  [(ngModel)]="timelineValue" 
                  (input)="onTimelineChange($event)">
        </div>
      </main>
    </div>
  `,
  styles: [`
    .playback-layout {
      display: flex;
      height: 100%;
      background-color: black;
      color: white;
      position: relative;
    }

    /* Sidebar */
    .playback-sidebar {
      width: 320px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255,255,255,0.1);
      z-index: 10;
      background: rgba(15, 23, 42, 0.95); /* High opacity for readability */
    }

    .sidebar-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .sidebar-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .date-selector {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .current-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-family: var(--font-mono);
    }

    .segments-list {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .segment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      cursor: pointer;
      border-left: 3px solid transparent;
      transition: all 0.2s;
    }

    .segment-item:hover {
      background: rgba(255,255,255,0.1);
    }

    .segment-item.active {
      background: rgba(59, 130, 246, 0.15);
      border-left-color: var(--color-primary);
    }

    .seg-time {
      display: flex;
      flex-direction: column;
    }

    .seg-time .start { font-weight: 600; font-size: 1rem; }
    .seg-time .duration { font-size: 0.8rem; color: var(--text-muted); }
    
    .no-data {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    }

    /* Player Area */
    .player-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .video-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .main-video {
      width: 100%;
      height: 100%;
      max-height: calc(100vh - 80px); /* Subtract timeline height */
      object-fit: contain;
    }

    .empty-player {
      text-align: center;
      color: var(--text-muted);
      opacity: 0.5;
    }
    .empty-player i { font-size: 4rem; margin-bottom: 1rem; display: block; }

    /* Timeline */
    .timeline-control {
      height: 80px;
      padding: 0 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(10px);
    }

    .time-display {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      color: var(--color-primary);
    }

    .timeline-slider {
      width: 100%;
      accent-color: var(--color-primary);
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      cursor: pointer;
    }
  `]
})
export class CameraPlaybackComponent implements OnInit {
  cameraId: number = 0;
  selectedDate: string = '';
  recordings: RecordingSegment[] = [];
  currentVideoUrl: SafeUrl | null = null;
  currentSegment: RecordingSegment | null = null;
  isLoading = false;

  timelineMin: number = 0;
  timelineMax: number = 0;
  timelineValue: number = 0;
  private timelineChangeTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private route: ActivatedRoute,
    private cameraService: CameraService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.cameraId = Number(this.route.snapshot.paramMap.get('id'));
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadRecordings();
  }

  loadRecordings(): void {
    const startDate = new Date(this.selectedDate).toISOString();
    this.isLoading = true;
    this.cameraService.getRecordings(this.cameraId, startDate).subscribe({
      next: (data) => {
        this.recordings = data;
        this.isLoading = false;
        this.setupTimeline();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  playSegment(segment: RecordingSegment): void {
    this.currentSegment = segment;
    this.cameraService.getPlaybackUrl(this.cameraId, segment.start, segment.duration)
      .subscribe((res) => {
        const fullUrl = `http://127.0.0.1:8000${res.playbackUrl}`;
        this.currentVideoUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
      });
  }

  setupTimeline(): void {
    if (this.recordings.length > 0) {
      this.timelineMin = new Date(this.recordings[0].start).getTime();
      const last = this.recordings[this.recordings.length - 1];
      this.timelineMax = new Date(last.start).getTime() + (last.duration * 1000);
      this.timelineValue = this.timelineMin;
    }
  }

  onTimelineChange(event: any): void {
    const timestamp = parseInt(event.target.value);
    if (this.timelineChangeTimeout) clearTimeout(this.timelineChangeTimeout);

    this.timelineChangeTimeout = setTimeout(() => {
      const isoString = new Date(timestamp).toISOString();
      this.cameraService.getPlaybackUrl(this.cameraId, isoString, 3600).subscribe(res => {
        const fullUrl = `http://127.0.0.1:8000${res.playbackUrl}`;
        this.currentVideoUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
      });
    }, 500);
  }

  formatDuration(seconds: number): string {
    return Math.floor(seconds / 60) + ' min';
  }
}