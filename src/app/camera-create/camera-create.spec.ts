import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraCreateComponent } from './camera-create';

describe('CameraCreate', () => {
  let component: CameraCreateComponent;
  let fixture: ComponentFixture<CameraCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
