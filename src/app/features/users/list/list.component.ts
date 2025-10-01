import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  loading = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    // Suscribirse a los usuarios
    this.subscription.add(
      this.usersService.getUsers().subscribe(users => {
        this.users = users;
        this.filteredUsers = users;
      })
    );

    // Suscribirse al estado de carga
    this.subscription.add(
      this.usersService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );

    // Suscribirse a los errores
    this.subscription.add(
      this.usersService.error$.subscribe(error => {
        this.error = error;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredUsers = this.usersService.searchUsers(this.searchQuery);
    } else {
      this.filteredUsers = this.users;
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.filteredUsers = this.users;
  }

  onDeleteUser(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          alert('Usuario eliminado exitosamente');
        },
        error: (error) => {
          alert(`Error al eliminar el usuario: ${error.message}`);
        }
      });
    }
  }

  onRefresh(): void {
    this.usersService.refreshUsers();
  }

  onClearError(): void {
    this.usersService.clearError();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}


