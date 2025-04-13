import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { Booking } from '../interfaces/booking.interface';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PendingBookingsResolver implements Resolve<Booking[]> {

  constructor(private bookingService: BookingService, private authService: AuthService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Booking[]> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      return this.bookingService.getBookingsByUser(currentUser.id);
    } else {
      console.error('Usuario no autenticado en el resolver.');
      return EMPTY;
    }
  }
}