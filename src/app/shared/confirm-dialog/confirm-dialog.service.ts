import { Injectable, Component, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="overlay" *ngIf="visible">
      <div class="glass-dialog">
        <h3 class="title">{{ title }}</h3>
        <p class="message">{{ message }}</p>
        <div class="actions">
          <button class="btn-cancel" (click)="onCancel()">Cancelar</button>
          <button class="btn-confirm" (click)="onConfirm()">Confirmar</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.2s ease-out;
    }

    .glass-dialog {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border-radius: 16px;
      padding: 2rem;
      width: 90%;
      max-width: 400px;
      text-align: center;
      animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .title {
      color: white;
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }

    .message {
      color: #94a3b8;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .btn-cancel:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }
    .btn-confirm:hover {
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmDialogComponent {
    title: string = '';
    message: string = '';
    visible: boolean = false;

    // Callbacks
    confirmFn: () => void = () => { };
    cancelFn: () => void = () => { };

    onConfirm() {
        this.visible = false;
        this.confirmFn();
    }

    onCancel() {
        this.visible = false;
        this.cancelFn();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmDialogService {
    private componentRef: ConfirmDialogComponent | null = null;

    register(component: ConfirmDialogComponent) {
        this.componentRef = component;
    }

    confirm(title: string, message: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.componentRef) {
                this.componentRef.title = title;
                this.componentRef.message = message;
                this.componentRef.confirmFn = () => resolve(true);
                this.componentRef.cancelFn = () => resolve(false);
                this.componentRef.visible = true;
            } else {
                // Fallback if not registered (shouldn't happen if setup correctly)
                resolve(window.confirm(message));
            }
        });
    }
}
