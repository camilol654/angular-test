import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProcutsService } from '../../../services/procuts.service';
import { Product } from '../../../interfaces/product.interface';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  loading = false;
  error: string | null = null;
  categories = ['Electrónicos', 'Muebles', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Otros'];

  constructor(
    private fb: FormBuilder,
    private productService: ProcutsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });
  }

  private loadProduct(): void {
    if (this.productId) {
      this.loading = true;
      this.error = null;
      
      this.productService.getProductById(this.productId).subscribe({
        next: (product) => {
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.error('Error cargando producto:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.loading) {
      this.loading = true;
      this.error = null;
      const formValue = this.productForm.value;
      
      if (this.isEditMode && this.productId) {
        // Actualizar producto existente
        this.productService.updateProduct(this.productId, formValue).subscribe({
          next: () => {
            alert('Producto actualizado exitosamente');
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
            alert(`Error al actualizar el producto: ${error.message}`);
          }
        });
      } else {
        // Crear nuevo producto
        this.productService.createProduct(formValue).subscribe({
          next: () => {
            alert('Producto creado exitosamente');
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
            alert(`Error al crear el producto: ${error.message}`);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      alert('Por favor, complete todos los campos requeridos correctamente');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor a ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      description: 'Descripción',
      price: 'Precio',
      stock: 'Stock',
      category: 'Categoría'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  onClearError(): void {
    this.error = null;
  }
}
