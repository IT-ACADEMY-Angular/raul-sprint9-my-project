import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../interfaces/booking.interface';
import { BookingService } from '../../services/booking.service';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';

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
  private pxPerMinute: number = 25 / 15;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.generateIntervals(7, 21, 15);
    this.route.queryParamMap.subscribe(params => {
      const companyId = params.get('companyId');
      const dateStr = params.get('date');
      const worker = params.get('worker');
      if (companyId && dateStr && worker) {
        this.company = { id: +companyId };
        this.selectedDate = new Date(dateStr);
        this.selectedWorker = worker;
        this.loadBookings();
      } else {
        console.error('Datos insuficientes en los query parameters');
        this.router.navigate(['/']);
      }
    });
  }

  private generateIntervals(startHour: number, endHour: number, stepMinutes: number): void {
    this.intervals = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += stepMinutes) {
        const hh = hour.toString().padStart(2, '0');
        const mm = minute.toString().padStart(2, '0');
        this.intervals.push(`${hh}:${mm}`);
      }
    }
    this.intervals.push(`${endHour.toString().padStart(2, '0')}:00`);
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
    const [startHourStr, startMinuteStr] = booking.selectedHour.split(':');
    const startDate = new Date(this.selectedDate);
    startDate.setHours(parseInt(startHourStr, 10), parseInt(startMinuteStr, 10), 0, 0);
    const duration = this.extractDuration(booking.selectedTask);
    const height = this.minutesToPixels(duration);
    const minutesSinceStart = this.getMinutesSinceStart(startDate, 7);
    const topOffset = this.minutesToPixels(minutesSinceStart);
    return {
      top: `${topOffset}px`,
      height: `${height}px`
    };
  }

  calculateEndTime(booking: Booking): string {
    const [startHourStr, startMinuteStr] = booking.selectedHour.split(':');
    const startDate = new Date(this.selectedDate);
    startDate.setHours(parseInt(startHourStr, 10), parseInt(startMinuteStr, 10), 0, 0);
    const duration = this.extractDuration(booking.selectedTask);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().slice(0, 5);
  }

  private minutesToPixels(minutes: number): number {
    return minutes * this.pxPerMinute;
  }

  private getMinutesSinceStart(date: Date, startHour: number): number {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return (hours - startHour) * 60 + minutes;
  }

  private extractDuration(taskStr: string): number {
    const match = taskStr.match(/\((\d+)\s*min\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  getBookingForInterval(interval: string): Booking | null {
    return this.bookings.find(b => b.selectedHour === interval) || null;
  }

  editBooking(booking: Booking): void {
    const customerName = (booking as any).user?.name || 'Cliente desconocido';
    const task = booking.selectedTask;
    const durationMatch = task.match(/\((\d+\s*min)\)/);
    const duration = durationMatch ? durationMatch[1] : '';
    const hour = booking.selectedHour;
    const dateStr = new Date(booking.bookingDate).toLocaleDateString();

    const data = {
      customerName: customerName,
      task: task,
      duration: duration,
      hour: hour,
      date: dateStr,
      booking: booking
    };

    const dialogRef = this.dialog.open(BookingModalComponent, {
      width: '400px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'save') {
          this.bookingService.updateBooking(result.bookingId, result.payload).subscribe(updatedBooking => {
            console.log('Reserva actualizada:', updatedBooking);
            this.loadBookings();
          }, error => {
            console.error('Error al actualizar la reserva:', error);
          });
        } else if (result.action === 'delete') {
          this.bookingService.deleteBooking(result.booking.id).subscribe(() => {
            console.log('Reserva eliminada:', result.booking.id);
            this.loadBookings();
          }, error => {
            console.error('Error al eliminar reserva:', error);
          });
        } else if (result.action === 'call') {
          console.log('Llamar al cliente:', (booking as any).user?.phone);

        }
      }
    });
  }

  onIntervalClick(interval: string): void {
    const booking = this.getBookingForInterval(interval);
    if (booking) {
      this.editBooking(booking);
    }
  }

  goBack(): void {
    this.router.navigate(['/company-management']);
  }
}
