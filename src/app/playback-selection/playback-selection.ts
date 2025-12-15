import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CameraService } from '../camera';
import { Camera } from '../camera.model';

@Component({
  selector: 'app-playback-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './playback-selection.html',
  styleUrls: ['./playback-selection.css']
})
export class PlaybackSelectionComponent implements OnInit {
  cameras: Camera[] = [];
  isLoading = true;

  constructor(private cameraService: CameraService) { }

  ngOnInit(): void {
    this.loadCameras();
  }

  loadCameras() {
    this.isLoading = true;
    this.cameraService.getCameras().subscribe({
      next: (data) => {
        this.cameras = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading cameras', err);
        this.isLoading = false;
      }
    });
  }

  getMaskedUrl(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/...`;
    } catch {
      return url.substring(0, 15) + '...';
    }
  }
}
