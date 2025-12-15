import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Hls from 'hls.js';

@Component({
  selector: 'app-camera-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="camera-card" [class.motion]="variant === 'MOTION'" [class.offline]="isOfflineOrError()">
      
      <div class="video-container">
        
        <!-- Vídeo/Iframe (Apenas se Online e Sem Erro) -->
        <ng-container *ngIf="!isOfflineOrError()">
            <div class="placeholder-icon">
              <i class="bi bi-camera-video"></i>
            </div>

            <video #videoElement *ngIf="hlsUrl" class="feed-video" autoplay muted playsinline></video>
            
            <iframe *ngIf="!hlsUrl && iframeUrl" 
                    [src]="iframeUrl"
                    class="feed-iframe"
                    frameborder="0"
                    allowfullscreen
                    (load)="onIframeLoad()">
            </iframe>
        </ng-container>

        <!-- Placeholder Offline / Erro -->
        <div *ngIf="isOfflineOrError()" class="offline-placeholder">
          <div class="scan-line"></div>
          <div class="icon-wrapper">
             <i class="bi bi-wifi-off"></i>
          </div>
          <span class="offline-text">SINAL PERDIDO</span>
          <span class="offline-subtext">VERIFIQUE A CONEXÃO</span>
        </div>
        
        <!-- Loading -->
        <div *ngIf="isLoading && !isOfflineOrError()" class="loading-overlay">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

      </div>

      <div class="overlay-top"></div>
      <div class="overlay-bottom"></div>

      <div class="camera-header">
        <span class="camera-name">{{ name }}</span>
        <div class="status-indicator">
          <span class="dot" [class.live]="!isOfflineOrError()" [class.offline]="isOfflineOrError()"></span>
          <span class="status-text">{{ isOfflineOrError() ? 'OFFLINE' : 'LIVE' }}</span>
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
      background-color: #1e293b;
      width: 100%;
      height: 100%;
    }

    /* Icon placeholder */
    .placeholder-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      color: rgba(255, 255, 255, 0.05);
      z-index: 0;
    }

    .feed-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: relative;
      z-index: 1;
    }

    /* Estilos Offline / Cyberpunk */
    .offline-placeholder {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #0f172a; /* Slate 900 */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      overflow: hidden;
      z-index: 20;
    }

    .icon-wrapper {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        color: #ef4444; /* Vermelho Erro */
        opacity: 0.8;
        animation: pulse 2s infinite;
    }

    .offline-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #e2e8f0;
      text-transform: uppercase;
      text-shadow: 0 0 10px rgba(226, 232, 240, 0.1);
    }
    
    .offline-subtext {
        font-size: 0.75rem;
        color: #475569;
        margin-top: 0.5rem;
        letter-spacing: 1px;
    }

    .scan-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      animation: scan 4s linear infinite;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
    }

    .loading-overlay {
        position: absolute;
        top:0; left:0; width:100%; height:100%;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }

    @keyframes scan {
      0% { top: -10%; }
      100% { top: 110%; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 0.8; }
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
      pointer-events: auto;
      background: transparent; 
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
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
  @Input() rawUrl: string = '';

  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;
  private hls: Hls | null = null;

  hasError: boolean = false;
  isLoading: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['status'] || changes['rawUrl'] || changes['iframeUrl']) {
      this.checkStreamState();
    }
  }

  checkStreamState() {
    this.isLoading = true;
    this.hasError = false;

    // Status offline via props
    if (this.status !== 'LIVE') {
      this.isLoading = false;
      return;
    }

    // Se já temos iframeUrl configurado, não fazer verificação HTTP
    // O iframe vai carregar e chamar onIframeLoad quando estiver pronto
    if (this.iframeUrl) {
      // Não marcar como erro, deixar o iframe tentar carregar
      this.hasError = false;
      // isLoading será desativado no onIframeLoad
      return;
    }

    // Se tivermos URL raw para checar (e não temos iframe)
    if (this.rawUrl && !this.hlsUrl) {

      // Ignorar verificação para YouTube (evitar CORS)
      if (this.rawUrl.includes('youtube.com') || this.rawUrl.includes('youtu.be') || this.rawUrl.includes('embed')) {
        this.isLoading = false;
        this.hasError = false;
        return;
      }

      // Testar conexão
      this.http.get(this.rawUrl, { responseType: 'text' }).subscribe({
        next: () => {
          this.hasError = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.warn(`Stream verification failed for ${this.name} (Status: ${err.status})`, err);

          // Relaxed Check: Accept 2xx OR 0 (CORS opaque)
          // Often local streaming servers (like MediaMTX) might not return CORS headers for this probe,
          // resulting in status 0. We treat this as "connected" to avoid false negatives.
          if (err.status === 0 || (err.status >= 200 && err.status < 300)) {
            this.hasError = false;
          } else {
            this.hasError = true;
          }
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  isOfflineOrError(): boolean {
    return this.status !== 'LIVE' || this.hasError;
  }

  onIframeLoad() {
    this.isLoading = false;
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
