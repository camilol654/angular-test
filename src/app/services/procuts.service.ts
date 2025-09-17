import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProcutsService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadProducts();
  }

  // Cargar todos los productos desde la API
  private loadProducts(): void {
    this.setLoading(true);
    this.setError(null);
    
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.productsSubject.next(products);
        this.setLoading(false);
      },
      error: (error) => {
        this.setError(error.message);
        this.setLoading(false);
        console.error('Error cargando productos:', error);
      }
    });
  }

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  // Obtener un producto por ID
  getProductById(id: number): Observable<Product> {
    return this.apiService.getProductById(id).pipe(
      catchError(error => {
        this.setError(error.message);
        return throwError(() => error);
      })
    );
  }

  // Crear un nuevo producto
  createProduct(product: Omit<Product, 'id' | 'createdDate' | 'updatedDate'>): Observable<Product> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.createProduct(product).pipe(
      tap(newProduct => {
        // Actualizar la lista local con el nuevo producto
        const currentProducts = this.productsSubject.value;
        this.productsSubject.next([...currentProducts, newProduct]);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(error.message);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Actualizar un producto existente
  updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdDate'>>): Observable<Product> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.updateProduct(id, product).pipe(
      tap(updatedProduct => {
        // Actualizar la lista local con el producto actualizado
        const currentProducts = this.productsSubject.value;
        const index = currentProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          currentProducts[index] = updatedProduct;
          this.productsSubject.next([...currentProducts]);
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

  // Eliminar un producto
  deleteProduct(id: number): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.deleteProduct(id).pipe(
      tap(() => {
        // Remover el producto de la lista local
        const currentProducts = this.productsSubject.value;
        const updatedProducts = currentProducts.filter(p => p.id !== id);
        this.productsSubject.next(updatedProducts);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(error.message);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Buscar productos por nombre o categoría (búsqueda local)
  searchProducts(query: string): Product[] {
    const products = this.productsSubject.value;
    const lowercaseQuery = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Recargar productos desde la API
  refreshProducts(): void {
    this.loadProducts();
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
