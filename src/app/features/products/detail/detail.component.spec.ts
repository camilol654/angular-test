import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DetailComponent } from './detail.component';
import { ProcutsService } from '../../../services/procuts.service';
import { Product } from '../../../interfaces/product.interface';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let productService: jasmine.SpyObj<ProcutsService>;
  let mockParamMapGet: jasmine.Spy;

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
    const productServiceSpy = jasmine.createSpyObj('ProcutsService', ['getProductById']);
    productServiceSpy.getProductById.and.returnValue(of(mockProduct));

    mockParamMapGet = jasmine.createSpy('get').and.returnValue('1');

    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: mockParamMapGet
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DetailComponent, RouterTestingModule],
      providers: [
        { provide: ProcutsService, useValue: productServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProcutsService) as jasmine.SpyObj<ProcutsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
