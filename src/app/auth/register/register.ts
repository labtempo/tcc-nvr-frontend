import { Component } from '@angular/core';
import { AuthService } from '../auth';
import { Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [
    FormsModule,    
    RouterLink,     
    CommonModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  email = '';
  full_name = '';
  password = '';
  errorMessage: string | null = null;
  loading = false;

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    this.errorMessage = null;
    this.loading = true;
    this.authService.register(this.email, this.full_name, this.password).subscribe(
      () => {
        alert('Registro bem-sucedido! Faça login para continuar.');
        this.router.navigate(['/login']);
        this.loading = false;
      },
      error => {
        console.error('Erro no registro:', error);
        this.errorMessage = 'Erro no registro. Tente novamente.';
        this.loading = false;
      }
    );
  }
}