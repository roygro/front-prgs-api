import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../services/tasks';
import { Task } from '../../../types/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = true;
  showModal = false;
  editMode = false;
  filtroPrioridad: string = 'todas';
  
  selectedTask: Task = {
    id: 0,
    name: '',
    description: '',
    priority: false,
    created_at: '',
    user_id: 0
  };

  constructor(private tasksService: TasksService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.tasksService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.filtroPrioridad === 'todas') {
      this.filteredTasks = this.tasks;
    } else if (this.filtroPrioridad === 'alta') {
      this.filteredTasks = this.tasks.filter(task => task.priority === true);
    } else if (this.filtroPrioridad === 'normal') {
      this.filteredTasks = this.tasks.filter(task => task.priority === false);
    }
  }

  setFilter(filter: string): void {
    this.filtroPrioridad = filter;
    this.applyFilter();
  }

  openCreateModal(): void {
    this.editMode = false;
    this.selectedTask = {
      id: 0,
      name: '',
      description: '',
      priority: false,
      created_at: '',
      user_id: 0
    };
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.editMode = true;
    this.selectedTask = { ...task };
    this.showModal = true;
  }

  saveTask(): void {
    if (!this.selectedTask.name) return;

    if (this.editMode) {
      this.tasksService.updateTask(this.selectedTask.id, {
        name: this.selectedTask.name,
        description: this.selectedTask.description || '',
        priority: this.selectedTask.priority === true
      }).subscribe({
        next: () => {
          this.loadTasks();
          this.closeModal();
        },
        error: (err) => console.error('Error updating task:', err)
      });
    } else {
      this.tasksService.createTask({
        name: this.selectedTask.name,
        description: this.selectedTask.description || '',
        priority: this.selectedTask.priority === true
      }).subscribe({
        next: () => {
          this.loadTasks();
          this.closeModal();
        },
        error: (err) => console.error('Error creating task:', err)
      });
    }
  }

  deleteTask(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.tasksService.deleteTask(id).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Error deleting task:', err)
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
  }
}