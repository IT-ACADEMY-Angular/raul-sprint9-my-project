import { Component } from '@angular/core';

@Component({
  selector: 'profile-component',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  breadcrumb: string = 'Perfil'
  goBack() {
    // window.history.back();
  }
}
