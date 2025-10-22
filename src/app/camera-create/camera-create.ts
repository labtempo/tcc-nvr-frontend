import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CameraService } from '../camera';
import { AuthService } from '../auth/auth';

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
  camera = {
    name: '',
    rtsp_url: '',
    is_recording: false,
    created_by_user_id: null as number | null 
  };

  constructor(private cameraService: CameraService, private router: Router, private authService: AuthService) { 

    this.camera.created_by_user_id = this.authService.getUserId();
  }
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