import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraListComponent } from './camera-list';

describe('CameraListComponent', () => {
  let component: CameraListComponent;
  let fixture: ComponentFixture<CameraListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
