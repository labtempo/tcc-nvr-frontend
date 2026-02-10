import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
    selector: 'app-user-create-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
        
        <div class="modal-header">
          <h3>Novo Usuário</h3>
          <p>Adicione um novo membro à equipe com função de Visualizador.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #userForm="ngForm">
          
          <div class="form-group">
            <label for="fullName">Nome Completo</label>
            <input type="text" id="fullName" name="fullName" 
                   [(ngModel)]="fullName" required 
                   class="form-control" placeholder="Ex: João Silva">
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" 
                   [(ngModel)]="email" required email
                   class="form-control" placeholder="usuario@sistema.com">
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" name="password" 
                   [(ngModel)]="password" required minlength="6"
                   class="form-control" placeholder="••••••••">
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-ghost" (click)="close.emit()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isLoading ? 'Criando...' : 'Criar Usuário' }}
            </button>
          </div>

        </form>

      </div>
    </div>
  `,
    styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-card {
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      border-radius: 16px;
      background: #111827; /* Darker background */
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-header h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .modal-header p {
      color: #9ca3af;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #d1d5db;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-ghost {
      background: transparent;
      color: #9ca3af;
      border: 1px solid transparent; /* Align height */
    }
    .btn-ghost:hover {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class UserCreateModalComponent {
    @Output() close = new EventEmitter<void>();
    @Output() userCreated = new EventEmitter<void>();

    fullName = '';
    email = '';
    password = '';
    isLoading = false;

    constructor(
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    onBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.close.emit();
        }
    }

    onSubmit() {
        this.isLoading = true;
        const userData = {
            full_name: this.fullName,
            email: this.email,
            password: this.password
        };

        this.authService.createUser(userData).subscribe({
            next: () => {
                this.toastService.success(`Usuário ${this.email} criado com sucesso!`);
                this.isLoading = false;
                this.userCreated.emit();
                this.close.emit();
            },
            error: (err) => {
                console.error('Erro ao criar usuário:', err);
                this.toastService.error('Erro ao criar usuário. Verifique os dados e tente novamente.');
                this.isLoading = false;
            }
        });
    }
}
