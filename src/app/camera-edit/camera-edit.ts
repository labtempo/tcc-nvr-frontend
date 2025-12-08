import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CameraService } from '../camera';
import { CommonModule } from '@angular/common';
import { Camera } from '../camera.model';

@Component({
  selector: 'app-camera-edit',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './camera-edit.html',
  styleUrls: ['./camera-edit.css']
})
export class CameraEditComponent implements OnInit {
  camera: Partial<Camera> = {};

  constructor(
    private cameraService: CameraService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cameraId = Number(params.get('id'));
      if (cameraId) {
        this.cameraService.getCameraById(cameraId).subscribe(
          camera => {
            this.camera = camera;
          }
        );
      }
    });
  }

  onUpdateCamera(): void {
    if (this.camera.id) {
      this.cameraService.updateCamera(this.camera.id, this.camera).subscribe(
        () => {
          alert('Câmera atualizada com sucesso!');
          this.router.navigate(['/cameras']);
        },
        error => {
          console.error('Erro ao atualizar câmera:', error);
          alert('Erro ao atualizar câmera. Verifique os dados.');
        }
      );
    }
  }
}