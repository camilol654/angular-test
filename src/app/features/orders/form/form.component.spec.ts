import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormComponent } from './form.component';
import { OrdersService } from '../../../services/orders.service';
import { UsersService } from '../../../services/users.service';
import { ProcutsService } from '../../../services/procuts.service';
import { Order, OrderItem } from '../../../interfaces/order.interface';
import { User } from '../../../interfaces/user.interface';
import { Product } from '../../../interfaces/product.interface';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let ordersService: jasmine.SpyObj<OrdersService>;
  let usersService: jasmine.SpyObj<UsersService>;
  let productsService: jasmine.SpyObj<ProcutsService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

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
    const ordersServiceSpy = jasmine.createSpyObj('OrdersService', [
      'getOrderById', 'createOrder', 'updateOrder'
    ]);
    const usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers']);
    const productsServiceSpy = jasmine.createSpyObj('ProcutsService', ['getProducts']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      snapshot: { 
        paramMap: jasmine.createSpyObj('ParamMap', ['get'])
      }
    };

    await TestBed.configureTestingModule({
      imports: [FormComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: ProcutsService, useValue: productsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    ordersService = TestBed.inject(OrdersService) as jasmine.SpyObj<OrdersService>;
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    productsService = TestBed.inject(ProcutsService) as jasmine.SpyObj<ProcutsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as any;
  });

  beforeEach(() => {
    usersService.getUsers.and.returnValue(of([mockUser]));
    productsService.getProducts.and.returnValue(of([mockProduct]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users and products', () => {
      component.ngOnInit();
      
      expect(usersService.getUsers).toHaveBeenCalled();
      expect(productsService.getProducts).toHaveBeenCalled();
      expect(component.users).toEqual([mockUser]);
      expect(component.products).toEqual([mockProduct]);
    });

    it('should set edit mode when id parameter exists', () => {
      (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.returnValue('1');
      ordersService.getOrderById.and.returnValue(of(mockOrder));
      
      component.ngOnInit();
      
      expect(component.isEditMode).toBe(true);
      expect(component.orderId).toBe(1);
      expect(ordersService.getOrderById).toHaveBeenCalledWith(1);
    });

    it('should not set edit mode when no id parameter', () => {
      (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);
      
      component.ngOnInit();
      
      expect(component.isEditMode).toBe(false);
      expect(component.orderId).toBeNull();
      expect(ordersService.getOrderById).not.toHaveBeenCalled();
    });
  });

  describe('Form Creation', () => {
    it('should create form with default values', () => {
      expect(component.orderForm).toBeDefined();
      expect(component.orderForm.get('fechaPedido')?.value).toBeDefined();
      expect(component.orderForm.get('usuarioId')?.value).toBe('');
      expect(component.orderForm.get('estado')?.value).toBe('Pendiente');
      expect(component.items.length).toBe(0);
    });

    it('should have required validators', () => {
      const fechaPedidoControl = component.orderForm.get('fechaPedido');
      const usuarioIdControl = component.orderForm.get('usuarioId');
      const estadoControl = component.orderForm.get('estado');
      
      expect(fechaPedidoControl?.hasError('required')).toBe(false); // Has default value
      expect(usuarioIdControl?.hasError('required')).toBe(true);
      expect(estadoControl?.hasError('required')).toBe(false); // Has default value
    });
  });

  describe('loadOrder', () => {
    beforeEach(() => {
      component.orderId = 1;
    });

    it('should load order and populate form', fakeAsync(() => {
      ordersService.getOrderById.and.returnValue(of(mockOrder));
      
      component['loadOrder']();
      tick();
      
      expect(component.orderForm.get('fechaPedido')?.value).toBe('2023-01-01');
      expect(component.orderForm.get('usuarioId')?.value).toBe(1);
      expect(component.orderForm.get('estado')?.value).toBe('Pendiente');
      expect(component.items.length).toBe(1);
      expect(component.loading).toBe(false);
    }));

    it('should handle error when loading order', fakeAsync(() => {
      const error = new Error('Order not found');
      ordersService.getOrderById.and.returnValue(throwError(() => error));
      
      component['loadOrder']();
      tick();
      
      expect(component.error).toBe('Order not found');
      expect(component.loading).toBe(false);
    }));
  });

  describe('Item Management', () => {
    it('should add item to form array', () => {
      const initialLength = component.items.length;
      
      component.addItem();
      
      expect(component.items.length).toBe(initialLength + 1);
    });

    it('should remove item from form array', () => {
      component.addItem();
      component.addItem();
      const initialLength = component.items.length;
      
      component.removeItem(0);
      
      expect(component.items.length).toBe(initialLength - 1);
    });

    it('should create item form group with correct validators', () => {
      const itemGroup = component['createItemFormGroup']();
      
      expect(itemGroup.get('productoId')?.hasError('required')).toBe(true);
      expect(itemGroup.get('cantidad')?.hasError('required')).toBe(false); // Has default value
      expect(itemGroup.get('cantidad')?.hasError('min')).toBe(false); // Default value is 1
      expect(itemGroup.get('precioUnitario')?.hasError('required')).toBe(false); // Has default value
      expect(itemGroup.get('precioUnitario')?.hasError('min')).toBe(true); // Default value is 0
    });
  });

  describe('onProductChange', () => {
    beforeEach(() => {
      component.addItem();
      // Ensure products are loaded
      component.products = [mockProduct];
    });

    it('should update price when product is selected', () => {
      const itemGroup = component.items.at(0);
      itemGroup.get('productoId')?.setValue(1);
      
      component.onProductChange(0);
      
      expect(itemGroup.get('precioUnitario')?.value).toBe(100);
    });

    it('should not update price when no product is selected', () => {
      const itemGroup = component.items.at(0);
      itemGroup.get('productoId')?.setValue('');
      
      component.onProductChange(0);
      
      expect(itemGroup.get('precioUnitario')?.value).toBe(0);
    });
  });

  describe('Calculations', () => {
    beforeEach(() => {
      component.addItem();
      const itemGroup = component.items.at(0);
      itemGroup.patchValue({
        productoId: 1,
        cantidad: 2,
        precioUnitario: 100
      });
    });

    it('should calculate item total correctly', () => {
      const total = component.calculateItemTotal(0);
      expect(total).toBe(200);
    });

    it('should calculate order total correctly', () => {
      component.addItem();
      const secondItem = component.items.at(1);
      secondItem.patchValue({
        productoId: 2,
        cantidad: 1,
        precioUnitario: 50
      });
      
      const total = component.calculateOrderTotal();
      expect(total).toBe(250);
    });

    it('should handle zero values in calculations', () => {
      const itemGroup = component.items.at(0);
      itemGroup.patchValue({
        cantidad: 0,
        precioUnitario: 100
      });
      
      const total = component.calculateItemTotal(0);
      expect(total).toBe(0);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
      component.users = [mockUser];
      component.products = [mockProduct];
    });

    it('should create new order when form is valid', () => {
      component.orderForm.patchValue({
        fechaPedido: '2023-01-01',
        usuarioId: 1,
        estado: 'Pendiente'
      });
      component.addItem();
      component.items.at(0).patchValue({
        productoId: 1,
        cantidad: 2,
        precioUnitario: 100
      });
      
      ordersService.createOrder.and.returnValue(of(mockOrder));
      
      component.onSubmit();
      
      expect(ordersService.createOrder).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Pedido creado exitosamente');
      expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    });

    it('should update existing order when in edit mode', () => {
      component.isEditMode = true;
      component.orderId = 1;
      component.orderForm.patchValue({
        fechaPedido: '2023-01-01',
        usuarioId: 1,
        estado: 'Procesando'
      });
      component.addItem();
      component.items.at(0).patchValue({
        productoId: 1,
        cantidad: 2,
        precioUnitario: 100
      });
      
      ordersService.updateOrder.and.returnValue(of(mockOrder));
      
      component.onSubmit();
      
      expect(ordersService.updateOrder).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(window.alert).toHaveBeenCalledWith('Pedido actualizado exitosamente');
      expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    });

    it('should handle error when creating order', () => {
      component.orderForm.patchValue({
        fechaPedido: '2023-01-01',
        usuarioId: 1,
        estado: 'Pendiente'
      });
      component.addItem();
      component.items.at(0).patchValue({
        productoId: 1,
        cantidad: 2,
        precioUnitario: 100
      });
      
      const error = new Error('Create failed');
      ordersService.createOrder.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(component.error).toBe('Create failed');
      expect(component.loading).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Error al crear el pedido: Create failed');
    });

    it('should not submit when form is invalid', () => {
      spyOn(component as any, 'markFormGroupTouched');
      
      component.onSubmit();
      
      expect(ordersService.createOrder).not.toHaveBeenCalled();
      expect((component as any).markFormGroupTouched).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Debe agregar al menos un producto al pedido');
    });

    it('should not submit when no items', () => {
      component.orderForm.patchValue({
        fechaPedido: '2023-01-01',
        usuarioId: 1,
        estado: 'Pendiente'
      });
      
      component.onSubmit();
      
      expect(ordersService.createOrder).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Debe agregar al menos un producto al pedido');
    });

    it('should not submit when loading', () => {
      component.loading = true;
      
      component.onSubmit();
      
      expect(ordersService.createOrder).not.toHaveBeenCalled();
    });
  });

  describe('markFormGroupTouched', () => {
    it('should mark all form controls as touched', () => {
      spyOn(component.orderForm, 'markAsTouched');
      
      component['markFormGroupTouched']();
      
      expect(component.orderForm.markAsTouched).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to orders list on cancel', () => {
      component.onCancel();
      
      expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    });

    it('should clear error', () => {
      component.error = 'Test error';
      
      component.onClearError();
      
      expect(component.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should return field error message', () => {
      const field = component.orderForm.get('usuarioId');
      field?.markAsTouched();
      
      const error = component.getFieldError('usuarioId');
      
      expect(error).toBe('Usuario es requerido');
    });

    it('should return item field error message', () => {
      component.addItem();
      const field = component.items.at(0).get('cantidad');
      field?.setValue(0);
      field?.markAsTouched();
      
      const error = component.getItemFieldError(0, 'cantidad');
      
      expect(error).toBe('Cantidad debe ser mayor a 1');
    });

    it('should return empty string when no error', () => {
      const error = component.getFieldError('estado');
      
      expect(error).toBe('');
    });
  });

  describe('Field Validation', () => {
    it('should check if field is invalid', () => {
      const field = component.orderForm.get('usuarioId');
      field?.markAsTouched();
      
      const isInvalid = component.isFieldInvalid('usuarioId');
      
      expect(isInvalid).toBe(true);
    });

    it('should check if item field is invalid', () => {
      component.addItem();
      const field = component.items.at(0).get('cantidad');
      field?.setValue(0);
      field?.markAsTouched();
      
      const isInvalid = component.isItemFieldInvalid(0, 'cantidad');
      
      expect(isInvalid).toBe(true);
    });
  });

  describe('Component Properties', () => {
    it('should initialize with default values', () => {
      expect(component.isEditMode).toBe(false);
      expect(component.orderId).toBeNull();
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.users).toEqual([]);
      expect(component.products).toEqual([]);
      expect(component.orderStatuses).toEqual(['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado']);
    });
  });
});
