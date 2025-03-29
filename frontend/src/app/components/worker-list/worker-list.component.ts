import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkerData } from '../../models/worker.model';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';

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

  constructor(private dialog: MatDialog) { }

  removeWorker(index: number): void {
    const worker = this.workers[index];
    const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {
      data: {
        title: 'Eliminar trabajador',
        message: `¿Está seguro de que desea eliminar al trabajador "${worker.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.workers.splice(index, 1);
        this.workersChange.emit(this.workers);
      }
    });
  }

  onEditWorker(worker: WorkerData, index: number): void {
    this.editWorker.emit({ worker, index });
  }
}