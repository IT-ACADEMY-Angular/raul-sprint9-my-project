import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompanyService } from '../services/company.service';

@Injectable({
  providedIn: 'root'
})
export class BookingResolver implements Resolve<any> {
  constructor(
    private companyService: CompanyService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }
    return this.companyService.getCompany(+id).pipe(
      catchError(error => {
        console.error('Error en el resolver: ', error);
        this.router.navigate(['/']);
        return EMPTY;
      })
    );
  }
}
