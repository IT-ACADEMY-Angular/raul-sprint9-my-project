import { Component } from '@angular/core';
import { TaskListComponent } from '../task-list/task-list.component';

@Component({
  selector: 'edit-worker-component',
  imports: [TaskListComponent],
  templateUrl: './edit-worker.component.html',
  styleUrl: './edit-worker.component.css'
})
export class EditWorkerComponent {
  breadcrumb: string = 'Editar trabajador';

  goBack() {
    window.history.back();
  }
}