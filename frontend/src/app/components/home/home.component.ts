import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'home-component',
  imports: [CommonModule, FormsModule],
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

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
    });
  }

  searchBooking(): void {
    this.router.navigate(['/booking']);
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