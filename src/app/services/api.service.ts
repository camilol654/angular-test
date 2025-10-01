import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';
import { User } from '../interfaces/user.interface';
import { Order } from '../interfaces/order.interface';
import { API_CONFIG } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = API_CONFIG.baseUrl;
  private httpOptions = {
    headers: new HttpHeaders(API_CONFIG.headers)
  };

  constructor(private http: HttpClient) {}

  // GET /api/Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/Products`, this.httpOptions)
      .pipe(
        map(products => products.map(product => ({
          ...product,
          createdDate: new Date(product.createdDate),
          updatedDate: new Date(product.updatedDate)
        }))),
        catchError(this.handleError)
      );
  }

  // GET /api/Products/{id}
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/Products/${id}`, this.httpOptions)
      .pipe(
        map(product => ({
          ...product,
          createdDate: new Date(product.createdDate),
          updatedDate: new Date(product.updatedDate)
        })),
        catchError(this.handleError)
      );
  }

  // POST /api/Products
  createProduct(product: Omit<Product, 'id' | 'createdDate' | 'updatedDate'>): Observable<Product> {
    const productToSend = {
      ...product,
      id: 0, // El backend generará el ID
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    return this.http.post<Product>(`${this.baseUrl}/Products`, productToSend, this.httpOptions)
      .pipe(
        map(product => ({
          ...product,
          createdDate: new Date(product.createdDate),
          updatedDate: new Date(product.updatedDate)
        })),
        catchError(this.handleError)
      );
  }

  // PUT /api/Products/{id}
  updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdDate'>>): Observable<Product> {
    const productToSend = {
      ...product,
      id: id,
      updatedDate: new Date().toISOString()
    };

    return this.http.put<Product>(`${this.baseUrl}/Products/${id}`, productToSend, this.httpOptions)
      .pipe(
        map(product => ({
          ...product,
          createdDate: new Date(product.createdDate),
          updatedDate: new Date(product.updatedDate)
        })),
        catchError(this.handleError)
      );
  }

  // DELETE /api/Products/{id}
  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/Products/${id}`, this.httpOptions)
      .pipe(
        map(() => true),
        catchError(this.handleError)
      );
  }

  // ========== USUARIOS ENDPOINTS ==========
  
  // GET /api/Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/Users`, this.httpOptions)
      .pipe(
        map(users => users.map(user => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
          fechaActualizacion: new Date(user.fechaActualizacion)
        }))),
        catchError(this.handleError)
      );
  }

  // GET /api/Users/{id}
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/Users/${id}`, this.httpOptions)
      .pipe(
        map(user => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
          fechaActualizacion: new Date(user.fechaActualizacion)
        })),
        catchError(this.handleError)
      );
  }

  // POST /api/Users
  createUser(user: Omit<User, 'id' | 'fechaRegistro' | 'fechaActualizacion'>): Observable<User> {
    const userToSend = {
      ...user,
      id: 0,
      fechaRegistro: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    return this.http.post<User>(`${this.baseUrl}/Users`, userToSend, this.httpOptions)
      .pipe(
        map(user => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
          fechaActualizacion: new Date(user.fechaActualizacion)
        })),
        catchError(this.handleError)
      );
  }

  // PUT /api/Users/{id}
  updateUser(id: number, user: Partial<Omit<User, 'id' | 'fechaRegistro'>>): Observable<User> {
    const userToSend = {
      ...user,
      id: id,
      fechaActualizacion: new Date().toISOString()
    };

    return this.http.put<User>(`${this.baseUrl}/Users/${id}`, userToSend, this.httpOptions)
      .pipe(
        map(user => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
          fechaActualizacion: new Date(user.fechaActualizacion)
        })),
        catchError(this.handleError)
      );
  }

  // DELETE /api/Users/{id}
  deleteUser(id: number): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/Users/${id}`, this.httpOptions)
      .pipe(
        map(() => true),
        catchError(this.handleError)
      );
  }

  // ========== PEDIDOS ENDPOINTS ==========
  
  // GET /api/Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/Orders`, this.httpOptions)
      .pipe(
        map(orders => orders.map(order => ({
          ...order,
          fechaPedido: new Date(order.fechaPedido),
          fechaCreacion: new Date(order.fechaCreacion),
          fechaActualizacion: new Date(order.fechaActualizacion)
        }))),
        catchError(this.handleError)
      );
  }

  // GET /api/Orders/{id}
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/Orders/${id}`, this.httpOptions)
      .pipe(
        map(order => ({
          ...order,
          fechaPedido: new Date(order.fechaPedido),
          fechaCreacion: new Date(order.fechaCreacion),
          fechaActualizacion: new Date(order.fechaActualizacion)
        })),
        catchError(this.handleError)
      );
  }

  // POST /api/Orders
  createOrder(order: Omit<Order, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Observable<Order> {
    const orderToSend = {
      ...order,
      id: 0,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    return this.http.post<Order>(`${this.baseUrl}/Orders`, orderToSend, this.httpOptions)
      .pipe(
        map(order => ({
          ...order,
          fechaPedido: new Date(order.fechaPedido),
          fechaCreacion: new Date(order.fechaCreacion),
          fechaActualizacion: new Date(order.fechaActualizacion)
        })),
        catchError(this.handleError)
      );
  }

  // PUT /api/Orders/{id}
  updateOrder(id: number, order: Partial<Omit<Order, 'id' | 'fechaCreacion'>>): Observable<Order> {
    const orderToSend = {
      ...order,
      id: id,
      fechaActualizacion: new Date().toISOString()
    };

    return this.http.put<Order>(`${this.baseUrl}/Orders/${id}`, orderToSend, this.httpOptions)
      .pipe(
        map(order => ({
          ...order,
          fechaPedido: new Date(order.fechaPedido),
          fechaCreacion: new Date(order.fechaCreacion),
          fechaActualizacion: new Date(order.fechaActualizacion)
        })),
        catchError(this.handleError)
      );
  }

  // DELETE /api/Orders/{id}
  deleteOrder(id: number): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/Orders/${id}`, this.httpOptions)
      .pipe(
        map(() => true),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicie sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tiene permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 409:
          errorMessage = 'Conflicto. El recurso ya existe o está en uso.';
          break;
        case 422:
          errorMessage = 'Datos de entrada inválidos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente nuevamente más tarde.';
          break;
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
      }
    }

    console.error('Error en API:', error);
    return throwError(() => new Error(errorMessage));
  }
}
