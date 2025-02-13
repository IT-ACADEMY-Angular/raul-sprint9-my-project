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
  @Output() editWorker = new EventEmitter<{ worker: WorkerData; index: number }>();

  removeWorker(index: number): void {
    this.workers.splice(index, 1);
    this.workersChange.emit(this.workers);
  }

  onEditWorker(worker: WorkerData, index: number): void {
    this.editWorker.emit({ worker, index });
  }
}