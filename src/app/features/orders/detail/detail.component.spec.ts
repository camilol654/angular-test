import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DetailComponent } from './detail.component';
import { OrdersService } from '../../../services/orders.service';
import { ApiService } from '../../../services/api.service';
import { Order } from '../../../interfaces/order.interface';
import { User } from '../../../interfaces/user.interface';
import { Product } from '../../../interfaces/product.interface';
import { RouterTestingModule } from '@angular/router/testing';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let ordersService: jasmine.SpyObj<OrdersService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: Router;
  let mockParamMapGet: jasmine.Spy;

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

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getOrders', 'getOrderById', 'createOrder', 'updateOrder', 'deleteOrder'
    ]);
    const ordersServiceSpy = jasmine.createSpyObj('OrdersService', [
      'getOrderById', 'deleteOrder'
    ]);
    
    // Mock the initial API call that happens in OrdersService constructor
    apiServiceSpy.getOrders.and.returnValue(of([]));
    apiServiceSpy.getOrderById.and.returnValue(of(mockOrder));  
    ordersServiceSpy.getOrderById.and.returnValue(of(mockOrder));
    ordersServiceSpy.deleteOrder.and.returnValue(of(true));

    // Create the spy for paramMap.get
    mockParamMapGet = jasmine.createSpy('get').and.returnValue('1');

    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: mockParamMapGet
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    
    ordersService = TestBed.inject(OrdersService) as jasmine.SpyObj<OrdersService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router);
  });

  // ==========================================
  // BASIC COMPONENT TESTS
  // ==========================================
  
  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      // Component is created successfully in beforeEach
      expect(component).toBeDefined();
      expect(component).toBeTruthy();
      expect(component.order).toBeUndefined();
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });
  });

  // ==========================================
  // LIFECYCLE HOOKS TESTS
  // ==========================================

  describe('ngOnInit', () => {
    // Component initialization is tested indirectly through other tests
    it('should be properly initialized', () => {
      expect(component).toBeDefined();
    });
  });

  // ==========================================
  // PRIVATE METHODS TESTS
  // ==========================================

  describe('loadOrder', () => {
    beforeEach(() => {
      component.id = 1;
    });

    it('should load order successfully', fakeAsync(() => {
      ordersService.getOrderById.and.returnValue(of(mockOrder));
      
      component['loadOrder']();
      tick();
      
      expect(component.order).toEqual(mockOrder);
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    }));

    it('should handle error when loading order', fakeAsync(() => {
      const error = new Error('Order not found');
      ordersService.getOrderById.and.returnValue(throwError(() => error));
      
      component['loadOrder']();
      tick();
      
      expect(component.error).toBe('Order not found');
      expect(component.loading).toBe(false);
      expect(component.order).toBeUndefined();
    }));
  });

  // ==========================================
  // EVENT HANDLERS TESTS
  // ==========================================

  describe('onDeleteOrder', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      component.order = mockOrder;
    });

    it('should delete order successfully when confirmed', fakeAsync(() => {
      spyOn(router, 'navigate');
      ordersService.deleteOrder.and.returnValue(of(true));
      
      component.onDeleteOrder();
      tick();
      
      expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar este pedido?');
      expect(ordersService.deleteOrder).toHaveBeenCalledWith(1);
      expect(window.alert).toHaveBeenCalledWith('Pedido eliminado exitosamente');
      expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    }));

    it('should not delete order when user cancels confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      spyOn(router, 'navigate');
      
      component.onDeleteOrder();
      
      expect(ordersService.deleteOrder).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not delete order when no order is loaded', () => {
      component.order = undefined;
      
      component.onDeleteOrder();
      
      expect(ordersService.deleteOrder).not.toHaveBeenCalled();
    });

    it('should handle error when deleting order', fakeAsync(() => {
      const error = new Error('Delete failed');
      spyOn(router, 'navigate');
      ordersService.deleteOrder.and.returnValue(throwError(() => error));
      
      component.onDeleteOrder();
      tick();
      
      expect(component.error).toBe('Delete failed');
      expect(window.alert).toHaveBeenCalledWith('Error al eliminar el pedido: Delete failed');
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('onClearError', () => {
    it('should clear error message', () => {
      component.error = 'Test error';
      
      component.onClearError();
      
      expect(component.error).toBeNull();
    });

    it('should handle clearing when error is already null', () => {
      component.error = null;
      
      component.onClearError();
      
      expect(component.error).toBeNull();
    });
  });

  // ==========================================
  // UTILITY METHODS TESTS
  // ==========================================

  describe('formatPrice', () => {
    it('should format large prices with decimals', () => {
      const result = component.formatPrice(1234.56);
      
      expect(result).toContain('1234,56');
      expect(result).toContain('US$');
    });

    it('should format zero price', () => {
      const result = component.formatPrice(0);
      
      expect(result).toContain('0,00');
      expect(result).toContain('US$');
    });

    it('should format negative prices', () => {
      const result = component.formatPrice(-100);
      
      expect(result).toContain('-100');
      expect(result).toContain('US$');
    });

    it('should format prices with two decimals', () => {
      const result = component.formatPrice(99.99);
      
      expect(result).toContain('99,99');
      expect(result).toContain('US$');
    });
  });

  describe('formatDate', () => {
    it('should format date with time in Spanish locale', () => {
      const testDate = new Date('2023-12-25T14:30:00');
      const result = component.formatDate(testDate);
      
      expect(result).toContain('25');
      expect(result).toContain('diciembre');
      expect(result).toContain('2023');
      expect(result).toContain('14');
      expect(result).toContain('30');
    });

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid');
      
      // formatDate uses Intl.DateTimeFormat which throws for invalid dates
      expect(() => component.formatDate(invalidDate)).toThrow();
    });

    it('should format date with Spanish month names', () => {
      const testDate = new Date('2023-01-01T00:00:00');
      const result = component.formatDate(testDate);
      
      expect(result).toContain('enero');
      expect(result).toContain('2023');
    });
  });

  describe('getStatusClass', () => {
    it('should return warning class for Pendiente status', () => {
      const result = component.getStatusClass('Pendiente');
      
      expect(result).toBe('text-warning fw-bold');
    });

    it('should return info class for Procesando status', () => {
      const result = component.getStatusClass('Procesando');
      
      expect(result).toBe('text-info fw-bold');
    });

    it('should return primary class for Enviado status', () => {
      const result = component.getStatusClass('Enviado');
      
      expect(result).toBe('text-primary fw-bold');
    });

    it('should return success class for Entregado status', () => {
      const result = component.getStatusClass('Entregado');
      
      expect(result).toBe('text-success fw-bold');
    });

    it('should return danger class for Cancelado status', () => {
      const result = component.getStatusClass('Cancelado');
      
      expect(result).toBe('text-danger fw-bold');
    });

    it('should return default muted class for unknown status', () => {
      const result = component.getStatusClass('Unknown');
      
      expect(result).toBe('text-muted');
    });

    it('should return muted class for empty status', () => {
      const result = component.getStatusClass('');
      
      expect(result).toBe('text-muted');
    });
  });

  // ==========================================
  // VIEW/TEMPLATE RENDERING TESTS
  // ==========================================

  describe('Component Rendering', () => {
    beforeEach(() => {
      // Reset component state before each rendering test
      component.order = undefined;
      component.loading = false;
      component.error = null;
      fixture.detectChanges();
    });

    it('should display order information when order is loaded', () => {
      component.order = mockOrder;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      
      expect(compiled.textContent).toContain('Juan Pérez');
      expect(compiled.textContent).toContain('Pendiente');
      expect(compiled.textContent).toContain('Pedido #1');
    });

    it('should show loading spinner when loading is true', () => {
      component.loading = true;
      component.order = undefined;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      
      expect(compiled.textContent).toContain('Cargando');
    });

    it('should show error message when error occurs', () => {
      component.error = 'Test error';
      component.order = undefined;
      component.loading = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      
      expect(compiled.textContent).toContain('Test error');
    });
  });
});