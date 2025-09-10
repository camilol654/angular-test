import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProcutsService {
  productos: Product[] = [];
  constructor(private http: HttpClient) {}

  getProduct(): Product[] {
    return [{ id: 1, name: 'camilo', price: 0.1, description: 'prducto 1' },
      { id: 2, name: 'camilo2', price: 0.2, description: 'prducto 2' },
    ];
  }

  addProduct(product:Product){
    this.productos.push(product);
  }
}
