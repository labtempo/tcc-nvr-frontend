import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraList } from './camera-list';

describe('CameraList', () => {
  let component: CameraList;
  let fixture: ComponentFixture<CameraList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
