import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CameraService } from '../camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cameraService: CameraService,
    private sanitizer: DomSanitizer
  ) { }

  goBack(): void {
    this.router.navigate(['/cameras']);
  }

  private formatName(name: string): string {
    // Formata o nome para o padrão do backend
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^\w_]/g, '');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cameraService.getCameraById(Number(id)).subscribe(
        (cam: any) => {
          this.camera = cam;
          if (this.camera && this.camera.name) {
            const formattedName = this.formatName(this.camera.name);
            const url = `http://localhost:8889/live/${formattedName}/`;
            this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          } else {
            alert('Câmera não encontrada.');
            this.goBack();
          }
        },
        (error: any) => {
          console.error('Erro ao buscar câmera:', error);
          alert('Erro ao buscar câmera.');
          this.goBack();
        }
      );
    }
  }
}