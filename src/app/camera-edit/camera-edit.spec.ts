import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraEditComponent } from './camera-edit';

describe('CameraEditComponent', () => {
  let component: CameraEditComponent;
  let fixture: ComponentFixture<CameraEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
