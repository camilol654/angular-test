import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { Product } from '../interfaces/product.interface';
import { User } from '../interfaces/user.interface';
import { Order } from '../interfaces/order.interface';
import { API_CONFIG } from './api.config';

describe('ApiService', () => {
  let service: ApiService;
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

  const mockUser: User = {
    id: 1,
    nombreCompleto: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '123456789',
    fechaRegistro: new Date('2023-01-01'),
    fechaActualizacion: new Date('2023-01-01')
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
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Products API', () => {
    describe('getProducts', () => {
      it('should return products array', () => {
        const mockProducts = [mockProduct];

        service.getProducts().subscribe(products => {
          expect(products).toEqual(mockProducts);
          expect(products[0].createdDate).toBeInstanceOf(Date);
          expect(products[0].updatedDate).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
        expect(req.request.method).toBe('GET');
        req.flush(mockProducts);
      });

      it('should handle error when getting products', () => {
        service.getProducts().subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toContain('Error');
          }
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
        req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
      });
    });

    describe('getProductById', () => {
      it('should return product by id', () => {
        service.getProductById(1).subscribe(product => {
          expect(product).toEqual(mockProduct);
          expect(product.createdDate).toBeInstanceOf(Date);
          expect(product.updatedDate).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockProduct);
      });

      it('should handle 404 error', () => {
        service.getProductById(999).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toContain('Recurso no encontrado');
          }
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products/999`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      });
    });

    describe('createProduct', () => {
      it('should create new product', () => {
        const newProduct = {
          name: 'Nuevo Producto',
          description: 'Descripción',
          price: 150,
          stock: 5,
          category: 'Nueva Categoría'
        };

        service.createProduct(newProduct).subscribe(product => {
          expect(product.name).toBe(newProduct.name);
          expect(product.createdDate).toBeInstanceOf(Date);
          expect(product.updatedDate).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.id).toBe(0);
        expect(req.request.body.createdDate).toBeDefined();
        expect(req.request.body.updatedDate).toBeDefined();
        req.flush({ ...mockProduct, ...newProduct });
      });

      it('should handle validation error', () => {
        const invalidProduct = {
          name: '',
          description: '',
          price: -1,
          stock: -1,
          category: ''
        };

        service.createProduct(invalidProduct).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toContain('Datos de entrada inválidos');
          }
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
        req.flush('Validation Error', { status: 422, statusText: 'Unprocessable Entity' });
      });
    });

    describe('updateProduct', () => {
      it('should update existing product', () => {
        const updateData = { name: 'Producto Actualizado', price: 200 };

        service.updateProduct(1, updateData).subscribe(product => {
          expect(product.name).toBe(updateData.name);
          expect(product.price).toBe(updateData.price);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body.id).toBe(1);
        expect(req.request.body.updatedDate).toBeDefined();
        req.flush({ ...mockProduct, ...updateData });
      });
    });

    describe('deleteProduct', () => {
      it('should delete product', () => {
        service.deleteProduct(1).subscribe(result => {
          expect(result).toBe(true);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });

      it('should handle delete error', () => {
        service.deleteProduct(1).subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.message).toContain('Error');
          }
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products/1`);
        req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
      });
    });
  });

  describe('Users API', () => {
    describe('getUsers', () => {
      it('should return users array', () => {
        const mockUsers = [mockUser];

        service.getUsers().subscribe(users => {
          expect(users).toEqual(mockUsers);
          expect(users[0].fechaRegistro).toBeInstanceOf(Date);
          expect(users[0].fechaActualizacion).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUsers);
      });
    });

    describe('getUserById', () => {
      it('should return user by id', () => {
        service.getUserById(1).subscribe(user => {
          expect(user).toEqual(mockUser);
          expect(user.fechaRegistro).toBeInstanceOf(Date);
          expect(user.fechaActualizacion).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);
      });
    });

    describe('createUser', () => {
      it('should create new user', () => {
        const newUser = {
          nombreCompleto: 'María García',
          email: 'maria@example.com',
          telefono: '987654321'
        };

        service.createUser(newUser).subscribe(user => {
          expect(user.nombreCompleto).toBe(newUser.nombreCompleto);
          expect(user.fechaRegistro).toBeInstanceOf(Date);
          expect(user.fechaActualizacion).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.id).toBe(0);
        expect(req.request.body.fechaRegistro).toBeDefined();
        expect(req.request.body.fechaActualizacion).toBeDefined();
        req.flush({ ...mockUser, ...newUser });
      });
    });

    describe('updateUser', () => {
      it('should update existing user', () => {
        const updateData = { nombreCompleto: 'Juan Carlos Pérez' };

        service.updateUser(1, updateData).subscribe(user => {
          expect(user.nombreCompleto).toBe(updateData.nombreCompleto);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body.id).toBe(1);
        expect(req.request.body.fechaActualizacion).toBeDefined();
        req.flush({ ...mockUser, ...updateData });
      });
    });

    describe('deleteUser', () => {
      it('should delete user', () => {
        service.deleteUser(1).subscribe(result => {
          expect(result).toBe(true);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });
    });
  });

  describe('Orders API', () => {
    describe('getOrders', () => {
      it('should return orders array', () => {
        const mockOrders = [mockOrder];

        service.getOrders().subscribe(orders => {
          expect(orders).toEqual(mockOrders);
          expect(orders[0].fechaPedido).toBeInstanceOf(Date);
          expect(orders[0].fechaCreacion).toBeInstanceOf(Date);
          expect(orders[0].fechaActualizacion).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders`);
        expect(req.request.method).toBe('GET');
        req.flush(mockOrders);
      });
    });

    describe('getOrderById', () => {
      it('should return order by id', () => {
        service.getOrderById(1).subscribe(order => {
          expect(order).toEqual(mockOrder);
          expect(order.fechaPedido).toBeInstanceOf(Date);
          expect(order.fechaCreacion).toBeInstanceOf(Date);
          expect(order.fechaActualizacion).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockOrder);
      });
    });

    describe('createOrder', () => {
      it('should create new order', () => {
        const newOrder = {
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
          estado: 'Pendiente' as const
        };

        service.createOrder(newOrder).subscribe(order => {
          expect(order.totalGeneral).toBe(newOrder.totalGeneral);
          expect(order.fechaCreacion).toBeInstanceOf(Date);
          expect(order.fechaActualizacion).toBeInstanceOf(Date);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.id).toBe(0);
        expect(req.request.body.fechaCreacion).toBeDefined();
        expect(req.request.body.fechaActualizacion).toBeDefined();
        req.flush({ ...mockOrder, ...newOrder });
      });
    });

    describe('updateOrder', () => {
      it('should update existing order', () => {
        const updateData = { estado: 'Procesando' as const };

        service.updateOrder(1, updateData).subscribe(order => {
          expect(order.estado).toBe(updateData.estado);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders/1`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body.id).toBe(1);
        expect(req.request.body.fechaActualizacion).toBeDefined();
        req.flush({ ...mockOrder, ...updateData });
      });
    });

    describe('deleteOrder', () => {
      it('should delete order', () => {
        service.deleteOrder(1).subscribe(result => {
          expect(result).toBe(true);
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 Bad Request', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Solicitud incorrecta');
        }
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 401 Unauthorized', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('No autorizado');
        }
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 Forbidden', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Acceso denegado');
        }
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 409 Conflict', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Conflicto');
        }
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });
    });

    it('should handle 0 Network Error', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('No se pudo conectar');
        }
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush('Network Error', { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle client-side error', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Error');
        }
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.error(new ErrorEvent('Client Error'));
    });
  });
});
