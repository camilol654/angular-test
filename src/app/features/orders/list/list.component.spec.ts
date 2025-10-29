import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { ListComponent } from './list.component';
import { OrdersService } from '../../../services/orders.service';
import { Order } from '../../../interfaces/order.interface';
import { User } from '../../../interfaces/user.interface';
import { Product } from '../../../interfaces/product.interface';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let ordersService: jasmine.SpyObj<OrdersService>;
  let loadingSubject: BehaviorSubject<boolean>;
  let errorSubject: BehaviorSubject<string | null>;

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
    loadingSubject = new BehaviorSubject<boolean>(false);
    errorSubject = new BehaviorSubject<string | null>(null);
    
    const ordersServiceSpy = jasmine.createSpyObj('OrdersService', [
      'getOrders', 'searchOrders', 'deleteOrder', 'refreshOrders', 'clearError'
    ], {
      loading$: loadingSubject.asObservable(),
      error$: errorSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ListComponent, RouterTestingModule],
      providers: [
        { provide: OrdersService, useValue: ordersServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    ordersService = TestBed.inject(OrdersService) as jasmine.SpyObj<OrdersService>;
  });

  beforeEach(() => {
    ordersService.getOrders.and.returnValue(of([mockOrder]));
    loadingSubject.next(false);
    errorSubject.next(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load orders on init', () => {
      component.ngOnInit();
      
      expect(ordersService.getOrders).toHaveBeenCalled();
      expect(component.orders).toEqual([mockOrder]);
      expect(component.filteredOrders).toEqual([mockOrder]);
    });

    it('should subscribe to loading state', fakeAsync(() => {
      loadingSubject.next(true);
      component.ngOnInit();
      tick();
      
      expect(component.loading).toBe(true);
    }));

    it('should subscribe to error state', fakeAsync(() => {
      errorSubject.next('Test error');
      component.ngOnInit();
      tick();
      
      expect(component.error).toBe('Test error');
    }));
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      spyOn(component['subscription'], 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(component['subscription'].unsubscribe).toHaveBeenCalled();
    });
  });

  describe('onSearch', () => {
    beforeEach(() => {
      component.orders = [mockOrder];
      component.filteredOrders = [mockOrder];
    });

    it('should search orders when query is provided', () => {
      const searchResults = [mockOrder];
      ordersService.searchOrders.and.returnValue(searchResults);
      component.searchQuery = 'Juan';
      
      component.onSearch();
      
      expect(ordersService.searchOrders).toHaveBeenCalledWith('Juan');
      expect(component.filteredOrders).toEqual(searchResults);
    });

    it('should show all orders when query is empty', () => {
      component.searchQuery = '';
      
      component.onSearch();
      
      expect(component.filteredOrders).toEqual(component.orders);
      expect(ordersService.searchOrders).not.toHaveBeenCalled();
    });

    it('should show all orders when query is only whitespace', () => {
      component.searchQuery = '   ';
      
      component.onSearch();
      
      expect(component.filteredOrders).toEqual(component.orders);
      expect(ordersService.searchOrders).not.toHaveBeenCalled();
    });
  });

  describe('onClearSearch', () => {
    it('should clear search query and show all orders', () => {
      component.searchQuery = 'test query';
      component.filteredOrders = [];
      
      component.onClearSearch();
      
      expect(component.searchQuery).toBe('');
      expect(component.filteredOrders).toEqual(component.orders);
    });
  });

  describe('onDeleteOrder', () => {
    it('should delete order when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      ordersService.deleteOrder.and.returnValue(of(true));
      
      component.onDeleteOrder(1);
      
      expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar este pedido?');
      expect(ordersService.deleteOrder).toHaveBeenCalledWith(1);
      expect(window.alert).toHaveBeenCalledWith('Pedido eliminado exitosamente');
    });

    it('should show error alert on deletion failure', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      const error = new Error('Delete failed');
      ordersService.deleteOrder.and.returnValue(throwError(() => error));
      
      component.onDeleteOrder(1);
      
      expect(window.alert).toHaveBeenCalledWith('Error al eliminar el pedido: Delete failed');
    });

    it('should not delete order when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.onDeleteOrder(1);
      
      expect(ordersService.deleteOrder).not.toHaveBeenCalled();
    });
  });

  describe('onRefresh', () => {
    it('should refresh orders', () => {
      component.onRefresh();
      
      expect(ordersService.refreshOrders).toHaveBeenCalled();
    });
  });

  describe('onClearError', () => {
    it('should clear error', () => {
      component.onClearError();
      
      expect(ordersService.clearError).toHaveBeenCalled();
    });
  });

  describe('formatPrice', () => {
    it('should format price in USD currency', () => {
      const formattedPrice = component.formatPrice(1234.56);
      
      expect(formattedPrice).toContain('1234,56');
      expect(formattedPrice).toContain('US$');
    });

    it('should handle zero price', () => {
      const formattedPrice = component.formatPrice(0);
      
      // Just check that it's a valid string with expected content
      expect(typeof formattedPrice).toBe('string');
      expect(formattedPrice.length).toBeGreaterThan(0);
      expect(formattedPrice).toContain('0');
    });

    it('should handle negative price', () => {
      const formattedPrice = component.formatPrice(-100);
      
      expect(formattedPrice).toContain('-100');
    });
  });

  describe('formatDate', () => {
    it('should format date in Spanish locale', () => {
      const testDate = new Date('2023-12-25T14:30:00');
      const formattedDate = component.formatDate(testDate);
      
      expect(formattedDate).toContain('25');
      expect(formattedDate).toContain('12');
      expect(formattedDate).toContain('2023');
      expect(formattedDate).toContain('14');
      expect(formattedDate).toContain('30');
    });

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid');
      
      // formatDate uses Intl.DateTimeFormat which throws for invalid dates
      expect(() => component.formatDate(invalidDate)).toThrow();
    });
  });

  describe('getStatusClass', () => {
    it('should return correct class for Pendiente status', () => {
      const statusClass = component.getStatusClass('Pendiente');
      expect(statusClass).toBe('text-warning fw-bold');
    });

    it('should return correct class for Procesando status', () => {
      const statusClass = component.getStatusClass('Procesando');
      expect(statusClass).toBe('text-info fw-bold');
    });

    it('should return correct class for Enviado status', () => {
      const statusClass = component.getStatusClass('Enviado');
      expect(statusClass).toBe('text-primary fw-bold');
    });

    it('should return correct class for Entregado status', () => {
      const statusClass = component.getStatusClass('Entregado');
      expect(statusClass).toBe('text-success fw-bold');
    });

    it('should return correct class for Cancelado status', () => {
      const statusClass = component.getStatusClass('Cancelado');
      expect(statusClass).toBe('text-danger fw-bold');
    });

    it('should return default class for unknown status', () => {
      const statusClass = component.getStatusClass('Unknown');
      expect(statusClass).toBe('text-muted');
    });
  });

  describe('Component Properties', () => {
    it('should initialize with default values', () => {
      expect(component.orders).toEqual([]);
      expect(component.filteredOrders).toEqual([]);
      expect(component.searchQuery).toBe('');
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });
  });
});
