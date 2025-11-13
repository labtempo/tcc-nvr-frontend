import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CameraService, RecordingSegment } from '../camera'; // Verifique se o caminho para camera.ts está correto

@Component({
  selector: 'app-camera-playback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './camera-playback.html',
  styleUrls: ['./camera-playback.css']
})
export class CameraPlaybackComponent implements OnInit {
  cameraId: number = 0;
  selectedDate: string = '';
  recordings: RecordingSegment[] = [];
  currentVideoUrl: SafeUrl | null = null;
  isLoading = false;

 
  timelineMin: number = 0;
  timelineMax: number = 0;
  timelineValue: number = 0;
  private timelineChangeTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private route: ActivatedRoute,
    private cameraService: CameraService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cameraId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.selectedDate = new Date().toISOString().split('T')[0];
    
    this.loadRecordings();
  }

  loadRecordings(): void {
    if (!this.selectedDate) return;

    this.isLoading = true;
    this.recordings = [];
    this.currentVideoUrl = null; 

    const startDate = new Date(this.selectedDate).toISOString();

    this.cameraService.getRecordings(this.cameraId, startDate).subscribe({
      next: (data) => {
        this.recordings = data;
        this.isLoading = false;
        
        
        this.setupTimeline();
      },
      error: (err) => {
        console.error('Erro ao buscar gravações:', err);
        this.isLoading = false;
      }
    });
  }

  playSegment(segment: RecordingSegment): void {
    
this.cameraService.getPlaybackUrl(this.cameraId, segment.start, segment.duration)
      .subscribe({
        next: (res) => {
          const apiHost = 'http://127.0.0.1:8000'; 
          const fullUrl = `${apiHost}${res.playbackUrl}`;
          
          console.log("Carregando vídeo seguro:", fullUrl);

          this.currentVideoUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
        },
        error: (err) => {
          console.error('Erro ao gerar token de playback:', err);
          alert('Erro ao carregar o vídeo.');
        }
      });
  }

  setupTimeline(): void {
    if (this.recordings.length === 0) {
      this.timelineMin = 0;
      this.timelineMax = 0;
      this.timelineValue = 0;
      return;
    }

    
    this.timelineMin = new Date(this.recordings[0].start).getTime();
    
    
    const lastRecording = this.recordings[this.recordings.length - 1];
    const lastStart = new Date(lastRecording.start).getTime();
    const lastDurationMs = lastRecording.duration * 1000; 
    this.timelineMax = lastStart + lastDurationMs;
    
    
    this.timelineValue = this.timelineMin;
  }

  onTimelineChange(event: any): void {
    const timestamp = parseInt(event.target.value);
    this.timelineValue = timestamp;
    
    
    if (this.timelineChangeTimeout) {
      clearTimeout(this.timelineChangeTimeout);
    }
    
    this.timelineChangeTimeout = setTimeout(() => {
      
      const isoString = new Date(timestamp).toISOString();
      
      
      this.loadVideoAtTime(isoString, 3600);
    }, 500); 
  }

  loadVideoAtTime(startTime: string, duration: number): void {
    this.cameraService.getPlaybackUrl(this.cameraId, startTime, duration)
      .subscribe({
        next: (res) => {
          const apiHost = 'http://127.0.0.1:8000';
          const fullUrl = `${apiHost}${res.playbackUrl}`;
          
          console.log("Carregando vídeo seguro a partir de:", startTime);

          this.currentVideoUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
        },
        error: (err) => {
          console.error('Erro ao gerar token de playback:', err);
          alert('Erro ao carregar o vídeo.');
        }
      });
  }

  vcformatTime(time: string | number): string {
    let date: Date;
    
    if (typeof time === 'string') {
      date = new Date(time);
    } else {
      date = new Date(time);
    }
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  formatDuration(seconds: number): string {
    return (seconds / 60).toFixed(1) + ' min';
  }
}