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
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProcutsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadProduct();
    }
  }

  private loadProduct(): void {
    this.loading = true;
    this.error = null;
    
    this.productService.getProductById(this.id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error cargando producto:', error);
      }
    });
  }

  onDeleteProduct(): void {
    if (this.product && confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.loading = true;
      this.error = null;
      
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          alert('Producto eliminado exitosamente');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          alert(`Error al eliminar el producto: ${error.message}`);
        }
      });
    }
  }

  onClearError(): void {
    this.error = null;
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
