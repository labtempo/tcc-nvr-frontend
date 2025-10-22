import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraViewComponent } from './camera-view';

describe('CameraViewComponent', () => {
  let component: CameraViewComponent;
  let fixture: ComponentFixture<CameraViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraViewComponent]
      // Você precisará mockar ActivatedRoute, Router, CameraService, etc.
      // Mas para o boilerplate inicial, isso é o padrão.
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});