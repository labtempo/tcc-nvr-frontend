import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CameraService } from '../camera';
import { CommonModule } from '@angular/common';

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
  camera: any;

  constructor(
    private cameraService: CameraService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cameraId = Number(params.get('id'));
      this.cameraService.getCameras().subscribe(
        cameras => {
          this.camera = cameras.find(c => c.id === cameraId);
        }
      );
    });
  }

  onUpdateCamera(): void {
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