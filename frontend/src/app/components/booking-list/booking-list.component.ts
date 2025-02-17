import { Component, Input } from '@angular/core';
import { ConfirmDialogData, ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Booking } from '../../interfaces/booking.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'booking-list-component',
  imports: [CommonModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent {
  @Input() bookings: Booking[] = [];

  constructor(private dialog: MatDialog, private router: Router, private bookingService: BookingService) { }

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
        this.bookingService.deleteBooking(bookingId).subscribe(() => {
          this.bookings = this.bookings.filter(b => b.id !== bookingId);
          console.log('Reserva eliminada.');
        }, error => {
          console.error('Error al eliminar la reserva:', error);
        });
      } else {
        console.log('Eliminación cancelada.');
      }
    });
  }
}
