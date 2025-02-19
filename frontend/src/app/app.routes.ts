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
import { CompanyManagementComponent } from './components/company-management/company-management.component';
import { BookingsResultsComponent } from './components/bookings-results/bookings-results.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { hideProfileIcon: false, title: 'ZYTAPP' } },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { hideProfileIcon: true } },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthGuard], data: { hideProfileIcon: true } },
  { path: 'booking/:id', component: BookingComponent, data: { hideProfileIcon: true } },
  { path: 'new-company', component: NewCompanyComponent, data: { hideProfileIcon: true } },
  { path: 'pending-booking', component: PendingBookingsComponent, data: { hideProfileIcon: true } },
  { path: 'login', component: LoginComponent, data: { hideProfileIcon: true } },
  { path: 'register', component: RegisterComponent, data: { hideProfileIcon: true } },
  { path: 'company-management', component: CompanyManagementComponent, data: { hideProfileIcon: true } },
  { path: 'bookings-results', component: BookingsResultsComponent, data: { hideProfileIcon: true } },
];