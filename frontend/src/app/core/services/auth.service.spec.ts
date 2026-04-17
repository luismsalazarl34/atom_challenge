import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse = {
    user: { id: '1', email: 'test@example.com' },
    token: 'mock-jwt-token',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated returns false when no token', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('findUser calls GET /users with email param and saves session', () => {
    service.findUser('test@example.com').subscribe((res) => {
      expect(res).toEqual(mockAuthResponse);
    });

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/users` && r.params.get('email') === 'test@example.com',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockAuthResponse);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.email).toBe('test@example.com');
  });

  it('createUser calls POST /users and saves session', () => {
    service.createUser('new@example.com').subscribe((res) => {
      expect(res.user.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'new@example.com' });
    req.flush(mockAuthResponse);
  });

  it('logout clears session', () => {
    localStorage.setItem('auth_token', 'token');
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });
});
