import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar-container glass-panel">
      <div class="logo-area">
        <img src="assets/Logo_UFF_(blue).svg" alt="UFF Logo" class="uff-logo-sidebar">
      </div>
      
      <nav class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard">
          <i class="bi bi-grid-fill"></i>
        </a>
        <a routerLink="/cameras" routerLinkActive="active" class="nav-item" title="Câmeras">
          <i class="bi bi-camera-video"></i>
        </a>
        <a routerLink="/playback" routerLinkActive="active" class="nav-item" title="Gravações">
          <i class="bi bi-film"></i>
        </a>
         <a routerLink="/map" routerLinkActive="active" class="nav-item" title="Mapa">
          <i class="bi bi-map"></i>
        </a>
      </nav>

      <div class="bottom-links">
        <a routerLink="/settings" routerLinkActive="active" class="nav-item" title="Configurações">
          <i class="bi bi-gear"></i>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      align-items: center;
      padding: 1.5rem 0;
      background: var(--bg-surface); /* Fallback */
      background: rgba(30, 41, 59, 0.4); /* Translucent */
      border-right: 1px solid rgba(255, 255, 255, 0.05);
    }

    .logo-area {
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .uff-logo-sidebar {
      width: 45px;
      height: auto;
      filter: brightness(0) invert(1) drop-shadow(0 0 5px rgba(255,255,255,0.3));
      opacity: 0.9;
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      align-items: center;
    }

    .bottom-links {
      margin-top: auto;
      width: 100%;
      display: flex;
      justify-content: center;
      padding-bottom: 1.5rem;
    }

    .nav-item {
      color: var(--text-muted);
      font-size: 1.25rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      position: relative;
    }

    .nav-item:hover {
      color: var(--text-primary);
      background-color: var(--bg-surface-light);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
    }
    
    .nav-item.active {
      color: var(--color-primary);
      background-color: rgba(59, 130, 246, 0.1);
      box-shadow: 0 0 20px var(--color-primary-glow);
    }

    /* Active Indicator Line */
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: -18px; /* Outside alignment */
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background-color: var(--color-primary);
      border-radius: 0 4px 4px 0;
      box-shadow: 0 0 10px var(--color-primary);
    }
  `]
})
export class SidebarComponent { }
