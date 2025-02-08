import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { NewCompanyComponent } from './components/new-company/new-company.component';
import { EditWorkerComponent } from './components/edit-worker/edit-worker.component';
import { BookingComponent } from './components/booking/booking.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RegisterComponent, LoginComponent, NavbarComponent, HomeComponent, ProfileComponent, EditProfileComponent, NewCompanyComponent, EditWorkerComponent, BookingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ZYTAPP';
}
