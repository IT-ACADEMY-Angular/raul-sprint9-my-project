import { Component } from '@angular/core';

@Component({
  selector: 'profile-component',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  perfil: string = 'PERFIL'
  goBack() {
    // window.history.back();
  }
}
