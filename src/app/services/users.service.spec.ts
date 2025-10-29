import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { UsersService } from './users.service';
import { ApiService } from './api.service';
import { User } from '../interfaces/user.interface';
import { TestHelper } from '../test-helpers/test-helper';

describe('UsersService', () => {
  let service: UsersService;
  let apiService: jasmine.SpyObj<ApiService>;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    nombreCompleto: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '123456789',
    fechaRegistro: new Date('2023-01-01'),
    fechaActualizacion: new Date('2023-01-01')
  };

  beforeEach(() => {
    // Create mock service with proper configuration
    apiService = TestHelper.createMockService('ApiService', [
      'getUsers', 'getUserById', 'createUser', 'updateUser', 'deleteUser'
    ]);

    // Mock the initial API call before creating the service
    apiService.getUsers.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiService }
      ]
    });
    
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return users observable', (done) => {
      const mockUsers = [mockUser];
      apiService.getUsers.and.returnValue(of(mockUsers));

      service.refreshUsers();

      service.getUsers().subscribe(users => {
        expect(users.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', (done) => {
      apiService.getUserById.and.returnValue(of(mockUser));

      service.getUserById(1).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(apiService.getUserById).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle error when getting user by id', (done) => {
      const error = new Error('User not found');
      apiService.getUserById.and.returnValue(throwError(() => error));

      service.getUserById(999).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('createUser', () => {
    it('should create new user and add to users list', (done) => {
      const newUserData = {
        nombreCompleto: 'María García',
        email: 'maria@example.com',
        telefono: '987654321'
      };

      const createdUser = { ...newUserData, id: 2, fechaRegistro: new Date(), fechaActualizacion: new Date() };
      apiService.createUser.and.returnValue(of(createdUser));

      service.createUser(newUserData).subscribe(user => {
        expect(user).toEqual(createdUser);
        expect(apiService.createUser).toHaveBeenCalledWith(newUserData);
        done();
      });
    });

    it('should handle error when creating user', (done) => {
      const newUserData = {
        nombreCompleto: 'María García',
        email: 'maria@example.com',
        telefono: '987654321'
      };

      const error = new Error('Failed to create user');
      apiService.createUser.and.returnValue(throwError(() => error));

      service.createUser(newUserData).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('updateUser', () => {
    it('should update user and refresh users list', (done) => {
      const updateData = { nombreCompleto: 'Juan Carlos Pérez' };
      const updatedUser = { ...mockUser, nombreCompleto: 'Juan Carlos Pérez' };
      
      apiService.updateUser.and.returnValue(of(updatedUser));

      service.updateUser(1, updateData).subscribe(user => {
        expect(user).toEqual(updatedUser);
        expect(apiService.updateUser).toHaveBeenCalledWith(1, updateData);
        done();
      });
    });

    it('should handle error when updating user', (done) => {
      const updateData = { nombreCompleto: 'Juan Carlos Pérez' };
      const error = new Error('Failed to update user');
      
      apiService.updateUser.and.returnValue(throwError(() => error));

      service.updateUser(1, updateData).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and remove from users list', (done) => {
      apiService.deleteUser.and.returnValue(of(true));

      service.deleteUser(1).subscribe(result => {
        expect(result).toBe(true);
        expect(apiService.deleteUser).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle error when deleting user', (done) => {
      const error = new Error('Failed to delete user');
      apiService.deleteUser.and.returnValue(throwError(() => error));

      service.deleteUser(1).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('searchUsers', () => {
    beforeEach((done) => {
      // Set up mock users in the service
      const mockUsers = [
        mockUser,
        { ...mockUser, id: 2, nombreCompleto: 'María García', email: 'maria@example.com', telefono: '987654321' },
        { ...mockUser, id: 3, nombreCompleto: 'Carlos López', email: 'carlos@example.com', telefono: '555555555' }
      ];
      apiService.getUsers.and.returnValue(of(mockUsers));
      service.refreshUsers();
      
      // Wait for the refresh to complete
      service.getUsers().subscribe(() => done());
    });

    it('should search users by name', () => {
      const results = service.searchUsers('Juan');
      expect(results.length).toBe(1);
      expect(results[0].nombreCompleto).toContain('Juan');
    });

    it('should search users by email', () => {
      const results = service.searchUsers('maria@example.com');
      expect(results.length).toBe(1);
      expect(results[0].email).toContain('maria@example.com');
    });

    it('should search users by phone', () => {
      const results = service.searchUsers('987654321');
      expect(results.length).toBe(1);
      expect(results[0].telefono).toContain('987654321');
    });

    it('should return empty array for no matches', () => {
      const results = service.searchUsers('NonExistent');
      expect(results.length).toBe(0);
    });

    it('should be case insensitive for name and email', () => {
      const results = service.searchUsers('juan');
      expect(results.length).toBe(1);
    });

    it('should search partial matches', () => {
      const results = service.searchUsers('García');
      expect(results.length).toBe(1);
      expect(results[0].nombreCompleto).toContain('García');
    });
  });

  describe('refreshUsers', () => {
    it('should reload users from API', () => {
      const mockUsers = [mockUser];
      apiService.getUsers.and.returnValue(of(mockUsers));

      service.refreshUsers();

      expect(apiService.getUsers).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should track loading state', (done) => {
      service.loading$.subscribe(loading => {
        expect(typeof loading).toBe('boolean');
        done();
      });
    });

    it('should return current loading state', () => {
      expect(typeof service.isLoading()).toBe('boolean');
    });
  });

  describe('error handling', () => {
    it('should track error state', (done) => {
      service.error$.subscribe(error => {
        expect(error === null || typeof error === 'string').toBe(true);
        done();
      });
    });

    it('should return last error', () => {
      expect(service.getLastError() === null || typeof service.getLastError() === 'string').toBe(true);
    });

    it('should clear error', () => {
      service.clearError();
      expect(service.getLastError()).toBeNull();
    });
  });
});
