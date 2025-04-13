import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingListComponent } from '../booking-list/booking-list.component';
import { Booking } from '../../interfaces/booking.interface';
import { BookingService } from '../../services/booking.service';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'pending-bookings-component',
  imports: [CommonModule, FormsModule, BookingListComponent],
  templateUrl: './pending-bookings.component.html',
  styleUrl: './pending-bookings.component.css'
})
export class PendingBookingsComponent {
  breadcrumb: string = 'Citas pendientes';
  bookings: Booking[] = [];
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService

  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.error('Usuario no autenticado');
      this.router.navigate(['/login']);
      return;
    }
    this.bookings = this.route.snapshot.data['bookings'];
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
