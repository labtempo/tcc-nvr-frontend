import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CameraService } from '../camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastService } from '../shared/toast/toast.service';
import { environment } from '../../environments/environment';
import Hls from 'hls.js';

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './camera-view.html',
  styleUrls: ['./camera-view.css']
})
export class CameraViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;

  camera: any;
  videoUrl: SafeResourceUrl | null = null;
  iframeUrl: SafeResourceUrl | null = null;
  rawUrl: string = '';
  hasError: boolean = false;
  isLoading: boolean = true;
  isHighQuality: boolean = true;
  hasLowQuality: boolean = false;
  isSwitching: boolean = false;
  webRtcFailed: boolean = false;

  private hls: Hls | null = null;
  private peerConnection: RTCPeerConnection | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cameraService: CameraService,
    private sanitizer: DomSanitizer,
    private toastService: ToastService,
    private http: HttpClient
  ) { }

  goBack(): void {
    this.router.navigate(['/cameras']);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.cameraService.getCameraById(Number(id)).subscribe(
        (cam: any) => {
          this.camera = cam;
          console.log('Dados da câmera recebidos:', cam);

          // Verifica se existe URL de baixa qualidade
          this.hasLowQuality = !!cam.path_id_low;
          this.isHighQuality = true; // Começa sempre na alta qualidade

          if (this.camera && this.camera.path_id) {
            this.loadQualityStream();
          } else {
            console.error('Câmera retornada mas sem path_id:', cam);
            this.toastService.error('Câmera sem configuração de caminho (path_id).');
            this.goBack();
          }
        },
        (error: any) => {
          console.error('Erro ao buscar câmera:', error);
          this.toastService.error('Erro ao buscar câmera no servidor.');
          this.goBack();
        }
      );
    }
  }

  checkStreamState() {
    // Assume o stream como disponível — o MediaMTX gerencia a disponibilidade
    this.isLoading = false;
    this.hasError = false;
  }

  loadQualityStream(): void {
    if (!this.camera) return;

    // Reset states
    this.webRtcFailed = false;
    this.hasError = false;
    this.isLoading = true;

    // Cleanup previous streams
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Iniciar novo playback
    this.initStreamPlayback();
  }

  toggleQuality(): void {
    if (!this.hasLowQuality || this.isSwitching || this.isLoading) return;

    this.isSwitching = true;
    this.isLoading = true;

    // Pequeno delay para melhor UX (dá tempo do iframe atualizar)
    setTimeout(() => {
      this.isHighQuality = !this.isHighQuality;
      this.loadQualityStream();

      const qualityLabel = this.isHighQuality ? 'Alta' : 'Baixa';
      this.toastService.show(`Alternado para qualidade ${qualityLabel}`, 'info');

      setTimeout(() => {
        this.isSwitching = false;
      }, 500);
    }, 300);
  }

  onIframeLoad() {
    this.isLoading = false;
  }

  ngAfterViewInit() {
    if (this.camera && this.camera.path_id) {
      this.initStreamPlayback();
    }
  }

  private initStreamPlayback() {
    let hlsUrl: string;

    if (this.isHighQuality) {
      // Monta a URL HLS de alta qualidade usando o environment
      hlsUrl = `${environment.mediaMtxUrl}/${this.camera.path_id}/index.m3u8`;
    } else {
      // Monta a URL HLS de baixa qualidade usando o environment
      hlsUrl = `${environment.mediaMtxUrl}/${this.camera.path_id_low}/index.m3u8`;
    }

    if (hlsUrl) {
      this.initHls(hlsUrl);
    }
  }

  private handleWebRTCFailure() {
    // Limpo conforme migração para HLS puro
  }

  private initHls(hlsUrl: string) {
    if (!this.videoElementRef) return;

    const video = this.videoElementRef.nativeElement;
    video.srcObject = null;
    video.muted = true;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(hlsUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("Auto-play blocked", e));
        this.isLoading = false;
      });
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          this.hasError = true;
          this.isLoading = false;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.error("Auto-play blocked", e));
        this.isLoading = false;
      });
      video.addEventListener('error', () => {
        this.hasError = true;
        this.isLoading = false;
      });
    }
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
  }
}
