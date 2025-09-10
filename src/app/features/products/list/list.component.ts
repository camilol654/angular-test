import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProcutsService } from '../../../services/procuts.service';
import { Product } from '../../../interfaces/product.interface';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private productService: ProcutsService) {}

  ngOnInit(): void {
    this.subscription = this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredProducts = this.productService.searchProducts(this.searchQuery);
    } else {
      this.filteredProducts = this.products;
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.filteredProducts = this.products;
  }

  onDeleteProduct(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      const success = this.productService.deleteProduct(id);
      if (success) {
        alert('Producto eliminado exitosamente');
        // La lista se actualizará automáticamente gracias al BehaviorSubject
      } else {
        alert('Error al eliminar el producto');
      }
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger fw-bold';
    if (stock < 10) return 'text-warning fw-bold';
    return 'text-success';
  }
}
