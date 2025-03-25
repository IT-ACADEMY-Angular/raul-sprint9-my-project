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

  morningTimes: string[] = [
    '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45',
    '13:00', '13:15', '13:30', '13:45'
  ];

  afternoonTimes: string[] = [
    '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45',
    '17:00', '17:15', '17:30', '17:45',
    '18:00', '18:15', '18:30', '18:45',
    '19:00', '19:15', '19:30', '19:45',
    '20:00', '20:15', '20:30', '20:45'
  ];

  tasksForSelectedWorker: any[] = [];

  @ViewChild('timePillsContainer') timePillsContainer!: ElementRef;
  @ViewChild('extraDropdownsContainer') extraDropdownsContainer!: ElementRef;
  @ViewChild('workerDropdownContainer') workerDropdownContainer!: ElementRef;
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
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.companyService.getCompany(+id).subscribe(company => {
            this.company = company;
            this.workers = company.workers || [];
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
    this.selectedSchedule = '';
    this.selectedHour = '';

    setTimeout(() => {
      this.scrollToExtraDropdowns();
      this.checkFormCompletionAndScroll();
    }, 0);
  }

  scrollToExtraDropdowns(): void {
    if (this.extraDropdownsContainer) {
      this.extraDropdownsContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  selectTask(task: any): void {
    this.selectedTask = `${task.name} (${task.duration} min)`;
    this.checkFormCompletionAndScroll();
  }

  selectSchedule(range: string): void {
    this.selectedSchedule = range;
    this.selectedHour = '';
    setTimeout(() => {
      this.scrollToTimePills();
      this.checkFormCompletionAndScroll();
    }, 0);
  }

  scrollToTimePills(): void {
    if (this.timePillsContainer) {
      this.timePillsContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  selectHour(hour: string): void {
    this.selectedHour = hour;
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
      this.selectedSchedule !== '' &&
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

  dateFilter = (d: Date | null): boolean => {
    if (!d || !this.company || !this.company.workingDays) {
      return false;
    }
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    return this.company.workingDays.includes(day);
  };

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
}