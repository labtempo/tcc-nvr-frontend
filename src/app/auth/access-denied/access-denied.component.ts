import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-access-denied',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="denied-container">
      <div class="glass-panel content-card">
        <div class="icon-wrapper">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        
        <div class="actions">
          <button class="btn btn-primary" routerLink="/dashboard">
            <i class="bi bi-arrow-left"></i> Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .denied-container {
      height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0f172a;
      background-image: 
        radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(239, 68, 68, 0.15) 0px, transparent 50%);
    }

    .content-card {
      padding: 3rem;
      text-align: center;
      max-width: 450px;
      width: 90%;
      border: 1px solid rgba(239, 68, 68, 0.3); /* Red border for danger/alert feel */
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.1);
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }

    .icon-wrapper {
      font-size: 4rem;
      color: #ef4444;
      margin-bottom: 1.5rem;
      text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    p {
      color: #94a3b8;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
  `]
})
export class AccessDeniedComponent { }
