import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogData, ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';

@Component({
  selector: 'booking-component',
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatInputModule, MatFormFieldModule, MatNativeDateModule, MatDialogModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
  encapsulation: ViewEncapsulation.None

})
export class BookingComponent {
  breadcrumb: string = 'Reservar';
  selectedWorker: string = '';
  selectedService: string = '';
  selectedSchedule: string = '';
  selectedTime: string = '';

  selectedDate: Date | null = new Date();

  morningTimes: string[] = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'];
  afternoonTimes: string[] = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

  constructor(private dialog: MatDialog) { }

  goBack() {
    window.history.back();
  }

  selectWorker(name: string) {
    this.selectedWorker = name;
  }

  selectService(service: string) {
    this.selectedService = service;
  }

  selectSchedule(range: string) {
    this.selectedSchedule = range;
    this.selectedTime = '';
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  dateChanged(date: Date) {
    this.selectedDate = date;
    console.log('Fecha seleccionada:', date);
  }

  openConfirmModal(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Reserva',
      message: '¿Estás seguro de que deseas reservar?'
    };

    const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Reserva confirmada');
        // logica para confirmar cita
      } else {
        // cancel
        console.log('Reserva cancelada');
      }
    });
  }
}
