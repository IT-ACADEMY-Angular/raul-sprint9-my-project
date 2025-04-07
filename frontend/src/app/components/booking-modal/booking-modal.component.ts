import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BookingModalData } from '../../interfaces/booking-modal-data.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';
import { ToastrService } from 'ngx-toastr';

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

  modificationError: string = '';
  isModificationValid: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<BookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingModalData,
    private bookingService: BookingService,
    private dialog: MatDialog,
    private toastr: ToastrService
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

  ngOnInit(): void {
    this.validateModification();
  }

  get isModified(): boolean {
    return this.editableDate !== this.originalDate || this.editableTime !== this.originalTime;
  }

  validateModification(): void {
    this.modificationError = '';

    if (this.data.booking.company && this.data.booking.company.workers) {
      const worker = this.data.booking.company.workers.find((w: any) => w.name === this.data.booking.selectedWorker);
      if (worker) {
        if (worker.workingDays) {
          const newDate = new Date(this.editableDate);
          const dayName = newDate.toLocaleDateString('en-US', { weekday: 'long' });
          if (!worker.workingDays.includes(dayName)) {
            this.modificationError = 'El día seleccionado no es laborable para el trabajador.';
          }
        }

        const serviceDuration = this.extractDuration(this.data.task);
        const newTime = this.timeToMinutes(this.editableTime);
        const workerStart = this.timeToMinutes(worker.startTime);
        const workerEnd = this.timeToMinutes(worker.endTime);
        if (newTime < workerStart || (newTime + serviceDuration) > workerEnd) {
          this.modificationError = 'El horario seleccionado está fuera de la jornada laboral del trabajador.';
        }

        if (!this.modificationError && worker.breakStart && worker.breakEnd) {
          const breakStart = this.timeToMinutes(worker.breakStart);
          const breakEnd = this.timeToMinutes(worker.breakEnd);
          if (newTime < breakEnd && (newTime + serviceDuration) > breakStart) {
            this.modificationError = 'El trabajador tiene su descanso a esta hora, por favor elige otra.';
          }
        }
      } else {
        this.modificationError = 'Trabajador no encontrado en la empresa.';
      }
    }

    if (!this.modificationError && this.data.booking.company && this.editableDate) {
      const serviceDuration = this.extractDuration(this.data.task);
      const newStart = this.timeToMinutes(this.editableTime);
      const newEnd = newStart + serviceDuration;
      this.bookingService.getAppointments(this.data.booking.company.id, new Date(this.editableDate))
        .subscribe(appointments => {
          const currentUserId = this.data.booking.user ? this.data.booking.user.id : null;
          const otherAppointments = appointments.filter(app => {
            const appUserId = app.user && app.user.id ? app.user.id : currentUserId;
            return app.id !== this.data.booking.id && appUserId === currentUserId;
          });
          for (const app of otherAppointments) {
            const appStart = this.timeToMinutes(app.selectedHour);
            const appDuration = app.duration || this.extractDuration(app.selectedTask);
            const appEnd = appStart + appDuration;
            if (newStart < appEnd && newEnd > appStart) {
              this.modificationError = 'No te puedes dividir en 2 :) Ya tienes una cita reservada en este horario.';
              break;
            }
          }
          this.isModificationValid = this.isModified && this.modificationError === '';
        });
    } else {
      this.isModificationValid = this.isModified && this.modificationError === '';
    }
  }

  private extractDuration(taskStr: string): number {
    const match = taskStr.match(/\((\d+)\s*min\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  onSave(): void {
    this.validateModification();
    if (!this.isModificationValid) {
      return;
    }
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
        this.toastr.success(
          'Booking modificado correctamente',
          '',
          {
            timeOut: 5000,
            positionClass: 'toast-bottom-full-width',
            progressBar: true,
            progressAnimation: 'increasing'
          }
        );
        const updatedPayload = {
          bookingDate: new Date(this.editableDate),
          selectedHour: this.editableTime
        };
        this.dialogRef.close({ action: 'save', bookingId: this.data.booking.id, payload: updatedPayload });
      }
    });
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
        this.toastr.success(
          'Booking eliminado correctamente',
          '',
          {
            timeOut: 5000,
            positionClass: 'toast-bottom-full-width',
            progressBar: true,
            progressAnimation: 'increasing'
          }
        );
        this.dialogRef.close({ action: 'delete', booking: this.data.booking });
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
