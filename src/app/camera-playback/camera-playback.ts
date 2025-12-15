import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CameraService, RecordingSegment } from '../camera';
import { Camera } from '../camera.model';

@Component({
  selector: 'app-camera-playback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="recordings-layout">

    <!-- COLUMN 1: Camera Selector -->
    <nav class="cameras-sidebar">
        <div class="sidebar-header">
            <h3>Fontes</h3>
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Buscar câmera...">
            </div>
        </div>

        <div class="camera-list">
            <div *ngFor="let cam of cameras" class="camera-item" [class.active]="cam.id === selectedCameraId"
                (click)="selectCamera(cam.id)">
                <i class="bi bi-camera-video"></i>
                <span class="cam-name">{{ cam.name }}</span>
                <span *ngIf="cam.is_recording" class="rec-dot"></span>
            </div>
        </div>
    </nav>

    <!-- MAIN STAGE -->
    <div class="main-stage">

        <!-- TOP STRIP: Date Navigator -->
        <header class="date-strip">
            <div class="strip-label">DATA:</div>
            <div class="date-pills">
                <button *ngFor="let d of availableDates" class="date-pill" [class.active]="isSameDay(d, selectedDate)"
                    (click)="selectDate(d)">
                    <div class="day-name">{{ d | date:'EEE' }}</div>
                    <div class="day-num">{{ d | date:'dd' }}</div>
                </button>
            </div>
        </header>

        <!-- CONTENT GRID -->
        <div class="stage-content">

            <!-- PLAYER AREA -->
            <div class="player-wrapper">
                <div class="video-frame">
                    <video *ngIf="currentVideoUrl; else emptyState" [src]="currentVideoUrl" controls autoplay
                        class="main-video">
                    </video>

                    <ng-template #emptyState>
                        <div class="empty-player">
                            <i class="bi bi-play-circle-fill"></i>
                            <p>Selecione um evento para iniciar</p>
                        </div>
                    </ng-template>
                </div>

                <!-- Global Timeline Control -->
                <div class="timeline-control glass-panel" *ngIf="recordings.length > 0">
                    <span class="time-label">{{ vcformatTime(timelineValue) }}</span>
                    <input type="range" class="timeline-slider" [min]="timelineMin" [max]="timelineMax"
                        [(ngModel)]="timelineValue" (input)="onTimelineChange($event)">
                    <span class="time-label">{{ vcformatTime(timelineMax) }}</span>
                </div>
            </div>

            <!-- EVENT FEED (Right Side or Bottom) -->
            <div class="event-feed glass-panel">
                <div class="feed-header">
                    <h4>Eventos</h4>
                    <span class="badge">{{ recordings.length }}</span>
                </div>

                <div *ngIf="isLoading" class="loader">Carregando...</div>

                <div *ngIf="!isLoading && recordings.length === 0" class="no-events">
                    <i class="bi bi-calendar-x"></i>
                    <p>Sem eventos neste dia</p>
                </div>

                <div class="feed-list">
                    <div *ngFor="let rec of recordings" class="event-card" (click)="playSegment(rec)"
                        [class.active]="currentSegment === rec">

                        <div class="event-time">
                            {{ vcformatTime(rec.start) }}
                        </div>

                        <div class="event-info">
                            <span class="event-type">
                                <i class="bi bi-film"></i> Gravação
                            </span>
                            <span class="event-dur">{{ formatDuration(rec.duration) }}</span>
                        </div>

                        <div class="play-icon">
                            <i class="bi bi-play-fill"></i>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
  `,
  styles: [`
/* THE VAULT LAYOUT */
.recordings-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    /* Col 1: Sidebar, Col 2: Main */
    height: 100vh;
    overflow: hidden;
    background-color: var(--bg-dark);
}

/* =========================================
   COLUMN 1: CAMERAS SIDEBAR
   ========================================= */
.cameras-sidebar {
    background: var(--bg-surface);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
    color: var(--text-primary);
    font-size: 1.1rem;
    margin-bottom: 1rem;
    letter-spacing: 0.5px;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 10px;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.search-box input {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border-color);
    padding: 8px 10px 8px 32px;
    border-radius: 6px;
    color: white;
    font-size: 0.85rem;
}

.camera-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
}

.camera-item {
    display: flex;
    align-items: center;
    padding: 12px 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
    border-left: 3px solid transparent;
    gap: 12px;
}

.camera-item:hover {
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-primary);
}

.camera-item.active {
    background: rgba(59, 130, 246, 0.1);
    color: white;
    border-left-color: var(--color-primary);
}

.rec-dot {
    width: 8px;
    height: 8px;
    background: var(--color-success);
    border-radius: 50%;
    margin-left: auto;
    box-shadow: 0 0 6px var(--color-success);
}

/* =========================================
   MAIN STAGE
   ========================================= */
.main-stage {
    display: flex;
    flex-direction: column;
    position: relative;
    background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
}

/* TOP STRIP: DATE NAVIGATOR */
.date-strip {
    height: 70px;
    display: flex;
    align-items: center;
    padding: 0 2rem;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    gap: 1.5rem;
    z-index: 20;
}

.strip-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 1px;
}

.date-pills {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 4px;
    /* for scrollbar */
}

