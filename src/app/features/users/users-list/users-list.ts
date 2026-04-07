import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user';
import { User } from '../../../services/auth';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  searchTerm = '';
  showDeleteModal = false;
  selectedUser: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.lastname.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term)
    );
  }

  confirmDelete(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  deleteUser(): void {
    if (this.selectedUser) {
      this.userService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  closeModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }
}