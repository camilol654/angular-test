import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrdersService } from '../../../services/orders.service';
import { Order } from '../../../interfaces/order.interface';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchQuery: string = '';
  loading = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    // Suscribirse a los pedidos
    this.subscription.add(
      this.ordersService.getOrders().subscribe(orders => {
        this.orders = orders;
        this.filteredOrders = orders;
      })
    );

    // Suscribirse al estado de carga
    this.subscription.add(
      this.ordersService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );

    // Suscribirse a los errores
    this.subscription.add(
      this.ordersService.error$.subscribe(error => {
        this.error = error;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredOrders = this.ordersService.searchOrders(this.searchQuery);
    } else {
      this.filteredOrders = this.orders;
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.filteredOrders = this.orders;
  }

  onDeleteOrder(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este pedido?')) {
      this.ordersService.deleteOrder(id).subscribe({
        next: () => {
          alert('Pedido eliminado exitosamente');
        },
        error: (error) => {
          alert(`Error al eliminar el pedido: ${error.message}`);
        }
      });
    }
  }

  onRefresh(): void {
    this.ordersService.refreshOrders();
  }

  onClearError(): void {
    this.ordersService.clearError();
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




