import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="toast-item glass-panel"
           [ngClass]="toast.type"
           (click)="toastService.remove(toast.id)">
        <div class="icon">
          <i class="bi" [ngClass]="getIcon(toast.type)"></i>
        </div>
        <div class="message">{{ toast.message }}</div>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none; /* Allow clicks through empty space */
    }

    .toast-item {
      pointer-events: auto;
      min-width: 300px;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      
      /* Base Glass Style */
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: white;
    }

    /* Types */
    .toast-item.success {
      border-left: 4px solid #10b981;
    }
    .toast-item.success .icon { color: #10b981; }

    .toast-item.error {
      border-left: 4px solid #ef4444;
    }
    .toast-item.error .icon { color: #ef4444; }

    .toast-item.info {
      border-left: 4px solid #3b82f6;
    }
    .toast-item.info .icon { color: #3b82f6; }

    /* Content */
    .icon {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
    }

    .message {
      font-size: 0.9rem;
      font-weight: 500;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class ToastComponent {
    constructor(public toastService: ToastService) { }

    getIcon(type: string): string {
        switch (type) {
            case 'success': return 'bi-check-circle-fill';
            case 'error': return 'bi-x-circle-fill';
            default: return 'bi-info-circle-fill';
        }
    }
}
