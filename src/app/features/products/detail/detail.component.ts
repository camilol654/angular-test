import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProcutsService } from '../../../services/procuts.service';
import { Product } from '../../../interfaces/product.interface';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit {
  product: Product | undefined;
  id: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProcutsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.product = this.productService.getProductById(this.id);
      
      if (!this.product) {
        alert('Producto no encontrado');
        this.router.navigate(['/products']);
      }
    }
  }

  onDeleteProduct(): void {
    if (this.product && confirm('¿Está seguro de que desea eliminar este producto?')) {
      const success = this.productService.deleteProduct(this.product.id);
      if (success) {
        alert('Producto eliminado exitosamente');
        this.router.navigate(['/products']);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger fw-bold';
    if (stock < 10) return 'text-warning fw-bold';
    return 'text-success';
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return 'Stock bajo';
    return 'En stock';
  }
}
