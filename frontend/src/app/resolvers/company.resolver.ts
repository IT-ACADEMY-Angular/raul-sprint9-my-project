import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Company } from '../interfaces/company.interface';
import { CompanyService } from '../services/company.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyResolver implements Resolve<Company | null> {
  constructor(
    private authService: AuthService,
    private companyService: CompanyService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Company | null> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return of(null);
    }
    return from(this.companyService.getCompanyByUserId(user.id)).pipe(
      catchError(err => {
        console.error('Error en CompanyResolver:', err);
        return of(null);
      })
    );
  }
}
