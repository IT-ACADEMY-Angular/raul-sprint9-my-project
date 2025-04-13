import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { forkJoin, Observable, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BookingService } from '../services/booking.service';
import { CompanyService } from '../services/company.service';

@Injectable({
  providedIn: 'root'
})
export class BookingResultsResolver implements Resolve<any> {

  constructor(
    private bookingService: BookingService,
    private companyService: CompanyService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const companyIdStr = route.queryParamMap.get('companyId');
    const dateStr = route.queryParamMap.get('date');
    const worker = route.queryParamMap.get('worker');

    if (!companyIdStr || !dateStr || !worker) {
      console.error('Datos insuficientes en los query parameters');
      this.router.navigate(['/']);
      return EMPTY;
    }

    const companyId = Number(companyIdStr);

    return forkJoin({
      company: this.companyService.getCompany(companyId),
      bookings: this.bookingService.getAllBookings()
    }).pipe(
      map(({ company, bookings }) => ({
        company,
        bookings,
        selectedDate: new Date(dateStr),
        selectedWorker: worker
      })),
      catchError(error => {
        console.error('Error en el resolver', error);
        this.router.navigate(['/']);
        return EMPTY;
      })
    );
  }
}