import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProcutsService {
  private productsSubject = new BehaviorSubject<Product[]>(this.getInitialProducts());
  public products$ = this.productsSubject.asObservable();

  constructor() {}

  private getInitialProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Laptop Dell XPS 13',
        description: 'Laptop ultradelgada con pantalla de 13 pulgadas',
        price: 1299.99,
        stock: 15,
        category: 'Electrónicos',
        createdDate: new Date('2024-01-15'),
        updatedDate: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'iPhone 15 Pro',
        description: 'Smartphone con cámara profesional de 48MP',
        price: 999.99,
        stock: 8,
        category: 'Electrónicos',
        createdDate: new Date('2024-01-20'),
        updatedDate: new Date('2024-01-20')
      },
      {
        id: 3,
        name: 'Silla Ergonómica',
        description: 'Silla de oficina ergonómica con soporte lumbar',
        price: 299.99,
        stock: 25,
        category: 'Muebles',
        createdDate: new Date('2024-01-10'),
        updatedDate: new Date('2024-01-10')
      }
    ];
  }

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  // Obtener un producto por ID
  getProductById(id: number): Product | undefined {
    const products = this.productsSubject.value;
    return products.find(product => product.id === id);
  }

  // Crear un nuevo producto
  createProduct(product: Omit<Product, 'id' | 'createdDate' | 'updatedDate'>): Product {
    const products = this.productsSubject.value;
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdDate: new Date(),
      updatedDate: new Date()
    };
    
    const updatedProducts = [...products, newProduct];
    this.productsSubject.next(updatedProducts);
    return newProduct;
  }

  // Actualizar un producto existente
  updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdDate'>>): Product | null {
    const products = this.productsSubject.value;
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedProduct: Product = {
      ...products[index],
      ...product,
      updatedDate: new Date()
    };

    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    this.productsSubject.next(updatedProducts);
    
    return updatedProduct;
  }

  // Eliminar un producto
  deleteProduct(id: number): boolean {
    const products = this.productsSubject.value;
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }

    const updatedProducts = products.filter(p => p.id !== id);
    this.productsSubject.next(updatedProducts);
    return true;
  }

  // Generar ID único
  private generateId(): number {
    const products = this.productsSubject.value;
    return Math.max(...products.map(p => p.id), 0) + 1;
  }

  // Buscar productos por nombre o categoría
  searchProducts(query: string): Product[] {
    const products = this.productsSubject.value;
    const lowercaseQuery = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}
