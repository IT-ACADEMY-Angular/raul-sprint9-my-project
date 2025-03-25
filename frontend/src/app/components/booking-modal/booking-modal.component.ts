import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BookingModalData } from '../../interfaces/booking-modal-data.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';

@Component({
  selector: 'app-booking-modal',
  imports: [CommonModule, FormsModule],

  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.css']
})
export class BookingModalComponent {
  editableDate: string;
  editableTime: string;
  originalDate: string;
  originalTime: string;

  constructor(
    public dialogRef: MatDialogRef<BookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingModalData,
    private bookingService: BookingService,
    private dialog: MatDialog
  ) {
    const bookingDate = new Date(data.booking.bookingDate);
    const year = bookingDate.getFullYear();
    const month = (bookingDate.getMonth() + 1).toString().padStart(2, '0');
    const day = bookingDate.getDate().toString().padStart(2, '0');
    this.editableDate = `${year}-${month}-${day}`;
    this.editableTime = data.booking.selectedHour;
    this.originalDate = this.editableDate;
    this.originalTime = this.editableTime;
  }

  get isModified(): boolean {
    return this.editableDate !== this.originalDate || this.editableTime !== this.originalTime;
  }

  onDelete(): void {
    const confirmData: ConfirmDialogData = {
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar la cita?'
    };
    const confirmDialogRef = this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: confirmData
    });
    confirmDialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.dialogRef.close({ action: 'delete', booking: this.data.booking });
      }
    });
  }

  onSave(): void {
    const confirmData: ConfirmDialogData = {
      title: 'Confirmar guardado',
      message: '¿Estás seguro de que deseas guardar los cambios?'
    };
    const confirmDialogRef = this.dialog.open(ModalConfirmDialogComponent, {
      width: '300px',
      data: confirmData
    });
    confirmDialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const updatedPayload = {
          bookingDate: new Date(this.editableDate),
          selectedHour: this.editableTime
        };
        this.dialogRef.close({ action: 'save', bookingId: this.data.booking.id, payload: updatedPayload });
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onCall(): void {
    const phone = (this.data.booking as any).user?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      console.error('Número de teléfono no disponible');
      this.dialogRef.close({ action: 'call', booking: this.data.booking });
    }
  }

  onWhatsapp(): void {
    const phone = (this.data.booking as any).user?.phone;
    if (phone) {
      const message = encodeURIComponent('Hola, deseo comunicarme con usted respecto a su cita.');
      window.location.href = `whatsapp://send?phone=${phone}&text=${message}`;
    } else {
      console.error('Número de teléfono no disponible para WhatsApp');
    }
  }
}
