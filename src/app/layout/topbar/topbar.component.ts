import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar-container glass-panel">
      <div class="title-section">
        <h1 class="page-title">
          <span class="text-muted">SYSTEM //</span> MONITORAMENTO
        </h1>
      </div>
      
      <div class="right-section">
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
  private timer: any;

  ngOnInit() {
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
