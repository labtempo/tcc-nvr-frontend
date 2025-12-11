import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout-container">
      <app-sidebar class="sidebar"></app-sidebar>
      <div class="main-content">
        <app-topbar class="topbar"></app-topbar>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background-color: var(--bg-dark); /* Ensure base background */
    }

    .sidebar {
      flex-shrink: 0;
      width: 80px;
      z-index: 1000;
      /* Background handled by component for glass effect */
    }

    .main-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative; /* For overlays */
    }

    .topbar {
      flex-shrink: 0;
      height: 72px;
      z-index: 900;
      /* Background handled by component for glass effect */
    }

    .content-area {
      flex-grow: 1;
      overflow: auto;
      padding: 0;
    }
  `]
})
export class DashboardLayoutComponent { }
