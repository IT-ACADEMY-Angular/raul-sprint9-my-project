import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'new-company-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './new-company.component.html',
  styleUrl: './new-company.component.css'
})
export class NewCompanyComponent {
  breadcrumb: string = 'Registrar empresa';

  goBack() {
    window.history.back();
  }

}
