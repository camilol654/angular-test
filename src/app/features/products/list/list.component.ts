import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProcutsService } from '../../../services/procuts.service';
import { Product } from '../../../interfaces/product.interface';

@Component({
  selector: 'app-list',
  imports: [RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  products: Product[] = [];
  constructor(private productService: ProcutsService) {
    this.products = this.productService.getProduct();
  }
}
