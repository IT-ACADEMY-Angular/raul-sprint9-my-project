import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'login-component',
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  title: string = 'ZYTAPP';

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        console.log('Login CORRECTO:', response);
        this.errorMessage = '';
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Error en el login:', error);
        this.errorMessage = '¡UPS! El mail o la contraseña no son correctos.';

      }
    );
  }

  close(): void {
    this.router.navigate(['/']);
  }
}