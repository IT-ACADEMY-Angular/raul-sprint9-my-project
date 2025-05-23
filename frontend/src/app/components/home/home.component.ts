import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { Company, CompanyService } from '../../services/company.service';
import { HomeData } from '../../resolvers/home.resolver';

@Component({
  selector: 'home-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  titulo: string = '¿ DÓNDE TE GUSTARÍA PEDIR CITA ?';
  citasPendientes: number = 0;
  crearEmpresa: string = '¡ REGISTRA TU EMPRESA !';
  userHasCompany: boolean = false;
  userCompanyName: string = '';
  user: User | null = null;
  citasPendientesText: string = 'TUS CITAS PENDIENTES';
  isLoggedIn: boolean = false;

  searchControl = new FormControl('');
  searchResults: Company[] = [];
  bookingCount: number = 0;

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private companyService: CompanyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe((data: any) => {
      const { company, bookings } = data.homeData as HomeData;
      this.userHasCompany = company !== null;
      if (company) {
        this.userCompanyName = company.name;
      }
      this.bookingCount = bookings.length;
    });

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string | null) => {
        const term = query || '';
        if (term.trim() !== '') {
          return this.companyService.searchCompanies(term);
        }
        return of([]);
      })
    ).subscribe((results: Company[]) => {
      this.searchResults = results;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      this.searchResults = [];
    }
  }

  searchBooking(): void { }

  selectCompany(company: Company): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/booking', company.id]);
    }
  }

  goToPendingBooking(): void {
    this.router.navigate(['/pending-booking']);
  }

  goToManageCompany(): void {
    this.router.navigate(['/company-management']);
  }

  goToNewCompany(): void {
    alert("¡Pago realizado! (Simulación de pasarela de pago)");
    this.router.navigate(['/new-company']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  onSearchFocus(): void {
    const currentValue = this.searchControl.value?.trim();
    if (!currentValue) {
      this.companyService.getAllCompanies().subscribe((companies: Company[]) => {
        this.searchResults = companies.sort((a, b) => a.name.localeCompare(b.name));
      });
    }
  }

  goToEditCompany(): void {
    this.router.navigate(['/edit-company']);
  }
}