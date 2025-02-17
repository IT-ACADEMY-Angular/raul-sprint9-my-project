import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { BookingComponent } from './components/booking/booking.component';
import { NewCompanyComponent } from './components/new-company/new-company.component';
import { PendingBookingsComponent } from './components/pending-bookings/pending-bookings.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { hideProfileIcon: false, title: 'ZYTAPP' } },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { hideProfileIcon: true } },
  // { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { hideProfileIcon: true, title: 'PERFIL' } },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthGuard], data: { hideProfileIcon: true, title: 'EDITAR PERFIL' } },
  { path: 'booking/:id', component: BookingComponent, data: { hideProfileIcon: false } },
  { path: 'new-company', component: NewCompanyComponent, data: { hideProfileIcon: false } },
  { path: 'pending-booking', component: PendingBookingsComponent, data: { hideProfileIcon: false } },
  { path: 'login', component: LoginComponent, data: { hideProfileIcon: true, title: 'LOGIN' } },
  { path: 'register', component: RegisterComponent, data: { hideProfileIcon: true, title: 'REGISTRARSE' } },
];