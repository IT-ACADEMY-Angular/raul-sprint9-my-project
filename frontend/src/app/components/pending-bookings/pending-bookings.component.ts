import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'pending-bookings-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-bookings.component.html',
  styleUrl: './pending-bookings.component.css'
})
export class PendingBookingsComponent {
  breadcrumb: string = 'Citas pendientes';

  constructor(private dialog: MatDialog, private router: Router) { }

  goBack() {
    this.router.navigate(['/']);
  }

  deleteBooking() {
    const dialogData = {
      title: 'Eliminar cita',
      message: '¿Estás seguro que deseas eliminar la cita seleccionada?'
    };

    const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // confirma la eliminacion
        console.log('Cita eliminada.');
        // logica para eliminar cita, para hacer un DELETE en bbdd desde servicio
      } else {
        console.log('Eliminación cancelada.');
      }
    });
  }
}
