import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkerData } from '../../models/worker.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskListComponent } from '../task-list/task-list.component';

@Component({
  selector: 'edit-worker-modal-component',
  imports: [CommonModule, FormsModule, TaskListComponent],
  templateUrl: './edit-worker-modal.component.html',
  styleUrl: './edit-worker-modal.component.css'
})
export class EditWorkerModalComponent {
  @Input() worker!: WorkerData;
  @Output() closeModal = new EventEmitter<WorkerData>();
  @Output() cancelModal = new EventEmitter<void>();

  newTaskName: string = '';
  newTaskDuration: number | null = null;

  addTask(): void {
    if (this.newTaskName.trim() && this.newTaskDuration) {
      if (!this.worker.tasks) {
        this.worker.tasks = [];
      }
      this.worker.tasks.push({ name: this.newTaskName.trim(), duration: this.newTaskDuration });
      this.newTaskName = '';
      this.newTaskDuration = null;
    }
  }

  save(): void {
    this.closeModal.emit(this.worker);
  }

  cancel(): void {
    this.cancelModal.emit();
  }

  onRemoveTask(index: number): void {
    if (this.worker.tasks) {
      this.worker.tasks.splice(index, 1);
    }
  }

  get isSaveEnabled(): boolean {
    return (this.worker.tasks?.length || 0) > 0;
  }
}
