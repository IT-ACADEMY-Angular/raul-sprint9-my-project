import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { BookingComponent } from './components/booking/booking.component';
import { NewCompanyComponent } from './components/new-company/new-company.component';
import { PendingBookingsComponent } from './components/pending-bookings/pending-bookings.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'edit-profile', component: EditProfileComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'new-company', component: NewCompanyComponent },
  { path: 'pending-booking', component: PendingBookingsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];