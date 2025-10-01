import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiTestService {
  constructor(private http: HttpClient) {}

  // Probar conexión con el backend
  testConnection(): Observable<{ connected: boolean; message: string }> {
    return this.http.get(`${API_CONFIG.baseUrl}/Products`, {
      headers: API_CONFIG.headers
    }).pipe(
      map(() => ({
        connected: true,
        message: 'Conexión exitosa con el backend'
      })),
      catchError(error => {
        console.error('Error de conexión:', error);
        return of({
          connected: false,
          message: `Error de conexión: ${error.message || 'No se pudo conectar con el servidor'}`
        });
      })
    );
  }

  // Probar endpoint específico
  testProductsEndpoint(): Observable<{ success: boolean; count: number; message: string }> {
    return this.http.get<any[]>(`${API_CONFIG.baseUrl}/Products`, {
      headers: API_CONFIG.headers
    }).pipe(
      map((products) => ({
        success: true,
        count: products.length,
        message: `Se encontraron ${products.length} productos`
      })),
      catchError(error => {
        console.error('Error en endpoint de productos:', error);
        return of({
          success: false,
          count: 0,
          message: `Error en endpoint: ${error.message || 'Error desconocido'}`
        });
      })
    );
  }

  // Probar endpoint de usuarios
  testUsersEndpoint(): Observable<{ success: boolean; count: number; message: string }> {
    return this.http.get<any[]>(`${API_CONFIG.baseUrl}/Users`, {
      headers: API_CONFIG.headers
    }).pipe(
      map((users) => ({
        success: true,
        count: users.length,
        message: `Se encontraron ${users.length} usuarios`
      })),
      catchError(error => {
        console.error('Error en endpoint de usuarios:', error);
        return of({
          success: false,
          count: 0,
          message: `Error en endpoint: ${error.message || 'Error desconocido'}`
        });
      })
    );
  }

  // Probar endpoint de pedidos
  testOrdersEndpoint(): Observable<{ success: boolean; count: number; message: string }> {
    return this.http.get<any[]>(`${API_CONFIG.baseUrl}/Orders`, {
      headers: API_CONFIG.headers
    }).pipe(
      map((orders) => ({
        success: true,
        count: orders.length,
        message: `Se encontraron ${orders.length} pedidos`
      })),
      catchError(error => {
        console.error('Error en endpoint de pedidos:', error);
        return of({
          success: false,
          count: 0,
          message: `Error en endpoint: ${error.message || 'Error desconocido'}`
        });
      })
    );
  }
}
