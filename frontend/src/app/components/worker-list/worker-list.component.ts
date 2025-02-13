import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkerData } from '../../models/worker.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'worker-list-component',
  imports: [CommonModule],
  templateUrl: './worker-list.component.html',
  styleUrl: './worker-list.component.css'
})
export class WorkerListComponent {
  @Input() workers: WorkerData[] = [];

  @Output() workersChange = new EventEmitter<WorkerData[]>();

  removeWorker(index: number): void {
    this.workers.splice(index, 1);
    this.workersChange.emit(this.workers);
  }
}