import { TestBed } from '@angular/core/testing';

import { Camera } from './camera';

describe('Camera', () => {
  let service: Camera;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Camera);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
