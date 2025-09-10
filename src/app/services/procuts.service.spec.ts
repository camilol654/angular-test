import { TestBed } from '@angular/core/testing';

import { ProcutsService } from './procuts.service';

describe('ProcutsService', () => {
  let service: ProcutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcutsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
