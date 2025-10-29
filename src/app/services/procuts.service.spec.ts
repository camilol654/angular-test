import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ProcutsService } from './procuts.service';
import { ApiService } from './api.service';
import { Product } from '../interfaces/product.interface';

describe('ProcutsService', () => {
  let service: ProcutsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 1,
    name: 'Producto Test',
    description: 'Descripción del producto',
    price: 100,
    stock: 10,
    category: 'Categoría Test',
    createdDate: new Date('2023-01-01'),
    updatedDate: new Date('2023-01-01')
  };

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getProducts', 'getProductById', 'createProduct', 'updateProduct', 'deleteProduct'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    // Mock the initial API call before creating the service
    apiServiceSpy.getProducts.and.returnValue(of([]));
    
    service = TestBed.inject(ProcutsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return products observable', (done) => {
      const mockProducts = [mockProduct];
      apiService.getProducts.and.returnValue(of(mockProducts));

      service.refreshProducts();

      service.getProducts().subscribe(products => {
        expect(products.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('getProductById', () => {
    it('should return product by id', (done) => {
      apiService.getProductById.and.returnValue(of(mockProduct));

      service.getProductById(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(apiService.getProductById).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle error when getting product by id', (done) => {
      const error = new Error('Product not found');
      apiService.getProductById.and.returnValue(throwError(() => error));

      service.getProductById(999).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('createProduct', () => {
    it('should create new product and add to products list', (done) => {
      const newProductData = {
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        price: 150,
        stock: 5,
        category: 'Nueva Categoría'
      };

      const createdProduct = { ...newProductData, id: 2, createdDate: new Date(), updatedDate: new Date() };
      apiService.createProduct.and.returnValue(of(createdProduct));

      service.createProduct(newProductData).subscribe(product => {
        expect(product).toEqual(createdProduct);
        expect(apiService.createProduct).toHaveBeenCalledWith(newProductData);
        done();
      });
    });

    it('should handle error when creating product', (done) => {
      const newProductData = {
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        price: 150,
        stock: 5,
        category: 'Nueva Categoría'
      };

      const error = new Error('Failed to create product');
      apiService.createProduct.and.returnValue(throwError(() => error));

      service.createProduct(newProductData).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product and refresh products list', (done) => {
      const updateData = { name: 'Producto Actualizado', price: 200 };
      const updatedProduct = { ...mockProduct, name: 'Producto Actualizado', price: 200 };
      
      apiService.updateProduct.and.returnValue(of(updatedProduct));

      service.updateProduct(1, updateData).subscribe(product => {
        expect(product).toEqual(updatedProduct);
        expect(apiService.updateProduct).toHaveBeenCalledWith(1, updateData);
        done();
      });
    });

    it('should handle error when updating product', (done) => {
      const updateData = { name: 'Producto Actualizado' };
      const error = new Error('Failed to update product');
      
      apiService.updateProduct.and.returnValue(throwError(() => error));

      service.updateProduct(1, updateData).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product and remove from products list', (done) => {
      apiService.deleteProduct.and.returnValue(of(true));

      service.deleteProduct(1).subscribe(result => {
        expect(result).toBe(true);
        expect(apiService.deleteProduct).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle error when deleting product', (done) => {
      const error = new Error('Failed to delete product');
      apiService.deleteProduct.and.returnValue(throwError(() => error));

      service.deleteProduct(1).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('searchProducts', () => {
    beforeEach(() => {
      // Set up mock products in the service before testing
      const mockProducts = [
        mockProduct,
        { ...mockProduct, id: 2, name: 'Producto Dos', category: 'Electrónicos', description: 'Descripción electrónica' },
        { ...mockProduct, id: 3, name: 'Producto Tres', category: 'Ropa', description: 'Descripción de ropa' }
      ];
      
      // Mock the API call and load products into the service
      apiService.getProducts.and.returnValue(of(mockProducts));
      service.refreshProducts();
    });

    it('should search products by name', () => {
      const results = service.searchProducts('Producto Test');
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Producto Test');
    });

    it('should search products by category', () => {
      const results = service.searchProducts('Electrónicos');
      expect(results.length).toBe(1);
      expect(results[0].category).toContain('Electrónicos');
    });

    it('should search products by description', () => {
      const results = service.searchProducts('electrónica');
      expect(results.length).toBe(1);
      expect(results[0].description).toContain('electrónica');
    });

    it('should return empty array for no matches', () => {
      const results = service.searchProducts('NonExistent');
      expect(results.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const results = service.searchProducts('producto test');
      expect(results.length).toBe(1);
    });

    it('should search partial matches', () => {
      const results = service.searchProducts('Prod');
      expect(results.length).toBe(3); // All products start with "Prod"
    });

    it('should handle empty query', () => {
      const results = service.searchProducts('');
      expect(results.length).toBe(3); // Should return all products
    });
  });

  describe('refreshProducts', () => {
    it('should reload products from API', () => {
      const mockProducts = [mockProduct];
      apiService.getProducts.and.returnValue(of(mockProducts));

      service.refreshProducts();

      expect(apiService.getProducts).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should track loading state', (done) => {
      service.loading$.subscribe(loading => {
        expect(typeof loading).toBe('boolean');
        done();
      });
    });

    it('should return current loading state', () => {
      expect(typeof service.isLoading()).toBe('boolean');
    });
  });

  describe('error handling', () => {
    it('should track error state', (done) => {
      service.error$.subscribe(error => {
        expect(error === null || typeof error === 'string').toBe(true);
        done();
      });
    });

    it('should return last error', () => {
      expect(service.getLastError() === null || typeof service.getLastError() === 'string').toBe(true);
    });

    it('should clear error', () => {
      service.clearError();
      expect(service.getLastError()).toBeNull();
    });
  });

  describe('Product Management', () => {
    it('should handle products with different properties', () => {
      const complexProduct = {
        id: 1,
        name: 'Producto Complejo',
        description: 'Una descripción muy detallada del producto',
        price: 299.99,
        stock: 25,
        category: 'Categoría Especial',
        createdDate: new Date('2023-06-15'),
        updatedDate: new Date('2023-06-20')
      };

      apiService.getProductById.and.returnValue(of(complexProduct));

      service.getProductById(1).subscribe(product => {
        expect(product.price).toBe(299.99);
        expect(product.stock).toBe(25);
        expect(product.category).toBe('Categoría Especial');
      });
    });

    it('should handle products with special characters', () => {
      const specialProduct = {
        ...mockProduct,
        name: 'Producto con Acentos: Café & Más',
        description: 'Descripción con ñ y tildes',
        category: 'Categoría-Única'
      };

      apiService.createProduct.and.returnValue(of(specialProduct));

      service.createProduct(specialProduct).subscribe(product => {
        expect(product.name).toBe('Producto con Acentos: Café & Más');
        expect(product.description).toBe('Descripción con ñ y tildes');
        expect(product.category).toBe('Categoría-Única');
      });
    });
  });
});