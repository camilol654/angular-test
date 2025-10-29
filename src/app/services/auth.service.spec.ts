import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const isAdmin = service.isAdmin();
      expect(isAdmin).toBe(true);
    });

    it('should consistently return admin status', () => {
      const firstCall = service.isAdmin();
      const secondCall = service.isAdmin();
      
      expect(firstCall).toBe(secondCall);
      expect(firstCall).toBe(true);
    });
  });

  describe('Service Behavior', () => {
    it('should be a singleton service', () => {
      const service1 = TestBed.inject(AuthService);
      const service2 = TestBed.inject(AuthService);
      
      expect(service1).toBe(service2);
    });

    it('should maintain state across calls', () => {
      // Call isAdmin multiple times
      service.isAdmin();
      service.isAdmin();
      const result = service.isAdmin();
      
      expect(result).toBe(true);
    });
  });
});
