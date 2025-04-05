import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then(
        (m) => m.HomeComponent
      ),
    data: { hideProfileIcon: false, title: 'ZYTAPP' },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
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
    data: { hideProfileIcon: true },
  },
  {
    path: 'bookings-results',
    loadComponent: () =>
      import('./components/bookings-results/bookings-results.component').then(
        (m) => m.BookingsResultsComponent
      ),
    data: { hideProfileIcon: true },
  },
  {
    path: 'edit-company',
    loadComponent: () =>
      import('./components/edit-company/edit-company.component').then(
        (m) => m.EditCompanyComponent
      ),
    data: { hideProfileIcon: true },
  },
];