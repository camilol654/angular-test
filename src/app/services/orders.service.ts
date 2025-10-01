import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Order } from '../interfaces/order.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadOrders();
  }

  // Cargar todos los pedidos desde la API
  private loadOrders(): void {
    this.setLoading(true);
    this.setError(null);
    
    this.apiService.getOrders().subscribe({
      next: (orders) => {
        this.ordersSubject.next(orders);
        this.setLoading(false);
      },
      error: (error) => {
        this.setError(error.message);
        this.setLoading(false);
        console.error('Error cargando pedidos:', error);
      }
    });
  }

  // Obtener todos los pedidos
  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  // Obtener un pedido por ID
  getOrderById(id: number): Observable<Order> {
    return this.apiService.getOrderById(id).pipe(
      catchError(error => {
        this.setError(error.message);
        return throwError(() => error);
      })
    );
  }

  // Crear un nuevo pedido
  createOrder(order: Omit<Order, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'totalGeneral'>): Observable<Order> {
    this.setLoading(true);
    this.setError(null);

    // Calcular total general
    const totalGeneral = order.items.reduce((sum, item) => sum + item.precioTotal, 0);
    const orderWithTotal = { ...order, totalGeneral };

    return this.apiService.createOrder(orderWithTotal).pipe(
      tap(newOrder => {
        const currentOrders = this.ordersSubject.value;
        this.ordersSubject.next([...currentOrders, newOrder]);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(error.message);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Actualizar un pedido existente
  updateOrder(id: number, order: Partial<Omit<Order, 'id' | 'fechaCreacion'>>): Observable<Order> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.updateOrder(id, order).pipe(
      tap(updatedOrder => {
        const currentOrders = this.ordersSubject.value;
        const index = currentOrders.findIndex(o => o.id === id);
        if (index !== -1) {
          currentOrders[index] = updatedOrder;
          this.ordersSubject.next([...currentOrders]);
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

  // Eliminar un pedido
  deleteOrder(id: number): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.deleteOrder(id).pipe(
      tap(() => {
        const currentOrders = this.ordersSubject.value;
        const updatedOrders = currentOrders.filter(o => o.id !== id);
        this.ordersSubject.next(updatedOrders);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(error.message);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Buscar pedidos por usuario o estado
  searchOrders(query: string): Order[] {
    const orders = this.ordersSubject.value;
    const lowercaseQuery = query.toLowerCase();
    
    return orders.filter(order => 
      order.usuario.nombreCompleto.toLowerCase().includes(lowercaseQuery) ||
      order.usuario.email.toLowerCase().includes(lowercaseQuery) ||
      order.estado.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Obtener pedidos por usuario
  getOrdersByUser(userId: number): Order[] {
    const orders = this.ordersSubject.value;
    return orders.filter(order => order.usuarioId === userId);
  }

  // Recargar pedidos desde la API
  refreshOrders(): void {
    this.loadOrders();
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


