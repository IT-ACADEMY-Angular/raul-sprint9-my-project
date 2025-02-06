import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  goBack() {
    window.history.back();
  }

  guardarCambios() {
    console.log('Cambios guardados', this.nombre, this.apellidos, this.mail, this.telefono);
  }
}
