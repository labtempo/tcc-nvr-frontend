import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CameraService } from '../camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastService } from '../shared/toast/toast.service';
import { CameraFeedComponent } from '../dashboard/camera-feed/camera-feed.component';

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [
    CommonModule,
    CameraFeedComponent
  ],
  templateUrl: './camera-view.html',
  styleUrls: ['./camera-view.css']
})
export class CameraViewComponent implements OnInit {
  camera: any;
  iframeUrl: SafeResourceUrl | null = null;
  rawUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cameraService: CameraService,
    private sanitizer: DomSanitizer,
    private toastService: ToastService
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

            // Alinhado com o Dashboard: Forçar URL do MediaMTX local
            // O Dashboard ignora visualisation_url_hls e constrói a URL baseada no nome
            const formattedName = CameraService.formatName(this.camera.name);
            const url = `http://localhost:8889/live/${formattedName}/`;

            // Armazenar URL Segura e Raw
            this.rawUrl = url;
            this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

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
}