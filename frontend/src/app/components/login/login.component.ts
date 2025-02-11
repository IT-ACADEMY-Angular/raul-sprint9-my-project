import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'login-component',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  title: string = 'ZYTAPP';

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        console.log('Login CORRECTO:', response);
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Error en el login:', error);
      }
    );
  }

  close(): void {
    this.router.navigate(['/']);
  }
}