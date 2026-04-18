import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../../shared/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
})
export class TaskItemComponent implements OnInit {
  @Input({ required: true }) task!: Task;
  @Input() editing = false;

  @Output() toggleComplete = new EventEmitter<Task>();
  @Output() editStart = new EventEmitter<Task>();
  @Output() editSave = new EventEmitter<{ task: Task; title: string; description: string }>();
  @Output() editCancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<Task>();

  private readonly fb = inject(FormBuilder);
  editForm!: FormGroup;

  ngOnInit(): void {
    this.editForm = this.fb.group({
      title: [this.task.title, [Validators.required]],
      description: [this.task.description, [Validators.required]],
    });
  }

  onSave(): void {
    if (this.editForm.invalid) return;
    const { title, description } = this.editForm.value;
    this.editSave.emit({ task: this.task, title, description });
  }
}
