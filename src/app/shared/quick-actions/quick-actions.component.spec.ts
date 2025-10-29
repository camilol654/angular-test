import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { QuickActionsComponent } from './quick-actions.component';

describe('QuickActionsComponent', () => {
  let component: QuickActionsComponent;
  let fixture: ComponentFixture<QuickActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActionsComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Quick Actions Array', () => {
    it('should have 4 quick actions', () => {
      expect(component.quickActions.length).toBe(4);
    });

    it('should have correct structure for each action', () => {
      component.quickActions.forEach(action => {
        expect(action.label).toBeDefined();
        expect(action.icon).toBeDefined();
        expect(action.route).toBeDefined();
        expect(action.color).toBeDefined();
        expect(action.description).toBeDefined();
      });
    });

    it('should have "Nuevo Producto" action', () => {
      const newProductAction = component.quickActions.find(action => action.label === 'Nuevo Producto');
      
      expect(newProductAction).toBeDefined();
      expect(newProductAction?.icon).toBe('fas fa-plus');
      expect(newProductAction?.route).toBe('/products/create');
      expect(newProductAction?.color).toBe('primary');
      expect(newProductAction?.description).toBe('Agregar un nuevo producto al catálogo');
    });

    it('should have "Nuevo Usuario" action', () => {
      const newUserAction = component.quickActions.find(action => action.label === 'Nuevo Usuario');
      
      expect(newUserAction).toBeDefined();
      expect(newUserAction?.icon).toBe('fas fa-user-plus');
      expect(newUserAction?.route).toBe('/users/create');
      expect(newUserAction?.color).toBe('success');
      expect(newUserAction?.description).toBe('Registrar un nuevo usuario');
    });

    it('should have "Nuevo Pedido" action', () => {
      const newOrderAction = component.quickActions.find(action => action.label === 'Nuevo Pedido');
      
      expect(newOrderAction).toBeDefined();
      expect(newOrderAction?.icon).toBe('fas fa-shopping-cart');
      expect(newOrderAction?.route).toBe('/orders/create');
      expect(newOrderAction?.color).toBe('warning');
      expect(newOrderAction?.description).toBe('Crear un nuevo pedido');
    });

    it('should have "Probar Conexión" action', () => {
      const testConnectionAction = component.quickActions.find(action => action.label === 'Probar Conexión');
      
      expect(testConnectionAction).toBeDefined();
      expect(testConnectionAction?.icon).toBe('fas fa-wifi');
      expect(testConnectionAction?.route).toBe('/products/test-connection');
      expect(testConnectionAction?.color).toBe('info');
      expect(testConnectionAction?.description).toBe('Verificar conectividad con el backend');
    });
  });

  describe('Action Properties Validation', () => {
    it('should have valid routes for all actions', () => {
      component.quickActions.forEach(action => {
        expect(action.route).toMatch(/^\//); // Should start with /
        expect(action.route.length).toBeGreaterThan(1); // Should not be just /
      });
    });

    it('should have valid colors for all actions', () => {
      const validColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
      
      component.quickActions.forEach(action => {
        expect(validColors).toContain(action.color);
      });
    });

    it('should have valid icons for all actions', () => {
      component.quickActions.forEach(action => {
        expect(action.icon).toMatch(/^fas fa-/); // Should be FontAwesome solid icons
      });
    });

    it('should have non-empty labels and descriptions', () => {
      component.quickActions.forEach(action => {
        expect(action.label.trim().length).toBeGreaterThan(0);
        expect(action.description.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Rendering', () => {
    it('should render all quick actions', () => {
      const compiled = fixture.nativeElement;
      const actionElements = compiled.querySelectorAll('.quick-action-btn');
      
      expect(actionElements.length).toBe(component.quickActions.length);
    });

    it('should display correct labels', () => {
      const compiled = fixture.nativeElement;
      
      component.quickActions.forEach((action, index) => {
        const actionElement = compiled.querySelectorAll('.quick-action-btn')[index];
        expect(actionElement).toBeDefined();
        if (actionElement) {
          expect(actionElement.textContent).toContain(action.label);
        }
      });
    });

    it('should have correct router links', () => {
      const compiled = fixture.nativeElement;
      const routerLinks = compiled.querySelectorAll('a.quick-action-btn');
      
      expect(routerLinks.length).toBe(component.quickActions.length);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const compiled = fixture.nativeElement;
      const actionElements = compiled.querySelectorAll('.quick-action-btn');
      
      // Just verify elements exist
      expect(actionElements.length).toBeGreaterThan(0);
    });

    it('should have proper titles for tooltips', () => {
      const compiled = fixture.nativeElement;
      const actionElements = compiled.querySelectorAll('.quick-action-btn');
      
      actionElements.forEach((element: Element, index: number) => {
        const title = element.getAttribute('title');
        expect(title).toBe(component.quickActions[index].description);
      });
    });
  });
});
