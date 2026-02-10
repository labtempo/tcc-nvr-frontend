import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  providers: [AuthService], // Ensure it's available if not root provided (it is root, but safe import)
  template: `
    <header class="topbar-container glass-panel">
      <div class="title-section">
        <h1 class="page-title">
           MONITORAMENTO
        </h1>
      </div>
      
      <div class="right-section">
        <div class="user-info">
            <span class="welcome-text">Olá, <strong>{{ userName }}</strong></span>
            <span *ngIf="isAdmin" class="badge-admin">ADMIN</span>
        </div>
        <div class="divider"></div>
        <div class="clock-section">
          <span class="time-large text-mono">{{ currentDate | date:'HH:mm:ss' }}</span>
          <span class="date-small text-mono">{{ currentDate | date:'dd/MM/yyyy' }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      height: 100%;
      background: rgba(30, 41, 59, 0.6); /* Translucent Slate 800 */
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .page-title {
      font-size: 1.125rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.05em;
      color: var(--text-primary);
    }

    .right-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
    }

    .welcome-text {
        color: #94a3b8;
        font-size: 0.9rem;
    }

    .welcome-text strong {
        color: #e2e8f0;
        font-weight: 600;
    }

    .badge-admin {
        font-size: 0.65rem;
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
        border: 1px solid rgba(251, 191, 36, 0.2);
        padding: 1px 6px;
        border-radius: 4px;
        margin-top: 2px;
        font-weight: 700;
        letter-spacing: 0.05em;
    }

    .divider {
        width: 1px;
        height: 32px;
        background: rgba(255,255,255,0.1);
    }

    .clock-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1;
    }

    .time-large {
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--text-primary);
      letter-spacing: -0.05em;
    }

    .date-small {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .page-title span { display: none; }
    }
  `]
})
export class TopbarComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  userName: string = '';
  isAdmin: boolean = false;
  private timer: any;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.isAdmin = this.authService.isAdmin();

    // Fallback: If name is default, try to fetch profile
    if (this.userName === 'Usuário' && this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (profile) => {
          if (profile.full_name) {
            this.userName = profile.full_name;
            localStorage.setItem('user_name', profile.full_name);
          }
          if (profile.role) {
            this.isAdmin = profile.role === 'admin';
            localStorage.setItem('user_role', profile.role);
          }
        },
        error: (err) => console.error('Error fetching profile in topbar', err)
      });
    }

    this.timer = setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
