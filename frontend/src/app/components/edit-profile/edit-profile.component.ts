import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'edit-profile-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {

  breadcrumb: string = 'Editar perfil';
  nombre: string = 'Raul';
  apellidos: string = 'Garcia Gutierrez';
  mail: string = 'raulgarcia@gmail.com';
  telefono: string = '656458558';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.nombre = user.name;
        this.apellidos = user.lastName;
        this.mail = user.email;
        this.telefono = user.phone;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  guardarCambios(): void {
    const payload = {
      name: this.nombre,
      lastName: this.apellidos,
      email: this.mail,
      phone: this.telefono,
    };

    this.authService.updateProfile(payload).subscribe(
      (updatedUser: User) => {
        console.log('Cambios guardados:', updatedUser);
        this.router.navigate(['/profile']);
      },
      (error) => {
        console.error('Error al guardar cambios:', error);
      }
    );
  }
}
