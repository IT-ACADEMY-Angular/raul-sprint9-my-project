import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../interfaces/task.interface';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirmDialogComponent } from '../modal-confirm-dialog/modal-confirm-dialog.component';

@Component({
  selector: 'task-list-component',
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() removeTask = new EventEmitter<number>();

  constructor(private dialog: MatDialog) { }

  onRemoveTask(index: number): void {
    const task = this.tasks[index];
    const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {
      data: {
        title: 'Eliminar tarea',
        message: `¿Está seguro de que desea eliminar la tarea "${task.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.removeTask.emit(index);
      }
    });
  }
}