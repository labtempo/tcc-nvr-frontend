import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraCreate } from './camera-create';

describe('CameraCreate', () => {
  let component: CameraCreate;
  let fixture: ComponentFixture<CameraCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
