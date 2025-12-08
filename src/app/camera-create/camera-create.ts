import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CameraService } from '../camera';
import { Camera } from '../camera.model';

@Component({
  selector: 'app-camera-create',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './camera-create.html',
  styleUrls: ['./camera-create.css']
})
export class CameraCreateComponent {
  camera: Partial<Camera> = {
    name: '',
    rtsp_url: '',
    is_recording: false
  };

  constructor(private cameraService: CameraService, private router: Router) {}
  
  onCreateCamera(): void {
    this.cameraService.createCamera(this.camera).subscribe(
      () => {
        alert('Câmera criada com sucesso!');
        this.router.navigate(['/cameras']);
      },
      error => {
        console.error('Erro ao criar câmera:', error);
        alert('Erro ao criar câmera. Verifique os dados.');
      }
    );
  }
}