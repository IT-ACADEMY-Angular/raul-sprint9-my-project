import { Component, Input } from '@angular/core';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Booking } from '../../interfaces/booking.interface';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'booking-list-component',
  imports: [CommonModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent {
  private _bookings: Booking[] = [];

  @Input()
  set bookings(value: Booking[]) {
    this._bookings = value.sort((a, b) => {
      const dateA = new Date(a.bookingDate);
      const [hoursA, minutesA] = a.selectedHour.split(':').map(Number);
      dateA.setHours(hoursA, minutesA, 0, 0);

      const dateB = new Date(b.bookingDate);
      const [hoursB, minutesB] = b.selectedHour.split(':').map(Number);
      dateB.setHours(hoursB, minutesB, 0, 0);

      return dateA.getTime() - dateB.getTime();
    });
  }

  get bookings(): Booking[] {
    return this._bookings;
  }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private bookingService: BookingService,
    private toastr: ToastrService
  ) { }

  deleteBooking(bookingId: number): void {
    const dialogData: ConfirmDialogData = {
      title: 'Eliminar reserva',
      message: '¿Estás seguro que deseas eliminar la reserva seleccionada?'
    };

    const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookingService.deleteBooking(bookingId).subscribe(
          () => {
            this._bookings = this._bookings.filter(b => b.id !== bookingId);
            this.toastr.success(
              'Cita eliminada correctamente',
              '',
              {
                timeOut: 5000,
                positionClass: 'toast-bottom-full-width',
                progressBar: true,
                progressAnimation: 'increasing'
              }
            );
          },
          error => {
            console.error('Error al eliminar la reserva:', error);
            this.toastr.error(
              'Error al eliminar la reserva',
              'Error',
              {
                timeOut: 5000,
                positionClass: 'toast-bottom-full-width',
                progressBar: true,
                progressAnimation: 'increasing'
              }
            );
          }
        );
      }
    });
  }
}
