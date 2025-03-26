import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { Booking } from '../../interfaces/booking.interface';
import { BookingService } from '../../services/booking.service';
import { CreateBookingPayload } from '../../interfaces/create-booking-payload.interface';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogData } from '../../interfaces/confirm-dialog-data.interface';

@Component({
  selector: 'booking-component',
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatInputModule, MatFormFieldModule, MatNativeDateModule, MatDialogModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
  encapsulation: ViewEncapsulation.None

})
export class BookingComponent {
  breadcrumb: string = 'Reservar';

  company: any = null;
  workers: any[] = [];

  selectedWorker: string = '';
  selectedTask: string = '';
  selectedSchedule: string = '';
  selectedHour: string = '';
  selectedDate: Date | null = null;
  minDate: Date = new Date();

  selectedDuration: number = 0;

  allSlots: string[] = [];
  availableSlots: string[] = [];
  reservedSlots: string[] = [];
  tasksForSelectedWorker: any[] = [];

  @ViewChild('slotsContainer') slotsContainer!: ElementRef;
  @ViewChild('workerDropdownContainer') workerDropdownContainer!: ElementRef;
  @ViewChild('extraDropdownsContainer') extraDropdownsContainer!: ElementRef;
  @ViewChild('reserveButton') reserveButton!: ElementRef;

