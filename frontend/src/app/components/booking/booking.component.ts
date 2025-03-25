import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';
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

  availableSlots: string[] = [];

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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state && (nav.extras.state as any).company) {
      this.company = (nav.extras.state as any).company;
      this.workers = this.company.workers || [];
      this.generateSlots();
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.companyService.getCompany(+id).subscribe(company => {
            this.company = company;
            this.workers = company.workers || [];
            this.generateSlots();
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
      this.checkFormCompletionAndScroll();
    }, 0);
  }

  selectTask(task: any): void {
    this.selectedTask = `${task.name} (${task.duration} min)`;
    setTimeout(() => {
      this.scrollToSlots();
    }, 0);
    this.checkFormCompletionAndScroll();
  }

  selectHour(slot: string): void {
    this.selectedHour = slot;
    this.checkFormCompletionAndScroll();
  }

  dateChanged(date: Date): void {
    this.selectedDate = date;
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
      userId: currentUser.id
    };

    this.bookingService.createBooking(payload).subscribe(
      (booking: Booking) => {
        this.router.navigate(['/pending-booking']);
      },
      error => {
        console.error('Error al crear la reserva:', error);
      }
    );
  }

  generateSlots(): void {
    if (this.company && this.company.startTime && this.company.endTime && this.company.appointmentInterval) {
      this.availableSlots = this.generateTimeSlots(
        this.company.startTime,
        this.company.endTime,
        this.company.appointmentInterval,
        this.company.breakStart,
        this.company.breakEnd
      );
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
      slots.push(minutesToTime(m));
    }
    return slots;
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