import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

export class TestHelper {
  static createMockService(serviceName: string, methods: string[]): jasmine.SpyObj<any> {
    return jasmine.createSpyObj(serviceName, methods);
  }

  static createMockActivatedRoute(paramValue: string | null = '1'): any {
    const mockParamMap = jasmine.createSpyObj('ParamMap', ['get']);
    mockParamMap.get.and.returnValue(paramValue);
    
    return {
      snapshot: { 
        paramMap: mockParamMap
      },
      paramMap: of(mockParamMap)
    };
  }

  static configureTestBedWithMocks(component: any, providers: any[] = []): void {
    TestBed.configureTestingModule({
      imports: [component, HttpClientTestingModule, RouterTestingModule],
      providers: providers
    });
  }

  static mockWindowMethods(): void {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
  }

  static createMockObservable(data: any) {
    return of(data);
  }

  static createMockErrorObservable(error: any) {
    return of(null).pipe(
      () => { throw error; }
    );
  }
}
