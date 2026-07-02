import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CameraService } from '../camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastService } from '../shared/toast/toast.service';
import { environment } from '../../environments/environment';

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
          console.log('Dados da câmera recebidos:', cam);

          if (this.camera && this.camera.path_id) {
            
            const cleanPath = this.camera.path_id.replace(/^\/+|\/+$/g, '');
            const url = `${environment.mediaMtxUrl}/${cleanPath}/`;

            this.rawUrl = url;
            this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

            this.isLoading = true;
            this.hasError = false;

            this.checkStreamState();

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

  onIframeLoad() {
    this.isLoading = false;
  }
}