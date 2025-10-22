import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';

import { TokenInterceptor } from './token-interceptor';

describe('TokenInterceptor', () => {
  let interceptor: TokenInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TokenInterceptor,
        { provide: 'AuthService', useValue: { getToken: () => 'test-token' } }
      ]
    });
    interceptor = TestBed.inject(TokenInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});