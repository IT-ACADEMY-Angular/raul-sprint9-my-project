import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  taskNameDuplicate: boolean = false;

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

  private originalWorkerSnapshot: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['worker']) {
      this.loadWorkerData();
    }
  }

  private loadWorkerData(): void {
    if (this.worker) {
      this.startTime = this.worker.startTime || '';
      this.endTime = this.worker.endTime || '';
      this.breakStart = this.worker.breakStart || '';
      this.breakEnd = this.worker.breakEnd || '';

      const existingDays = this.worker.workingDays || [];
      this.workingDays.forEach(day => {
        day.selected = existingDays.includes(day.value);
      });

      this.originalWorkerSnapshot = JSON.stringify({
        name: this.worker.name,
        workingDays: existingDays.sort(),
        startTime: this.startTime,
        endTime: this.endTime,
        breakStart: this.breakStart,
        breakEnd: this.breakEnd,
        tasks: this.worker.tasks || []
      });
    }
  }

  validateTaskName(): void {
    const trimmedName = this.newTaskName.trim();
    if (!trimmedName) {
      this.taskNameDuplicate = false;
      return;
    }
    if (this.worker.tasks && this.worker.tasks.some(task => task.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
      this.taskNameDuplicate = true;
    } else {
      this.taskNameDuplicate = false;
    }
  }

  addTask(): void {
    const trimmedName = this.newTaskName.trim();
    if (trimmedName && this.newTaskDuration) {
      if (this.worker.tasks && this.worker.tasks.some(task => task.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
        this.taskNameDuplicate = true;
        return;
      }
      if (!this.worker.tasks) {
        this.worker.tasks = [];
      }
      this.worker.tasks = [
        ...this.worker.tasks,
        { name: trimmedName, duration: this.newTaskDuration }
      ];
      this.newTaskName = '';
      this.newTaskDuration = null;
      this.taskNameDuplicate = false;

      setTimeout(() => {
        const container = this.modalBody?.nativeElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 300);
    }
  }

  save(): void {
    this.worker.workingDays = this.workingDays.filter(day => day.selected).map(day => day.value);
    this.worker.startTime = this.startTime;
    this.worker.endTime = this.endTime;
    this.worker.breakStart = this.breakStart;
    this.worker.breakEnd = this.breakEnd;
    this.closeModal.emit(this.worker);
  }

  cancel(): void {
    this.cancelModal.emit();
  }

  onRemoveTask(index: number): void {
    if (this.worker.tasks) {
      this.worker.tasks = this.worker.tasks.filter((_, i) => i !== index);
    }
  }

  get isSaveEnabled(): boolean {
    const hasName = !!this.worker.name && this.worker.name.trim().length > 0;
    const nameProfanity = false;
    const tasksValid = true;

    const hasWorkingDays = this.workingDays.some(day => day.selected);
    const hasStartTime = !!this.startTime && this.startTime.trim().length > 0;
    const hasEndTime = !!this.endTime && this.endTime.trim().length > 0;
    const hasBreakStart = !!this.breakStart && this.breakStart.trim().length > 0;
    const hasBreakEnd = !!this.breakEnd && this.breakEnd.trim().length > 0;
    const hasTask = !!this.worker.tasks && this.worker.tasks.length > 0;
    return hasName && !nameProfanity && hasWorkingDays && hasStartTime && hasEndTime && hasBreakStart && hasBreakEnd && hasTask && tasksValid;
  }

  get isModified(): boolean {
    const currentSnapshot = JSON.stringify({
      name: this.worker.name,
      workingDays: this.workingDays.filter(day => day.selected).map(day => day.value).sort(),
      startTime: this.startTime,
      endTime: this.endTime,
      breakStart: this.breakStart,
      breakEnd: this.breakEnd,
      tasks: this.worker.tasks || []
    });
    return currentSnapshot !== this.originalWorkerSnapshot;
  }
}