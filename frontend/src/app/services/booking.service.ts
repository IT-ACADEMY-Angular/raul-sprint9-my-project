import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateBookingPayload } from '../interfaces/create-booking-payload.interface';
import { Booking } from '../interfaces/booking.interface';
import { UpdateBookingPayload } from '../interfaces/update-booking-payload.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = '/booking';

  constructor(private http: HttpClient) { }

  createBooking(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, payload);
  }

  getBookingsByUser(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/user/${userId}`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/all`);
  }

  deleteBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${bookingId}`);
  }

  updateBooking(id: number, payload: UpdateBookingPayload): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}`, payload);
  }
}