import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });
  }

  private loadUser(): void {
    if (this.userId) {
      this.loading = true;
      this.error = null;
      
      this.usersService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userForm.patchValue({
            nombreCompleto: user.nombreCompleto,
            email: user.email,
            telefono: user.telefono
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.error('Error cargando usuario:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.loading) {
      this.loading = true;
      this.error = null;
      const formValue = this.userForm.value;
      
      if (this.isEditMode && this.userId) {
        // Actualizar usuario existente
        this.usersService.updateUser(this.userId, formValue).subscribe({
          next: () => {
            alert('Usuario actualizado exitosamente');
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
            alert(`Error al actualizar el usuario: ${error.message}`);
          }
        });
      } else {
        // Crear nuevo usuario
        this.usersService.createUser(formValue).subscribe({
          next: () => {
            alert('Usuario creado exitosamente');
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
            alert(`Error al crear el usuario: ${error.message}`);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      alert('Por favor, complete todos los campos requeridos correctamente');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) {
        return 'Ingrese un email válido';
      }
      if (field.errors['pattern']) {
        return 'Ingrese un teléfono válido';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombreCompleto: 'Nombre Completo',
      email: 'Email',
      telefono: 'Teléfono'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  onClearError(): void {
    this.error = null;
  }
}


