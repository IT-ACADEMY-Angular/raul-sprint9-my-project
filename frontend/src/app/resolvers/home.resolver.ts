import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Company } from '../interfaces/company.interface';
import { Booking } from '../interfaces/booking.interface';
import { CompanyService } from '../services/company.service';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';

export interface HomeData {
  company: Company | null;
  bookings: Booking[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeResolver implements Resolve<HomeData> {
  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private bookingService: BookingService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HomeData> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of({ company: null, bookings: [] });
    }

    return forkJoin({
      company: from(this.companyService.getCompanyByUserId(user.id)).pipe(
        map((company: Company | null) => {
          if (company && (company as any).message) {
            return null;
          }
          return company;
        }),
        catchError(err => {
          console.error('Error en HomeResolver al obtener compañía:', err);
          return of(null);
        })
      ),
      bookings: this.bookingService.getBookingsByUser(user.id).pipe(
        catchError(err => {
          console.error('Error en HomeResolver al obtener reservas:', err);
          return of([]);
        })
      )
    });
  }
}
