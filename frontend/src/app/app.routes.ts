import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeResolver } from './resolvers/home.resolver';
import { CompanyResolver } from './resolvers/company.resolver';
import { BookingResolver } from './resolvers/booking.resolver';
import { PendingBookingsResolver } from './resolvers/pending-bookings.resolver';
import { BookingResultsResolver } from './resolvers/booking-results.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then(
        (m) => m.HomeComponent
      ),
    resolve: { homeData: HomeResolver },
    data: { hideProfileIcon: false, title: 'ZYTAPP' },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
    resolve: { company: CompanyResolver },
    data: { hideProfileIcon: true },
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./components/edit-profile/edit-profile.component').then(
        (m) => m.EditProfileComponent
      ),
    canActivate: [AuthGuard],
    data: { hideProfileIcon: true },
  },
  {
    path: 'booking/:id',
    loadComponent: () =>
      import('./components/booking/booking.component').then(
        (m) => m.BookingComponent
      ),
    resolve: { companyData: BookingResolver },
    data: { hideProfileIcon: true },
  },
  {
    path: 'new-company',
    loadComponent: () =>
      import('./components/new-company/new-company.component').then(
        (m) => m.NewCompanyComponent
      ),
    data: { hideProfileIcon: true },
  },
  {
    path: 'pending-booking',
    loadComponent: () =>
      import('./components/pending-bookings/pending-bookings.component').then(
        (m) => m.PendingBookingsComponent
      ),
    resolve: { bookings: PendingBookingsResolver },
    data: { hideProfileIcon: true },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: { hideProfileIcon: true },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    data: { hideProfileIcon: true },
  },
  {
    path: 'company-management',
    loadComponent: () =>
      import('./components/company-management/company-management.component').then(
        (m) => m.CompanyManagementComponent
      ),
    resolve: { company: CompanyResolver },
    data: { hideProfileIcon: true },
  },
  {
    path: 'bookings-results',
    loadComponent: () =>
      import('./components/bookings-results/bookings-results.component').then(
        (m) => m.BookingsResultsComponent
      ),
    data: { hideProfileIcon: true },
    resolve: { bookingData: BookingResultsResolver }

  },
  {
    path: 'edit-company',
    loadComponent: () =>
      import('./components/edit-company/edit-company.component').then(
        (m) => m.EditCompanyComponent
      ),
    resolve: { company: CompanyResolver },
    data: { hideProfileIcon: true },
  },
];