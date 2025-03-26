import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'company-management-component',
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatInputModule, MatFormFieldModule, MatNativeDateModule],
  templateUrl: './company-management.component.html',
  styleUrl: './company-management.component.css',
  encapsulation: ViewEncapsulation.None
})

export class CompanyManagementComponent implements OnInit {
  breadcrumb: string = 'Gestionar Empresa';

  company: any = null;
  workers: any[] = [];
  selectedWorker: string = '';
  selectedDate: Date | null = null;
  minDate: Date = new Date();

  showCalendar: boolean = false;

  dateFilter = (d: Date | null): boolean => {
    if (!d || !this.selectedWorker) {
      return false;
    }
    const worker = this.workers.find(w => w.name === this.selectedWorker);
    if (!worker || !worker.workingDays) {
      return false;
    }
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    return worker.workingDays.includes(day);
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state && (nav.extras.state as any).company) {
      this.company = (nav.extras.state as any).company;
      this.workers = this.company.workers || [];
    } else {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.companyService.getCompanyByUserId(currentUser.id)
          .then((company: any | null) => {
            if (company) {
              this.company = company;
              this.workers = company.workers || [];
            } else {
              console.error("No se encontró empresa para el usuario.");
            }
          })
          .catch((error: any) => {
            console.error('Error al obtener la empresa por usuario:', error);
            this.router.navigate(['/']);
          });
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  dateChanged(date: Date): void {
    this.selectedDate = date;
  }

  selectWorker(name: string): void {
    this.selectedWorker = name;
    this.selectedDate = null;
    this.showCalendar = false;
    setTimeout(() => {
      this.showCalendar = true;
    }, 0);
  }

  viewBookings(): void {
    if (!this.selectedDate) {
      console.error('Seleccione una fecha.');
      return;
    }
    this.router.navigate(['/bookings-results'], {
      queryParams: {
        companyId: this.company.id,
        date: this.selectedDate.toISOString(),
        worker: this.selectedWorker
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
