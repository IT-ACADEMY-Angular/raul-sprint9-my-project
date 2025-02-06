import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'home-component',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  titulo: string = '¿ DÓNDE TE GUSTARÍA PEDIR CITA ?';
  citasPendientes: number = 0;
  crearEmpresa: string = '¡ REGISTRA TU EMPRESA !';
  user: string = 'raulraul@gmail.com'
  citasPendientesText: string = 'CITAS PENDIENTES'
}