  private reserveButtonScrolled = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private dialog: MatDialog,
    private bookingService: BookingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state && (nav.extras.state as any).company) {
      this.company = (nav.extras.state as any).company;
      this.workers = this.company.workers || [];
      this.generateSlots();
      this.fetchReservedSlots();
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.companyService.getCompany(+id).subscribe(company => {
            this.company = company;
            this.workers = company.workers || [];
            this.generateSlots();
            this.fetchReservedSlots();
          }, error => {
            console.error('Error al obtener la empresa:', error);
            this.router.navigate(['/']);
          });
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.reserveButtonScrolled = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  selectWorker(name: string): void {
    this.selectedWorker = name;
    const worker = this.workers.find(w => w.name === name);
    if (worker) {
      this.tasksForSelectedWorker = worker.tasks || [];
    } else {
      this.tasksForSelectedWorker = [];
    }
    this.selectedTask = '';
    this.selectedHour = '';

    setTimeout(() => {
      if (this.extraDropdownsContainer) {
        this.extraDropdownsContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      this.fetchReservedSlots();
      this.checkFormCompletionAndScroll();
    }, 0);
  }

  selectTask(task: any): void {
    this.selectedTask = `${task.name} (${task.duration} min)`;
    this.selectedDuration = task.duration;

    this.generateSlots();
    this.fetchReservedSlots();

    setTimeout(() => {
      this.scrollToSlots();
    }, 0);
    this.checkFormCompletionAndScroll();
  }

  selectHour(slot: string): void {
    if (this.reservedSlots.includes(slot)) {
      return;
    }
    this.selectedHour = slot;
    this.checkFormCompletionAndScroll();
  }

  dateChanged(date: Date): void {
    this.selectedDate = date;
    this.generateSlots();
    this.fetchReservedSlots();
    this.checkFormCompletionAndScroll();
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
        this.confirmBooking();
      }
    });
  }

  get isFormComplete(): boolean {
    return !!this.selectedDate &&
      this.selectedWorker !== '' &&
      this.selectedTask !== '' &&
      this.selectedHour !== '';
  }

  confirmBooking(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado');
      return;
    }

    const payload: CreateBookingPayload = {
      bookingDate: this.selectedDate!,
      selectedWorker: this.selectedWorker,
      selectedTask: this.selectedTask,
      selectedSchedule: this.selectedSchedule,
      selectedHour: this.selectedHour,
      companyId: this.company.id,
      userId: currentUser.id,
      duration: this.selectedDuration
    };

    this.bookingService.createBooking(payload).subscribe(
      (booking: Booking) => {
        this.router.navigate(['/pending-booking']);
      },
      error => {
        this.snackBar.open('No te puedes dividir en 2 :) Ya tienes una cita reservada en este horario.', 'Cerrar', {
          duration: 8000,
          panelClass: ['snackbar-info']
        });
        console.error('Error al crear la reserva:', error);
      }
    );
  }

  generateSlots(): void {
    if (this.company && this.company.startTime && this.company.endTime) {
      this.allSlots = this.generateTimeSlots(
        this.company.startTime,
        this.company.endTime,
        5,
        this.company.breakStart,
        this.company.breakEnd
      );
      this.availableSlots = [...this.allSlots];
    }
  }

  generateTimeSlots(start: string, end: string, interval: number, breakStart?: string, breakEnd?: string): string[] {
    const slots: string[] = [];

    const timeToMinutes = (time: string): number => {
      const parts = time.split(':');
      return Number(parts[0]) * 60 + Number(parts[1]);
    };

    const minutesToTime = (minutes: number): string => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const breakStartMinutes = breakStart ? timeToMinutes(breakStart) : null;
    const breakEndMinutes = breakEnd ? timeToMinutes(breakEnd) : null;

    for (let m = startMinutes; m + interval <= endMinutes; m += interval) {
      const slotEnd = m + interval;
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        if (m < breakEndMinutes && slotEnd > breakStartMinutes) {
          continue;
        }
      }
      if (this.selectedDuration > 0 && (m + this.selectedDuration > endMinutes)) {
        continue;
      }
      slots.push(minutesToTime(m));
    }
    return slots;
  }

  applyDurationFilter(): void {
    if (this.company && this.company.breakStart && this.selectedDuration > 0) {
      const breakStartMinutes = this.timeToMinutes(this.company.breakStart);
      this.availableSlots = this.allSlots.filter(slot => {
        const slotMinutes = this.timeToMinutes(slot);
        if (slotMinutes < breakStartMinutes) {
          return (slotMinutes + this.selectedDuration) <= breakStartMinutes;
        }
        return true;
      });
    }
  }

  fetchReservedSlots(): void {
    if (this.company && this.selectedDate) {
      this.bookingService.getAppointments(this.company.id, this.selectedDate).subscribe((appointments: Booking[]) => {
        this.reservedSlots = [];
        appointments
          .filter(app => app.selectedWorker.trim().toLowerCase() === this.selectedWorker.trim().toLowerCase())
          .forEach(app => {
            const appStart = this.timeToMinutes(app.selectedHour);
            const appDuration = app.duration || 0;
            for (let m = appStart; m < appStart + appDuration; m += 5) {
              this.reservedSlots.push(this.minutesToTime(m));
            }
          });

        this.availableSlots = this.allSlots.filter(slot => {
          const candidateStart = this.timeToMinutes(slot);
          const candidateEnd = candidateStart + this.selectedDuration;
          for (let m = candidateStart; m < candidateEnd; m += 5) {
            if (this.reservedSlots.includes(this.minutesToTime(m))) {
              return false;
            }
          }
          if (this.company.breakStart) {
            const breakStartMinutes = this.timeToMinutes(this.company.breakStart);
            if (candidateStart < breakStartMinutes && candidateEnd > breakStartMinutes) {
              return false;
            }
          }
          return true;
        });
      });
    }
  }

  timeToMinutes(time: string): number {
    const parts = time.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  scrollToSlots(): void {
    if (this.slotsContainer) {
      this.slotsContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  checkFormCompletionAndScroll(): void {
    if (this.isFormComplete && !this.reserveButtonScrolled) {
      setTimeout(() => {
        if (this.reserveButton) {
          this.reserveButton.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
          this.reserveButtonScrolled = true;
        }
      }, 0);
    }
  }

  dateFilter = (d: Date | null): boolean => {
    if (!d || !this.company || !this.company.workingDays) {
      return false;
    }
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    return this.company.workingDays.includes(day);
  };
}