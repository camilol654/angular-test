import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';
import { ListComponent } from './list.component';
import { ProcutsService } from '../../../services/procuts.service';
import { Product } from '../../../interfaces/product.interface';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let productsService: jasmine.SpyObj<ProcutsService>;
  let loadingSubject: BehaviorSubject<boolean>;
  let errorSubject: BehaviorSubject<string | null>;

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

  beforeEach(async () => {
    loadingSubject = new BehaviorSubject<boolean>(false);
    errorSubject = new BehaviorSubject<string | null>(null);
    
    const productsServiceSpy = jasmine.createSpyObj('ProcutsService', [
      'getProducts', 'searchProducts', 'deleteProduct', 'refreshProducts', 'clearError'
    ], {
      loading$: loadingSubject.asObservable(),
      error$: errorSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ListComponent, RouterTestingModule],
      providers: [
        { provide: ProcutsService, useValue: productsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    productsService = TestBed.inject(ProcutsService) as jasmine.SpyObj<ProcutsService>;
  });

  beforeEach(() => {
    // Set up the service mocks properly
    productsService.getProducts.and.returnValue(of([mockProduct]));
    loadingSubject.next(false);
    errorSubject.next(null);
    productsService.searchProducts.and.returnValue([mockProduct]);
    productsService.deleteProduct.and.returnValue(of(true));
    productsService.refreshProducts.and.returnValue();
    productsService.clearError.and.returnValue();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load products on init', () => {
      component.ngOnInit();
      
      expect(productsService.getProducts).toHaveBeenCalled();
      expect(component.products).toEqual([mockProduct]);
      expect(component.filteredProducts).toEqual([mockProduct]);
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
      component.products = [mockProduct];
      component.filteredProducts = [mockProduct];
    });

    it('should search products when query is provided', () => {
      const searchResults = [mockProduct];
      productsService.searchProducts.and.returnValue(searchResults);
      component.searchQuery = 'Producto';
      
      component.onSearch();
      
      expect(productsService.searchProducts).toHaveBeenCalledWith('Producto');
      expect(component.filteredProducts).toEqual(searchResults);
    });

    it('should show all products when query is empty', () => {
      component.searchQuery = '';
      
      component.onSearch();
      
      expect(component.filteredProducts).toEqual(component.products);
      expect(productsService.searchProducts).not.toHaveBeenCalled();
    });

    it('should show all products when query is only whitespace', () => {
      component.searchQuery = '   ';
      
      component.onSearch();
      
      expect(component.filteredProducts).toEqual(component.products);
      expect(productsService.searchProducts).not.toHaveBeenCalled();
    });
  });

  describe('onClearSearch', () => {
    it('should clear search query and show all products', () => {
      component.searchQuery = 'test query';
      component.filteredProducts = [];
      
      component.onClearSearch();
      
      expect(component.searchQuery).toBe('');
      expect(component.filteredProducts).toEqual(component.products);
    });
  });

  describe('onDeleteProduct', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
    });

    it('should delete product when confirmed', () => {
      productsService.deleteProduct.and.returnValue(of(true));
      
      component.onDeleteProduct(1);
      
      expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar este producto?');
      expect(productsService.deleteProduct).toHaveBeenCalledWith(1);
    });

    it('should show success alert on successful deletion', () => {
      productsService.deleteProduct.and.returnValue(of(true));
      
      component.onDeleteProduct(1);
      
      expect(window.alert).toHaveBeenCalledWith('Producto eliminado exitosamente');
    });

    it('should not delete product when not confirmed', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.onDeleteProduct(1);
      
      expect(productsService.deleteProduct).not.toHaveBeenCalled();
    });
  });

  describe('onRefresh', () => {
    it('should refresh products', () => {
      component.onRefresh();
      
      expect(productsService.refreshProducts).toHaveBeenCalled();
    });
  });

  describe('onClearError', () => {
    it('should clear error', () => {
      component.onClearError();
      
      expect(productsService.clearError).toHaveBeenCalled();
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

    it('should handle invalid date gracefully', () => {
      const invalidDate = new Date('invalid');
      expect(() => component.formatDate(invalidDate)).toThrow();
    });
  });

  describe('getStockClass', () => {
    it('should return correct class for zero stock', () => {
      const stockClass = component.getStockClass(0);
      expect(stockClass).toBe('text-danger fw-bold');
    });

    it('should return correct class for low stock', () => {
      const stockClass = component.getStockClass(5);
      expect(stockClass).toBe('text-warning fw-bold');
    });

    it('should return correct class for high stock', () => {
      const stockClass = component.getStockClass(50);
      expect(stockClass).toBe('text-success');
    });
  });

  describe('Component Properties', () => {
    it('should initialize with default values', () => {
      expect(component.products).toEqual([]);
      expect(component.filteredProducts).toEqual([]);
      expect(component.searchQuery).toBe('');
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });
  });
});
