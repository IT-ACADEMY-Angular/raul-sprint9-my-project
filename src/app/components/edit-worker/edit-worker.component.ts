import { Component } from '@angular/core';

@Component({
  selector: 'edit-worker-component',
  imports: [],
  templateUrl: './edit-worker.component.html',
  styleUrl: './edit-worker.component.css'
})
export class EditWorkerComponent {
  breadcrumb: string = 'Editar trabajador';

  goBack() {
    window.history.back();
  }
}