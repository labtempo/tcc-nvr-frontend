import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CameraService } from '../camera';

@Component({
  selector: 'app-camera-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './camera-list.html',
  styleUrls: ['./camera-list.css']
})
export class CameraListComponent implements OnInit {
  cameras: any[] = [];

  constructor(private cameraService: CameraService, private router: Router) { }

  ngOnInit(): void {
    this.getCameras();
  }

  getCameras(): void {
    this.cameraService.getCameras().subscribe(
      data => this.cameras = data,
      error => console.error('Erro ao buscar câmeras:', error)
    );
  }

  deleteCamera(id: number): void {
    if (confirm('Tem certeza que deseja deletar esta câmera?')) {
      this.cameraService.deleteCamera(id).subscribe(
        () => {
          alert('Câmera deletada com sucesso!');
          this.getCameras();
        },
        error => console.error('Erro ao deletar câmera:', error)
      );
    }
  }

  goToCreate(): void {
    this.router.navigate(['/cameras/create']);
  }
}