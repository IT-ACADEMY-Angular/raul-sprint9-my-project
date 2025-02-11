import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'login-component',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  title: string = 'ZYTAPP';

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  onLogin(): void {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        console.log('Login CORRECTO!:', response);
      },
      error => {
        console.error('Error en el login:', error);
      }
    );
  }
}