.date-pills::-webkit-scrollbar {
    height: 0;
}

.date-pill {
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 6px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
    min-width: 60px;
}

.date-pill .day-name {
    font-size: 0.7rem;
    text-transform: uppercase;
}

.date-pill .day-num {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1;
}

.date-pill:hover {
    border-color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.05);
}

.date-pill.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* CONTENT GRID */
.stage-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 340px;
    /* Video Area | Event Feed */
    overflow: hidden;
}

/* PLAYER WRAPPER */
.player-wrapper {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
}

.video-frame {
    width: 100%;
    aspect-ratio: 16/9;
    background: black;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    border: 1px solid #334155;
    display: flex;
    align-items: center;
    justify-content: center;
}

.main-video {
    width: 100%;
    height: 100%;
}

.empty-player {
    color: var(--text-muted);
    text-align: center;
    opacity: 0.5;
}

.empty-player i {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
}

/* TIMELINE CONTROL */
.timeline-control {
    width: 100%;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(30, 41, 59, 0.6);
}

.time-label {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-primary);
    min-width: 60px;
}

.timeline-slider {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    accent-color: var(--color-primary);
    cursor: pointer;
}

/* EVENT FEED */
.event-feed {
    border-left: 1px solid var(--border-color);
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(10px);
}

.feed-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.feed-header h4 {
    margin: 0;
    font-size: 1rem;
}

.feed-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.event-card {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
}

.event-card:hover {
    background: rgba(255, 255, 255, 0.06);
}

.event-card.active {
    background: rgba(59, 130, 246, 0.1);
    border-color: var(--color-primary);
}

.event-time {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-primary);
    width: 70px;
}

.event-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.event-type {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.event-dur {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.play-icon {
    opacity: 0;
    color: var(--color-primary);
    transform: translateX(-10px);
    transition: all 0.2s;
}

.event-card:hover .play-icon,
.event-card.active .play-icon {
    opacity: 1;
    transform: translateX(0);
}

.no-events {
    padding: 3rem;
    text-align: center;
    color: var(--text-muted);
    opacity: 0.6;
}

.no-events i {
    font-size: 2rem;
    display: block;
    margin-bottom: 1rem;
}
  `]
})
export class CameraPlaybackComponent implements OnInit {
  // Data Sources
  cameras: Camera[] = [];
  recordings: RecordingSegment[] = [];
  availableDates: Date[] = [];

  // State
  selectedCameraId: number = 0;
  selectedDate: Date = new Date();

  // Player State
  currentVideoUrl: SafeUrl | null = null;
  currentSegment: RecordingSegment | null = null;
  isLoading = false;

  // Timeline State
  timelineMin: number = 0;
  timelineMax: number = 0;
  timelineValue: number = 0;
  private timelineChangeTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cameraService: CameraService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.generateDateStrip();
    this.loadCameras();

    // Check route for initial selection
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectCamera(Number(id));
      }
    });
  }

  loadCameras(): void {
    this.cameraService.getCameras().subscribe(data => {
      this.cameras = data;
      // If no ID in route (or 0), select first camera
      if (!this.selectedCameraId && this.cameras.length > 0) {
        this.selectCamera(this.cameras[0].id);
      }
    });
  }

  generateDateStrip(): void {
    const dates = [];
    const today = new Date();
    // Generate last 7 days + today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d);
    }
    this.availableDates = dates;
    this.selectedDate = today;
  }

  selectCamera(id: number): void {
    this.selectedCameraId = id;
    this.currentVideoUrl = null; // Reset video on camera switch
    this.loadRecordings();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.loadRecordings();
  }

  loadRecordings(): void {
    if (!this.selectedCameraId) return;

    this.isLoading = true;
    const isoDate = this.selectedDate.toISOString().split('T')[0];
    const fullDate = new Date(isoDate + 'T00:00:00').toISOString(); // Standardize

    this.cameraService.getRecordings(this.selectedCameraId, fullDate).subscribe({
      next: (data) => {
        this.recordings = data;
        this.isLoading = false;
        this.setupTimeline();
      },
      error: (err) => {
        console.error('Error fetching recordings:', err);
        this.isLoading = false;
        this.recordings = [];
      }
    });
  }

  playSegment(segment: RecordingSegment): void {
    this.currentSegment = segment;
    this.cameraService.getPlaybackUrl(this.selectedCameraId, segment.start, segment.duration)
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
    } else {
      this.timelineValue = 0;
    }
  }

  onTimelineChange(event: any): void {
    const timestamp = parseInt(event.target.value);
    if (this.timelineChangeTimeout) clearTimeout(this.timelineChangeTimeout);

    this.timelineChangeTimeout = setTimeout(() => {
      const isoString = new Date(timestamp).toISOString();
      // Default play 1h chunk if seeking manually
      this.cameraService.getPlaybackUrl(this.selectedCameraId, isoString, 3600).subscribe(res => {
        const fullUrl = `http://127.0.0.1:8000${res.playbackUrl}`;
        this.currentVideoUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
      });
    }, 500);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    return mins < 1 ? '< 1 min' : `${mins} min`;
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  vcformatTime(time: string | number | Date): string {
    const d = new Date(time);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}