import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { RegisterPayload } from '../../interfaces/auth.interfaces';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'register-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  title: string = 'ZYTAPP';

  name: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phone: string = '';
  dataProtectionAccepted: boolean = false;
  submitted: boolean = false;

  emailError: string = '';
  passwordError: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(form: NgForm): void {
    this.submitted = true;
    this.emailError = '';
    this.passwordError = '';

    if (!this.dataProtectionAccepted) {
      return;
    }
    if (form.invalid) {
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    }

    const payload: RegisterPayload = {
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phone: this.phone,
    };

    this.authService.register(payload).subscribe(
      (response) => {
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error en el registro:', error);
        if (error.status === 409 && error.error && error.error.message) {
          this.emailError = error.error.message;
        } else {
          this.emailError = 'Ocurrió un error en el registro. Por favor, inténtelo de nuevo.';
        }
      }
    );
  }

  close(): void {
    this.router.navigate(['/']);
  }
}