import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  loading = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    this.errorMessage = null;
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe(
      () => {
        console.log('Login bem-sucedido!');
        this.router.navigate(['/cameras']);
        this.loading = false;
      },
      error => {
        console.error('Erro no login:', error);
        this.errorMessage = 'Erro no login. Verifique suas credenciais.';
        this.loading = false;
      }
    );
  }
}