import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './loading/loading';
import { LoadingService } from './loading/loading.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingComponent,
    CollapseModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'tcc-nvr-frontend';
  isCollapsed = true;

  constructor(public loadingService: LoadingService) {}
}