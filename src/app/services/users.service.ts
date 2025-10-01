import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUsers();
  }

  // Cargar todos los usuarios desde la API
  private loadUsers(): void {
    this.setLoading(true);
    this.setError(null);
    
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.usersSubject.next(users);
        this.setLoading(false);
      },
      error: (error) => {
        this.setError(error.message);
        this.setLoading(false);
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  // Obtener todos los usuarios
  getUsers(): Observable<User[]> {
    return this.users$;
  }

  // Obtener un usuario por ID
  getUserById(id: number): Observable<User> {
    return this.apiService.getUserById(id).pipe(
      catchError(error => {
        this.setError(error.message);
        return throwError(() => error);
      })
    );
  }

  // Crear un nuevo usuario
  createUser(user: Omit<User, 'id' | 'fechaRegistro' | 'fechaActualizacion'>): Observable<User> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.createUser(user).pipe(
      tap(newUser => {
        const currentUsers = this.usersSubject.value;
        this.usersSubject.next([...currentUsers, newUser]);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(error.message);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Actualizar un usuario existente
  updateUser(id: number, user: Partial<Omit<User, 'id' | 'fechaRegistro'>>): Observable<User> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.updateUser(id, user).pipe(
      tap(updatedUser => {
        const currentUsers = this.usersSubject.value;
        const index = currentUsers.findIndex(u => u.id === id);
        if (index !== -1) {
          currentUsers[index] = updatedUser;
          this.usersSubject.next([...currentUsers]);
        }
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(error.message);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Eliminar un usuario
  deleteUser(id: number): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.deleteUser(id).pipe(
      tap(() => {
        const currentUsers = this.usersSubject.value;
        const updatedUsers = currentUsers.filter(u => u.id !== id);
        this.usersSubject.next(updatedUsers);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(error.message);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Buscar usuarios por nombre o email
  searchUsers(query: string): User[] {
    const users = this.usersSubject.value;
    const lowercaseQuery = query.toLowerCase();
    
    return users.filter(user => 
      user.nombreCompleto.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.telefono.includes(query)
    );
  }

  // Recargar usuarios desde la API
  refreshUsers(): void {
    this.loadUsers();
  }

  // Obtener estado de carga
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Obtener último error
  getLastError(): string | null {
    return this.errorSubject.value;
  }

  // Limpiar error
  clearError(): void {
    this.setError(null);
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }
}


