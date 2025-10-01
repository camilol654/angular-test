import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { Order } from '../../../interfaces/order.interface';

@Component({
  selector: 'app-orders-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit {
  order: Order | undefined;
  id: number = 0;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loadOrder();
    }
  }

  private loadOrder(): void {
    this.loading = true;
    this.error = null;
    
    this.ordersService.getOrderById(this.id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error cargando pedido:', error);
      }
    });
  }

  onDeleteOrder(): void {
    if (this.order && confirm('¿Está seguro de que desea eliminar este pedido?')) {
      this.loading = true;
      this.error = null;
      
      this.ordersService.deleteOrder(this.order.id).subscribe({
        next: () => {
          alert('Pedido eliminado exitosamente');
          this.router.navigate(['/orders']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          alert(`Error al eliminar el pedido: ${error.message}`);
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pendiente': return 'text-warning fw-bold';
      case 'Procesando': return 'text-info fw-bold';
      case 'Enviado': return 'text-primary fw-bold';
      case 'Entregado': return 'text-success fw-bold';
      case 'Cancelado': return 'text-danger fw-bold';
      default: return 'text-muted';
    }
  }
}


