import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { UsersService } from '../../../services/users.service';
import { ProcutsService } from '../../../services/procuts.service';
import { Order, OrderItem } from '../../../interfaces/order.interface';
import { User } from '../../../interfaces/user.interface';
import { Product } from '../../../interfaces/product.interface';

@Component({
  selector: 'app-orders-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  orderForm: FormGroup;
  isEditMode = false;
  orderId: number | null = null;
  loading = false;
  error: string | null = null;
  
  users: User[] = [];
  products: Product[] = [];
  orderStatuses = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private productsService: ProcutsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.orderForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUsersAndProducts();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.orderId = +id;
      this.loadOrder();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fechaPedido: [new Date().toISOString().split('T')[0], Validators.required],
      usuarioId: ['', Validators.required],
      estado: ['Pendiente', Validators.required],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  private createItemFormGroup(): FormGroup {
    return this.fb.group({
      productoId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  private loadUsersAndProducts(): void {
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
    });
    
    this.productsService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  private loadOrder(): void {
    if (this.orderId) {
      this.loading = true;
      this.error = null;
      
      this.ordersService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          this.orderForm.patchValue({
            fechaPedido: order.fechaPedido.toISOString().split('T')[0],
            usuarioId: order.usuarioId,
            estado: order.estado
          });
          
          // Cargar items
          this.items.clear();
          order.items.forEach(item => {
            const itemGroup = this.createItemFormGroup();
            itemGroup.patchValue({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario
            });
            this.items.push(itemGroup);
          });
          
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.error('Error cargando pedido:', error);
        }
      });
    }
  }

  addItem(): void {
    const itemGroup = this.createItemFormGroup();
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onProductChange(index: number): void {
    const itemGroup = this.items.at(index);
    const productoId = itemGroup.get('productoId')?.value;
    
    if (productoId) {
      const product = this.products.find(p => p.id === productoId);
      if (product) {
        itemGroup.patchValue({
          precioUnitario: product.price
        });
      }
    }
  }

  calculateItemTotal(index: number): number {
    const itemGroup = this.items.at(index);
    const cantidad = itemGroup.get('cantidad')?.value || 0;
    const precioUnitario = itemGroup.get('precioUnitario')?.value || 0;
    return cantidad * precioUnitario;
  }

  calculateOrderTotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.calculateItemTotal(i);
    }
    return total;
  }

  onSubmit(): void {
    if (this.orderForm.valid && this.items.length > 0 && !this.loading) {
      this.loading = true;
      this.error = null;
      
      const formValue = this.orderForm.value;
      const items: OrderItem[] = this.items.value.map((item: any) => ({
        productoId: item.productoId,
        producto: this.products.find(p => p.id === item.productoId)!,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        precioTotal: item.cantidad * item.precioUnitario
      }));
      
      const orderData = {
        fechaPedido: new Date(formValue.fechaPedido),
        usuarioId: formValue.usuarioId,
        usuario: this.users.find(u => u.id === formValue.usuarioId)!,
        estado: formValue.estado,
        items: items,
        totalGeneral: this.calculateOrderTotal()
      };
      
      if (this.isEditMode && this.orderId) {
        // Actualizar pedido existente
        this.ordersService.updateOrder(this.orderId, orderData).subscribe({
          next: () => {
            alert('Pedido actualizado exitosamente');
            this.router.navigate(['/orders']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
            alert(`Error al actualizar el pedido: ${error.message}`);
          }
        });
      } else {
        // Crear nuevo pedido
        this.ordersService.createOrder(orderData).subscribe({
          next: () => {
            alert('Pedido creado exitosamente');
            this.router.navigate(['/orders']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
            alert(`Error al crear el pedido: ${error.message}`);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      if (this.items.length === 0) {
        alert('Debe agregar al menos un producto al pedido');
      } else {
        alert('Por favor, complete todos los campos requeridos correctamente');
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm.get(key);
      control?.markAsTouched();
    });
    
    this.items.controls.forEach(control => {
      Object.keys(control.value).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/orders']);
  }

  onClearError(): void {
    this.error = null;
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
    }
    return '';
  }

  getItemFieldError(index: number, fieldName: string): string {
    const field = this.items.at(index).get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor a ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fechaPedido: 'Fecha del Pedido',
      usuarioId: 'Usuario',
      estado: 'Estado',
      productoId: 'Producto',
      cantidad: 'Cantidad',
      precioUnitario: 'Precio Unitario'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  isItemFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.items.at(index).get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}






