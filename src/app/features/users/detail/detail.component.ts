import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-users-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit {
  user: User | undefined;
  id: number = 0;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadUser();
    }
  }

  private loadUser(): void {
    this.loading = true;
    this.error = null;
    
    this.usersService.getUserById(this.id).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error cargando usuario:', error);
      }
    });
  }

  onDeleteUser(): void {
    if (this.user && confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.loading = true;
      this.error = null;
      
      this.usersService.deleteUser(this.user.id).subscribe({
        next: () => {
          alert('Usuario eliminado exitosamente');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          alert(`Error al eliminar el usuario: ${error.message}`);
        }
      });
    }
  }

  onClearError(): void {
    this.error = null;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}


