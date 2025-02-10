import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkerListComponent } from '../worker-list/worker-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'new-company-component',
  imports: [FormsModule, CommonModule, WorkerListComponent],
  templateUrl: './new-company.component.html',
  styleUrl: './new-company.component.css'
})
export class NewCompanyComponent {
  breadcrumb: string = 'Registrar empresa';

  constructor(private router: Router) { }

  goBack() {
    this.router.navigate(['/']);
  }
}