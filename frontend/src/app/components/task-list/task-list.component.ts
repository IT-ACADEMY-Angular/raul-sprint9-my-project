import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../interfaces/task.interface';

@Component({
  selector: 'task-list-component',
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() removeTask = new EventEmitter<number>();

  onRemoveTask(index: number): void {
    this.removeTask.emit(index);
  }
}