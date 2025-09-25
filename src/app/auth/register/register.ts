import { Component } from '@angular/core';
import { AuthService } from '../auth';
import { Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [
    FormsModule,    
    RouterLink     
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  email = '';
  full_name = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    this.authService.register(this.email, this.full_name, this.password).subscribe(
      () => {
        alert('Registro bem-sucedido! Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Erro no registro:', error);
        alert('Erro no registro. Tente novamente.');
      }
    );
  }
}