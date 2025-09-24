import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraEdit } from './camera-edit';

describe('CameraEdit', () => {
  let component: CameraEdit;
  let fixture: ComponentFixture<CameraEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
