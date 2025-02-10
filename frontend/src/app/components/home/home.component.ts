import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'home-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  titulo: string = '¿ DÓNDE TE GUSTARÍA PEDIR CITA ?';
  citasPendientes: number = 0;
  crearEmpresa: string = '¡ REGISTRA TU EMPRESA !';
  user: string = 'raulraul@gmail.com'
  citasPendientesText: string = 'CITAS PENDIENTES'

  searchText: string = '';

  constructor(private router: Router) { }

  searchBooking() {
    this.router.navigate(['/booking']);
  }

  goToPendingBooking() {
    this.router.navigate(['/pending-booking']);
  }

  goToNewCompany() {
    this.router.navigate(['/new-company']);
  }
}