import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ConnectionTestComponent } from './connection-test.component';
import { ApiTestService } from '../../../services/api-test.service';

describe('ConnectionTestComponent', () => {
  let component: ConnectionTestComponent;
  let fixture: ComponentFixture<ConnectionTestComponent>;
  let apiTestService: jasmine.SpyObj<ApiTestService>;

  beforeEach(async () => {
    const apiTestServiceSpy = jasmine.createSpyObj('ApiTestService', [
      'testConnection', 'testProductsEndpoint', 'testUsersEndpoint', 'testOrdersEndpoint'
    ]);

    await TestBed.configureTestingModule({
      imports: [ConnectionTestComponent],
      providers: [
        { provide: ApiTestService, useValue: apiTestServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectionTestComponent);
    component = fixture.componentInstance;
    apiTestService = TestBed.inject(ApiTestService) as jasmine.SpyObj<ApiTestService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Properties', () => {
    it('should initialize with default values', () => {
      expect(component.testing).toBe(false);
      expect(component.result).toBeNull();
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', fakeAsync(() => {
      const mockResult = {
        connected: true,
        message: 'Conexión exitosa con el backend'
      };
      apiTestService.testConnection.and.returnValue(of(mockResult));

      component.testConnection();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual(mockResult);
      expect(apiTestService.testConnection).toHaveBeenCalled();
    }));

    it('should handle connection error', fakeAsync(() => {
      const error = new Error('Connection failed');
      apiTestService.testConnection.and.returnValue(throwError(() => error));

      component.testConnection();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual({
        connected: false,
        message: 'Error inesperado: Connection failed'
      });
    }));

    it('should reset result before testing', fakeAsync(() => {
      component.result = { connected: false, message: 'Previous result' };
      const mockResult = {
        connected: true,
        message: 'Conexión exitosa con el backend'
      };
      apiTestService.testConnection.and.returnValue(of(mockResult));

      component.testConnection();
      tick();

      expect(component.result).toEqual(mockResult);
      expect(component.testing).toBe(false);
    }));
  });

  describe('testProductsEndpoint', () => {
    it('should test products endpoint successfully', fakeAsync(() => {
      const mockResult = {
        success: true,
        count: 5,
        message: 'Se encontraron 5 productos'
      };
      apiTestService.testProductsEndpoint.and.returnValue(of(mockResult));

      component.testProductsEndpoint();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual(mockResult);
      expect(apiTestService.testProductsEndpoint).toHaveBeenCalled();
    }));

    it('should handle products endpoint error', fakeAsync(() => {
      const error = new Error('Products endpoint failed');
      apiTestService.testProductsEndpoint.and.returnValue(throwError(() => error));

      component.testProductsEndpoint();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual({
        success: false,
        count: 0,
        message: 'Error inesperado: Products endpoint failed'
      });
    }));
  });

  describe('testUsersEndpoint', () => {
    it('should test users endpoint successfully', fakeAsync(() => {
      const mockResult = {
        success: true,
        count: 3,
        message: 'Se encontraron 3 usuarios'
      };
      apiTestService.testUsersEndpoint.and.returnValue(of(mockResult));

      component.testUsersEndpoint();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual(mockResult);
      expect(apiTestService.testUsersEndpoint).toHaveBeenCalled();
    }));

    it('should handle users endpoint error', fakeAsync(() => {
      const error = new Error('Users endpoint failed');
      apiTestService.testUsersEndpoint.and.returnValue(throwError(() => error));

      component.testUsersEndpoint();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual({
        success: false,
        count: 0,
        message: 'Error inesperado: Users endpoint failed'
      });
    }));
  });

  describe('testOrdersEndpoint', () => {
    it('should test orders endpoint successfully', fakeAsync(() => {
      const mockResult = {
        success: true,
        count: 7,
        message: 'Se encontraron 7 pedidos'
      };
      apiTestService.testOrdersEndpoint.and.returnValue(of(mockResult));

      component.testOrdersEndpoint();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual(mockResult);
      expect(apiTestService.testOrdersEndpoint).toHaveBeenCalled();
    }));

    it('should handle orders endpoint error', fakeAsync(() => {
      const error = new Error('Orders endpoint failed');
      apiTestService.testOrdersEndpoint.and.returnValue(throwError(() => error));

      component.testOrdersEndpoint();
      tick();

      expect(component.testing).toBe(false);
      expect(component.result).toEqual({
        success: false,
        count: 0,
        message: 'Error inesperado: Orders endpoint failed'
      });
    }));
  });

  describe('ngOnInit', () => {
    it('should initialize component', () => {
      component.ngOnInit();
      
      expect(component.testing).toBe(false);
      expect(component.result).toBeNull();
    });
  });

  describe('Component Rendering', () => {
    it('should render test buttons', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      
      expect(compiled.textContent).toContain('Probar Conexión General');
      expect(compiled.textContent).toContain('Probar Endpoint de Productos');
      expect(compiled.textContent).toContain('Probar Endpoint de Usuarios');
      expect(compiled.textContent).toContain('Probar Endpoint de Pedidos');
    });

    it('should show testing state', () => {
      component.testing = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Probando...');
    });

    it('should show success result', () => {
      component.result = {
        connected: true,
        message: 'Conexión exitosa'
      };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Éxito');
      expect(compiled.textContent).toContain('Conexión exitosa');
    });

    it('should show error result', () => {
      component.result = {
        connected: false,
        message: 'Error de conexión'
      };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Error');
      expect(compiled.textContent).toContain('Error de conexión');
    });

    it('should show count when available', () => {
      component.result = {
        success: true,
        count: 5,
        message: 'Se encontraron 5 productos'
      };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Productos encontrados: 5');
    });

    it('should show info message when no result', () => {
      component.result = null;
      component.testing = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Haga clic en los botones para probar la conexión');
    });
  });

  describe('Button States', () => {
    it('should disable buttons when testing', () => {
      component.testing = true;
      fixture.detectChanges();
      
      const buttons = fixture.nativeElement.querySelectorAll('button');
      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.disabled).toBe(true);
      });
    });

    it('should enable buttons when not testing', () => {
      component.testing = false;
      fixture.detectChanges();
      
      const buttons = fixture.nativeElement.querySelectorAll('button');
      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.disabled).toBe(false);
      });
    });
  });
});
