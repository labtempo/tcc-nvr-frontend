import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraPlaybackComponent } from './camera-playback';

describe('CameraPlaybackComponent', () => {
  let component: CameraPlaybackComponent;
  let fixture: ComponentFixture<CameraPlaybackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraPlaybackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraPlaybackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
