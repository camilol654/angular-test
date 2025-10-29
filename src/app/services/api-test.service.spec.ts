import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiTestService } from './api-test.service';
import { API_CONFIG } from './api.config';

describe('ApiTestService', () => {
  let service: ApiTestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiTestService]
    });

    service = TestBed.inject(ApiTestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('testConnection', () => {
    it('should return success when connection is successful', () => {
      const mockResponse: any[] = [];

      service.testConnection().subscribe(result => {
        expect(result.connected).toBe(true);
        expect(result.message).toBe('Conexión exitosa con el backend');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Content-Type')).toBe(API_CONFIG.headers['Content-Type']);
      req.flush(mockResponse);
    });

    it('should return error when connection fails', () => {
      service.testConnection().subscribe(result => {
        expect(result.connected).toBe(false);
        expect(result.message).toContain('Error de conexión');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', () => {
      service.testConnection().subscribe(result => {
        expect(result.connected).toBe(false);
        expect(result.message).toContain('Error de conexión');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.error(new ErrorEvent('Network Error'));
    });
  });

  describe('testProductsEndpoint', () => {
    it('should return success with product count', () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' }
      ];

      service.testProductsEndpoint().subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.count).toBe(3);
        expect(result.message).toBe('Se encontraron 3 productos');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should return success with zero count for empty response', () => {
      const mockProducts: any[] = [];

      service.testProductsEndpoint().subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.count).toBe(0);
        expect(result.message).toBe('Se encontraron 0 productos');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush(mockProducts);
    });

    it('should handle error in products endpoint', () => {
      service.testProductsEndpoint().subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.count).toBe(0);
        expect(result.message).toContain('Error en endpoint');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('testUsersEndpoint', () => {
    it('should return success with user count', () => {
      const mockUsers = [
        { id: 1, nombreCompleto: 'User 1' },
        { id: 2, nombreCompleto: 'User 2' }
      ];

      service.testUsersEndpoint().subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.count).toBe(2);
        expect(result.message).toBe('Se encontraron 2 usuarios');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle error in users endpoint', () => {
      service.testUsersEndpoint().subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.count).toBe(0);
        expect(result.message).toContain('Error en endpoint');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('testOrdersEndpoint', () => {
    it('should return success with order count', () => {
      const mockOrders = [
        { id: 1, estado: 'Pendiente' },
        { id: 2, estado: 'Procesando' },
        { id: 3, estado: 'Enviado' },
        { id: 4, estado: 'Entregado' }
      ];

      service.testOrdersEndpoint().subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.count).toBe(4);
        expect(result.message).toBe('Se encontraron 4 pedidos');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });

    it('should handle error in orders endpoint', () => {
      service.testOrdersEndpoint().subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.count).toBe(0);
        expect(result.message).toContain('Error en endpoint');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders`);
      req.flush('Error', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Error Handling', () => {
    it('should handle different HTTP error statuses', () => {
      const errorStatuses = [400, 401, 403, 404, 500];
      
      errorStatuses.forEach(status => {
        service.testConnection().subscribe(result => {
          expect(result.connected).toBe(false);
          expect(result.message).toContain('Error de conexión');
        });

        const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
        req.flush('Error', { status, statusText: 'Error' });
      });
    });

    it('should handle timeout errors', () => {
      service.testConnection().subscribe(result => {
        expect(result.connected).toBe(false);
        expect(result.message).toContain('Error de conexión');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.error(new ErrorEvent('timeout'));
    });

    it('should handle CORS errors', () => {
      service.testConnection().subscribe(result => {
        expect(result.connected).toBe(false);
        expect(result.message).toContain('Error de conexión');
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req.error(new ErrorEvent('cors'));
    });
  });

  describe('HTTP Headers', () => {
    it('should include correct headers in all requests', () => {
      service.testConnection().subscribe();
      service.testProductsEndpoint().subscribe();
      service.testUsersEndpoint().subscribe();
      service.testOrdersEndpoint().subscribe();

      // Get all pending requests
      const productsReq = httpMock.match(`${API_CONFIG.baseUrl}/Products`);
      const usersReq = httpMock.match(`${API_CONFIG.baseUrl}/Users`);
      const ordersReq = httpMock.match(`${API_CONFIG.baseUrl}/Orders`);

      // Verify headers exist for all requests
      [...productsReq, ...usersReq, ...ordersReq].forEach(req => {
        expect(req.request.headers.get('Content-Type')).toBe(API_CONFIG.headers['Content-Type']);
        req.flush([]);
      });
    });
  });

  describe('Response Format', () => {
    it('should return consistent response format for all methods', () => {
      // Test testConnection
      service.testConnection().subscribe((result: any) => {
        expect(result.hasOwnProperty('connected')).toBe(true);
        expect(result.hasOwnProperty('message')).toBe(true);
        expect(typeof result.connected).toBe('boolean');
        expect(typeof result.message).toBe('string');
      });
      const req1 = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req1.flush([]);

      // Test testProductsEndpoint
      service.testProductsEndpoint().subscribe((result: any) => {
        expect(result.hasOwnProperty('success')).toBe(true);
        expect(result.hasOwnProperty('count')).toBe(true);
        expect(result.hasOwnProperty('message')).toBe(true);
        expect(typeof result.success).toBe('boolean');
        expect(typeof result.count).toBe('number');
        expect(typeof result.message).toBe('string');
      });
      const req2 = httpMock.expectOne(`${API_CONFIG.baseUrl}/Products`);
      req2.flush([]);

      // Test testUsersEndpoint
      service.testUsersEndpoint().subscribe((result: any) => {
        expect(result.hasOwnProperty('success')).toBe(true);
        expect(result.hasOwnProperty('count')).toBe(true);
        expect(result.hasOwnProperty('message')).toBe(true);
        expect(typeof result.success).toBe('boolean');
        expect(typeof result.count).toBe('number');
        expect(typeof result.message).toBe('string');
      });
      const req3 = httpMock.expectOne(`${API_CONFIG.baseUrl}/Users`);
      req3.flush([]);

      // Test testOrdersEndpoint
      service.testOrdersEndpoint().subscribe((result: any) => {
        expect(result.hasOwnProperty('success')).toBe(true);
        expect(result.hasOwnProperty('count')).toBe(true);
        expect(result.hasOwnProperty('message')).toBe(true);
        expect(typeof result.success).toBe('boolean');
        expect(typeof result.count).toBe('number');
        expect(typeof result.message).toBe('string');
      });
      const req4 = httpMock.expectOne(`${API_CONFIG.baseUrl}/Orders`);
      req4.flush([]);
    });
  });
});
