import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import Hls from 'hls.js';

@Component({
  selector: 'app-camera-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="camera-card" [class.motion]="variant === 'MOTION'" [class.offline]="status !== 'LIVE'">
      
      <div class="video-container">
        
        <video #videoElement *ngIf="status === 'LIVE' && hlsUrl" class="feed-video" autoplay muted playsinline></video>
        
        <iframe *ngIf="status === 'LIVE' && !hlsUrl && iframeUrl" 
                [src]="iframeUrl"
                class="feed-iframe"
                frameborder="0"
                allowfullscreen>
        </iframe>

        <div *ngIf="status !== 'LIVE'" class="offline-placeholder">
          <i class="bi bi-wifi-off"></i>
          <span class="offline-text">SINAL PERDIDO</span>
        </div>
      </div>

      <div class="overlay-top"></div>
      <div class="overlay-bottom"></div>

      <div class="camera-header">
        <span class="camera-name">{{ name }}</span>
        <div class="status-indicator">
          <span class="dot" [class.live]="status === 'LIVE'" [class.offline]="status !== 'LIVE'"></span>
          <span class="status-text">{{ status }}</span>
        </div>
      </div>


    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .camera-card {
      background-color: #000;
      position: relative;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .camera-card.motion {
      border: 4px solid var(--color-danger);
    }

    .video-container {
      flex-grow: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #000;
      width: 100%;
      height: 100%;
    }

    .feed-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .offline-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary);
      opacity: 0.5;
    }

    .offline-placeholder i {
      font-size: 3rem;
    }

    .offline-placeholder .offline-text {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .overlay-top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
      pointer-events: none;
      z-index: 5;
    }

    .overlay-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60px;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
      pointer-events: none;
      z-index: 5;
    }

    .camera-header {
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .camera-name {
      font-family: var(--font-main);
      font-weight: 500;
      font-size: 1rem;
      color: var(--text-primary);
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-text {
      font-family: var(--font-main);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot.live { background-color: var(--color-success); box-shadow: 0 0 8px var(--color-success); }
    .dot.offline { background-color: var(--color-danger); }

    .feed-iframe {
      width: 100%;
      height: 100%;
      border: none;
      pointer-events: none; /* Let clicks pass through if needed, or remove if interaction is desired */
      background: #000;
      position: absolute;
      top: 0;
      left: 0;
    }


  `]
})
export class CameraFeedComponent implements OnInit, OnDestroy {
  @Input() name: string = 'Camera';
  @Input() status: 'LIVE' | 'OFFLINE' | string = 'LIVE';
  @Input() variant: 'NORMAL' | 'MOTION' = 'NORMAL';
  @Input() imageSrc: string = '';
  @Input() hlsUrl: string = '';
  @Input() iframeUrl: SafeResourceUrl | null = null;

  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;
  private hls: Hls | null = null;

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.status === 'LIVE' && this.hlsUrl) {
      this.initPlayer();
    }
  }

  initPlayer() {
    const video = this.videoElementRef.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.hlsUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("Auto-play blocked", e));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.error("Auto-play blocked", e));
      });
    }
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}
