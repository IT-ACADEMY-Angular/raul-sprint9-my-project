import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RegisterPayload } from '../../interfaces/auth.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'register-component',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  title: string = 'ZYTAPP';

  name: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    const payload: RegisterPayload = {
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phone: this.phone,
    };

    this.authService.register(payload).subscribe(
      (response) => {
        console.log('Usuario registrado CORRECTAMENTE:', response);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error en el registro:', error);
      }
    );
  }

  close(): void {
    this.router.navigate(['/']);
  }
}
