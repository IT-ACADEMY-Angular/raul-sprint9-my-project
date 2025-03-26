import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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

  @ViewChild('modalBody') modalBody!: ElementRef;

  newTaskName: string = '';
  newTaskDuration: number | null = null;

  workingDays = [
    { label: 'Lunes', value: 'Monday', selected: false },
    { label: 'Martes', value: 'Tuesday', selected: false },
    { label: 'Miércoles', value: 'Wednesday', selected: false },
    { label: 'Jueves', value: 'Thursday', selected: false },
    { label: 'Viernes', value: 'Friday', selected: false },
    { label: 'Sábado', value: 'Saturday', selected: false },
    { label: 'Domingo', value: 'Sunday', selected: false },
  ];
  startTime: string = '';
  endTime: string = '';
  breakStart: string = '';
  breakEnd: string = '';

  addTask(): void {
    if (this.newTaskName.trim() && this.newTaskDuration) {
      if (!this.worker.tasks) {
        this.worker.tasks = [];
      }
      this.worker.tasks.push({ name: this.newTaskName.trim(), duration: this.newTaskDuration });
      this.newTaskName = '';
      this.newTaskDuration = null;

      setTimeout(() => {
        const container = this.modalBody?.nativeElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 300);
    }
  }

  save(): void {
    this.worker.schedule = {
      workingDays: this.workingDays.filter(day => day.selected).map(day => day.value),
      startTime: this.startTime,
      endTime: this.endTime,
      breakStart: this.breakStart,
      breakEnd: this.breakEnd
    };
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
    const hasName = !!this.worker.name && this.worker.name.trim().length > 0;
    const hasWorkingDays = this.workingDays.some(day => day.selected);
    const hasStartTime = !!this.startTime && this.startTime.trim().length > 0;
    const hasEndTime = !!this.endTime && this.endTime.trim().length > 0;
    const hasBreakStart = !!this.breakStart && this.breakStart.trim().length > 0;
    const hasBreakEnd = !!this.breakEnd && this.breakEnd.trim().length > 0;
    const hasTask = !!this.worker.tasks && this.worker.tasks.length > 0;
    return hasName && hasWorkingDays && hasStartTime && hasEndTime && hasBreakStart && hasBreakEnd && hasTask;
  }
}
