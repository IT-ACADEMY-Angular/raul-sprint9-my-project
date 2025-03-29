import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../interfaces/booking.interface';
import { BookingService } from '../../services/booking.service';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-bookings-results',
  imports: [CommonModule],
  templateUrl: './bookings-results.component.html',
  styleUrl: './bookings-results.component.css'
})
export class BookingsResultsComponent {
  breadcrumb: string = 'Gestión de citas';
  company: any;
  selectedDate!: Date;
  selectedWorker!: string;
  bookings: Booking[] = [];
  datePipe: DatePipe = new DatePipe('en-US');

  intervals: string[] = [];
  private pxPerMinute: number = 25 / 5;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private companyService: CompanyService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const companyIdStr = params.get('companyId');
      const dateStr = params.get('date');
      const worker = params.get('worker');
      if (companyIdStr && dateStr && worker) {
        const companyId = +companyIdStr;
        this.selectedDate = new Date(dateStr);
        this.selectedWorker = worker;
        this.companyService.getCompany(companyId).subscribe(company => {
          this.company = company;
          this.generateIntervalsFromWorker();
          this.loadBookings();
        }, error => {
          console.error('Error al obtener la empresa:', error);
          this.router.navigate(['/']);
        });
      } else {
        console.error('Datos insuficientes en los query parameters');
        this.router.navigate(['/']);
      }
    });
  }

  private generateIntervalsFromWorker(): void {
    const worker = this.company.workers.find((w: any) => w.name === this.selectedWorker);
    if (worker && worker.startTime && worker.endTime) {
      const fixedInterval = 5;
      this.intervals = [];
      const startMinutes = this.timeToMinutes(worker.startTime);
      const endMinutes = this.timeToMinutes(worker.endTime);
      for (let m = startMinutes; m + fixedInterval <= endMinutes; m += fixedInterval) {
        this.intervals.push(this.minutesToTime(m));
      }
      this.intervals.push(worker.endTime);
    }
  }

  loadBookings(): void {
    this.bookingService.getAllBookings().subscribe((allBookings: Booking[]) => {
      const selectedDateStr = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.bookings = allBookings.filter(b => {
        const bookingDateStr = this.datePipe.transform(new Date(b.bookingDate), 'yyyy-MM-dd');
        return b.company.id === this.company.id &&
          bookingDateStr === selectedDateStr &&
          b.selectedWorker === this.selectedWorker;
      });
    }, error => {
      console.error('Error al cargar reservas:', error);
    });
  }

  calculateEventStyle(booking: Booking): { [key: string]: string } {
    if (!booking.selectedHour) {
      return { top: '0px', height: '0px' };
    }
    const worker = this.company.workers.find((w: any) => w.name === this.selectedWorker);
    if (!worker || !worker.startTime) {
      return { top: '0px', height: '0px' };
    }
    const [startHourStr, startMinuteStr] = booking.selectedHour.split(':');
    const workerStartMinutes = this.timeToMinutes(worker.startTime);
    const bookingStartMinutes = this.timeToMinutes(booking.selectedHour);
    const minutesSinceStart = bookingStartMinutes - workerStartMinutes;
    const duration = this.extractDuration(booking.selectedTask);
    const height = this.minutesToPixels(duration);
    const topOffset = this.minutesToPixels(minutesSinceStart);

    return {
      top: `${topOffset}px`,
      height: `${height}px`
    };
  }

  calculateEndTime(booking: Booking): string {
    if (!booking.selectedHour) {
      return '';
    }
    const [startHourStr, startMinuteStr] = booking.selectedHour.split(':');
    const startDate = new Date(this.selectedDate);
    startDate.setHours(parseInt(startHourStr, 10), parseInt(startMinuteStr, 10), 0, 0);
    const duration = this.extractDuration(booking.selectedTask);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().slice(0, 5);
  }

  calculateBreakStyle(): { [key: string]: string } {
    const worker = this.company.workers.find((w: any) => w.name === this.selectedWorker);
    if (!worker || !worker.breakStart || !worker.breakEnd || !worker.startTime) {
      return {};
    }
    const workerStartMinutes = this.timeToMinutes(worker.startTime);
    const breakStartMinutes = this.timeToMinutes(worker.breakStart);
    const breakEndMinutes = this.timeToMinutes(worker.breakEnd);
    const topOffset = this.minutesToPixels(breakStartMinutes - workerStartMinutes);
    const height = this.minutesToPixels(breakEndMinutes - breakStartMinutes);
    return {
      top: `${topOffset}px`,
      height: `${height}px`
    };
  }

  hasBreak(): boolean {
    const worker = this.company?.workers?.find((w: any) => w.name === this.selectedWorker);
    return !!(worker && worker.breakStart && worker.breakEnd);
  }

  private minutesToPixels(minutes: number): number {
    return Math.round(minutes * this.pxPerMinute);
  }

  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private extractDuration(taskStr: string): number {
    const match = taskStr.match(/\((\d+)\s*min\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  getBookingForInterval(interval: string): Booking | null {
    return this.bookings.find(b => b.selectedHour === interval) || null;
  }

  editBooking(booking: Booking): void {
    const dialogRef = this.dialog.open(BookingModalComponent, {
      width: '400px',
      data: {
        booking,
        customerName: booking.user?.name || 'Cliente desconocido',
        task: booking.selectedTask
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'save') {
          this.bookingService.updateBooking(result.bookingId, result.payload).subscribe(() => {
            this.loadBookings();
          }, error => {
            console.error('Error al actualizar la reserva:', error);
          });
        } else if (result.action === 'delete') {
          this.bookingService.deleteBooking(result.booking.id).subscribe(() => {
            this.loadBookings();
          }, error => {
            console.error('Error al eliminar reserva:', error);
          });
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/company-management']);
  }

  getWorkerBreakTime(): string {
    const worker = this.company?.workers?.find((w: any) => w.name === this.selectedWorker);
    if (worker && worker.breakStart && worker.breakEnd) {
      return `${worker.breakStart} - ${worker.breakEnd}`;
    }
    return '';
  }
}
