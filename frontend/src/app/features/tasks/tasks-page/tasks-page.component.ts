import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../shared/models/task.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TaskItemComponent } from '../task-item/task-item.component';

type FilterType = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TaskItemComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.scss'],
})
export class TasksPageComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.auth.currentUser;

  tasks = signal<Task[]>([]);
  loading = signal(true);
  submitting = signal(false);
  editingTaskId = signal<string | null>(null);
  activeFilter = signal<FilterType>('all');
  searchQuery = signal('');

  createForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  get filteredTasks(): Task[] {
    const q = this.searchQuery().toLowerCase();
    return this.tasks().filter((task) => {
      const matchesFilter =
        this.activeFilter() === 'all' ||
        (this.activeFilter() === 'pending' && !task.completed) ||
        (this.activeFilter() === 'completed' && task.completed);
      const matchesSearch =
        !q || task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.taskService
      .getTasks()
      .pipe(
        catchError(() => {
          this.showError('Failed to load tasks.');
          this.loading.set(false);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      });
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid || this.submitting()) return;

    this.submitting.set(true);
    const { title, description } = this.createForm.value;

    this.taskService
      .createTask({ title: title!, description: description! })
      .pipe(
        catchError(() => {
          this.showError('Failed to create task.');
          this.submitting.set(false);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((task) => {
        this.tasks.update((tasks) => [task, ...tasks]);
        this.createForm.reset();
        this.submitting.set(false);
      });
  }

  onToggleComplete(task: Task): void {
    this.taskService
      .toggleComplete(task)
      .pipe(
        catchError(() => {
          this.showError('Failed to update task.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((updated) => {
        this.tasks.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
      });
  }

  onEditStart(task: Task): void {
    this.editingTaskId.set(task.id);
  }

  onEditSave(event: { task: Task; title: string; description: string }): void {
    this.taskService
      .updateTask(event.task.id, { title: event.title, description: event.description })
      .pipe(
        catchError(() => {
          this.showError('Failed to update task.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((updated) => {
        this.tasks.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
        this.editingTaskId.set(null);
      });
  }

  onEditCancel(): void {
    this.editingTaskId.set(null);
  }

  onDeleteRequest(task: Task): void {
    const data: ConfirmDialogData = {
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"?`,
      confirmText: 'Delete',
    };

    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, { data })
      .afterClosed()
      .pipe(
        switchMap((confirmed) => (confirmed ? this.taskService.deleteTask(task.id) : EMPTY)),
        catchError(() => {
          this.showError('Failed to delete task.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
      });
  }

  setFilter(filter: FilterType): void {
    this.activeFilter.set(filter);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  trackById(_: number, task: Task): string {
    return task.id;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000 });
  }
}
