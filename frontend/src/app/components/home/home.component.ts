import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { Company, CompanyService } from '../../services/company.service';

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
  user: User | null = null; citasPendientesText: string = 'CITAS PENDIENTES'
  searchText: string = '';
  isLoggedIn: boolean = false;

  searchControl = new FormControl('');
  searchResults: Company[] = [];

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private companyService: CompanyService
  ) { }

  ngOnInit(): void {
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

  searchBooking(): void {
    console.log('Buscar empresa:', this.searchControl.value);
  }

  selectCompany(company: Company): void {
    console.log('Empresa seleccionada:', company);
    this.router.navigate(['/booking'], { state: { company } });
  }

  goToPendingBooking(): void {
    this.router.navigate(['/pending-booking']);
  }

  goToNewCompany(): void {
    this.router.navigate(['/new-company']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}