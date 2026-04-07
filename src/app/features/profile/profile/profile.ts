import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth';
import { UserService } from '../../../services/user';
import { TokenService } from '../../../services/token';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editMode = false;
  loading = false;
  success = '';
  error = '';

  editUser = {
    name: '',
    lastname: '',
    username: ''
  };

  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };
  showPasswordForm = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.editUser = {
          name: user.name,
          lastname: user.lastname,
          username: user.username
        };
      }
    });
  }

  enableEditMode(): void {
    this.editMode = true;
    this.error = '';
    this.success = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    if (this.user) {
      this.editUser = {
        name: this.user.name,
        lastname: this.user.lastname,
        username: this.user.username
      };
    }
  }

  saveProfile(): void {
    if (!this.user) return;
    
    this.loading = true;
    this.error = '';
    this.success = '';

    this.userService.updateUser(this.user.id, this.editUser).subscribe({
      next: (updatedUser) => {
        this.tokenService.setUser(updatedUser);
        this.authService['userSubject'].next(updatedUser);
        this.user = updatedUser;
        this.editMode = false;
        this.success = 'Perfil actualizado correctamente';
        this.loading = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al actualizar perfil';
        this.loading = false;
      }
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordData = {
      newPassword: '',
      confirmPassword: ''
    };
    this.error = '';
    this.success = '';
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';

    this.userService.updateUser(this.user!.id, {
      password: this.passwordData.newPassword
    } as Partial<User>).subscribe({
      next: () => {
        this.success = 'Contraseña actualizada correctamente';
        this.showPasswordForm = false;
        this.loading = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cambiar contraseña';
        this.loading = false;
      }
    });
  }
}