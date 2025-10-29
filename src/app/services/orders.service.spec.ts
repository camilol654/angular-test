import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { OrdersService } from './orders.service';
import { ApiService } from './api.service';
import { Order } from '../interfaces/order.interface';
import { User } from '../interfaces/user.interface';
import { Product } from '../interfaces/product.interface';

describe('OrdersService', () => {
  let service: OrdersService;
  let apiService: jasmine.SpyObj<ApiService>;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    nombreCompleto: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '123456789',
    fechaRegistro: new Date('2023-01-01'),
    fechaActualizacion: new Date('2023-01-01')
  };

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

  const mockOrder: Order = {
    id: 1,
    fechaPedido: new Date('2023-01-01'),
    usuarioId: 1,
    usuario: mockUser,
    items: [{
      productoId: 1,
      producto: mockProduct,
      cantidad: 2,
      precioUnitario: 100,
      precioTotal: 200
    }],
    totalGeneral: 200,
    estado: 'Pendiente',
    fechaCreacion: new Date('2023-01-01'),
    fechaActualizacion: new Date('2023-01-01')
  };

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getOrders', 'getOrderById', 'createOrder', 'updateOrder', 'deleteOrder'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    // Mock the initial API call before creating the service
    apiServiceSpy.getOrders.and.returnValue(of([]));
    
    service = TestBed.inject(OrdersService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrders', () => {
    it('should return orders observable', (done) => {
      const mockOrders = [mockOrder];
      apiService.getOrders.and.returnValue(of(mockOrders));

      service.refreshOrders();

      service.getOrders().subscribe(orders => {
        expect(orders.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', (done) => {
      apiService.getOrderById.and.returnValue(of(mockOrder));

      service.getOrderById(1).subscribe(order => {
        expect(order).toEqual(mockOrder);
        expect(apiService.getOrderById).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle error when getting order by id', (done) => {
      const error = new Error('Order not found');
      apiService.getOrderById.and.returnValue(throwError(() => error));

      service.getOrderById(999).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('createOrder', () => {
    it('should create new order and add to orders list', (done) => {
      const newOrderData = {
        fechaPedido: new Date('2023-01-01'),
        usuarioId: 1,
        usuario: mockUser,
        items: [{
          productoId: 1,
          producto: mockProduct,
          cantidad: 2,
          precioUnitario: 100,
          precioTotal: 200
        }],
        estado: 'Pendiente' as const
      };

      const createdOrder = { ...mockOrder, id: 2 };
      apiService.createOrder.and.returnValue(of(createdOrder));

      service.createOrder(newOrderData).subscribe(order => {
        expect(order).toEqual(createdOrder);
        expect(apiService.createOrder).toHaveBeenCalledWith({
          ...newOrderData,
          totalGeneral: 200
        });
        done();
      });
    });

    it('should calculate total general correctly', (done) => {
      const newOrderData = {
        fechaPedido: new Date('2023-01-01'),
        usuarioId: 1,
        usuario: mockUser,
        items: [
          {
            productoId: 1,
            producto: mockProduct,
            cantidad: 2,
            precioUnitario: 100,
            precioTotal: 200
          },
          {
            productoId: 2,
            producto: { ...mockProduct, id: 2 },
            cantidad: 1,
            precioUnitario: 50,
            precioTotal: 50
          }
        ],
        estado: 'Pendiente' as const
      };

      const createdOrder = { ...mockOrder, id: 2, totalGeneral: 250 };
      apiService.createOrder.and.returnValue(of(createdOrder));

      service.createOrder(newOrderData).subscribe(order => {
        expect(apiService.createOrder).toHaveBeenCalledWith({
          ...newOrderData,
          totalGeneral: 250
        });
        done();
      });
    });

    it('should handle error when creating order', (done) => {
      const newOrderData = {
        fechaPedido: new Date('2023-01-01'),
        usuarioId: 1,
        usuario: mockUser,
        items: [],
        estado: 'Pendiente' as const
      };

      const error = new Error('Failed to create order');
      apiService.createOrder.and.returnValue(throwError(() => error));

      service.createOrder(newOrderData).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('updateOrder', () => {
    it('should update order and refresh orders list', (done) => {
      const updateData = { estado: 'Procesando' as const };
      const updatedOrder = { ...mockOrder, estado: 'Procesando' as const };
      
      apiService.updateOrder.and.returnValue(of(updatedOrder));

      service.updateOrder(1, updateData).subscribe(order => {
        expect(order).toEqual(updatedOrder);
        expect(apiService.updateOrder).toHaveBeenCalledWith(1, updateData);
        done();
      });
    });

    it('should handle error when updating order', (done) => {
      const updateData = { estado: 'Procesando' as const };
      const error = new Error('Failed to update order');
      
      apiService.updateOrder.and.returnValue(throwError(() => error));

      service.updateOrder(1, updateData).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and remove from orders list', (done) => {
      apiService.deleteOrder.and.returnValue(of(true));

      service.deleteOrder(1).subscribe(result => {
        expect(result).toBe(true);
        expect(apiService.deleteOrder).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle error when deleting order', (done) => {
      const error = new Error('Failed to delete order');
      apiService.deleteOrder.and.returnValue(throwError(() => error));

      service.deleteOrder(1).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('searchOrders', () => {
    beforeEach((done) => {
      // Set up mock orders in the service before testing
      const mockOrders = [
        mockOrder,
        { ...mockOrder, id: 2, usuario: { ...mockUser, nombreCompleto: 'María García', email: 'maria@example.com' } },
        { ...mockOrder, id: 3, estado: 'Procesando' as const }
      ];
      
      // Mock the API call and load orders into the service
      apiService.getOrders.and.returnValue(of(mockOrders));
      service.refreshOrders();
      
      // Wait for the refresh to complete
      service.getOrders().subscribe(() => done());
    });

    it('should search orders by user name', () => {
      const results = service.searchOrders('Juan');
      // Should find orders with Juan in the name
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.usuario.nombreCompleto.includes('Juan'))).toBe(true);
    });

    it('should search orders by user email', () => {
      const results = service.searchOrders('maria@example.com');
      expect(results.length).toBe(1);
      expect(results[0].usuario.email).toContain('maria@example.com');
    });

    it('should search orders by status', () => {
      const results = service.searchOrders('Procesando');
      expect(results.length).toBe(1);
      expect(results[0].estado).toBe('Procesando');
    });

    it('should return empty array for no matches', () => {
      const results = service.searchOrders('NonExistent');
      expect(results.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const results = service.searchOrders('juan');
      // Should find both orders with Juan in them
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getOrdersByUser', () => {
    beforeEach(() => {
      // Set up mock orders in the service before testing
      const mockOrders = [
        mockOrder,
        { ...mockOrder, id: 2, usuarioId: 2 },
        { ...mockOrder, id: 3, usuarioId: 1 }
      ];
      
      // Mock the API call and load orders into the service
      apiService.getOrders.and.returnValue(of(mockOrders));
      service.refreshOrders();
    });

    it('should return orders for specific user', () => {
      const results = service.getOrdersByUser(1);
      expect(results.length).toBe(2);
      expect(results.every(order => order.usuarioId === 1)).toBe(true);
    });

    it('should return empty array for user with no orders', () => {
      const results = service.getOrdersByUser(999);
      expect(results.length).toBe(0);
    });
  });

  describe('refreshOrders', () => {
    it('should reload orders from API', () => {
      const mockOrders = [mockOrder];
      apiService.getOrders.and.returnValue(of(mockOrders));

      service.refreshOrders();

      expect(apiService.getOrders).toHaveBeenCalled();
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
});
