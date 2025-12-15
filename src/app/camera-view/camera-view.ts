import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CameraService } from '../camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './camera-view.html',
  styleUrls: ['./camera-view.css']
})
export class CameraViewComponent implements OnInit {
  camera: any;
  videoUrl: SafeResourceUrl | null = null;
  rawUrl: string = '';
  hasError: boolean = false;
  isLoading: boolean = true;

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
          if (this.camera && this.camera.name) {

            const formattedName = CameraService.formatName(this.camera.name);
            const url = `http://localhost:8889/live/${formattedName}/`;

            // Armazenar URL Segura e Raw
            this.rawUrl = url;
            this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

            // Verificar Status
            this.checkStreamState();

          } else {
            this.toastService.error('Câmera não encontrada.');
            this.goBack();
          }
        },
        (error: any) => {
          console.error('Erro ao buscar câmera:', error);
          this.toastService.error('Erro ao buscar câmera.');
          this.goBack();
        }
      );
    }
  }

  checkStreamState() {
    this.isLoading = true;
    this.hasError = false;

    // Se tivermos URL raw para checar a conectividade
    if (this.rawUrl) {

      // Ignorar verificação para YouTube
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
          console.warn(`Stream verification failed for ${this.camera?.name}`, err);

          if (err.status >= 200 && err.status < 300) {
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

  onIframeLoad() {
    this.isLoading = false;
  }
}