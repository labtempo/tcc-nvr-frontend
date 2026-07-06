import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { CameraViewComponent } from './camera-view';
import { CameraService } from '../camera';
import { ToastService } from '../shared/toast/toast.service';

describe('CameraViewComponent', () => {
  let component: CameraViewComponent;
  let fixture: ComponentFixture<CameraViewComponent>;
  let mockCameraService: jasmine.SpyObj<CameraService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;

  const mockCamera = {
    id: 1,
    name: 'Camera Entrada',
    rtsp_url: 'rtsp://example.com/stream',
    is_recording: true,
    path_id: 'camera_entrada',
    path_id_low: 'camera_entrada_low',
    visualisation_url_hls: 'http://localhost:8555/camera_entrada/index.m3u8',
    visualisation_url_hls_low: 'http://localhost:8555/camera_entrada_low/index.m3u8'
  };

  beforeEach(async () => {
    mockCameraService = jasmine.createSpyObj('CameraService', ['getCameraById']);
    mockToastService = jasmine.createSpyObj('ToastService', ['error', 'show']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDomSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [CameraViewComponent],
      providers: [
        { provide: CameraService, useValue: mockCameraService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DomSanitizer, useValue: mockDomSanitizer },
        { provide: HttpClient, useValue: jasmine.createSpyObj('HttpClient', ['get']) }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CameraViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load camera data on init', () => {
      mockCameraService.getCameraById.and.returnValue(of(mockCamera));
      mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe-url' as any);

      fixture.detectChanges();

      expect(mockCameraService.getCameraById).toHaveBeenCalledWith(1);
      expect(component.camera).toEqual(mockCamera);
      expect(component.hasLowQuality).toBe(true);
      expect(component.isHighQuality).toBe(true);
    });

    it('should show error toast when camera fetch fails', () => {
      mockCameraService.getCameraById.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(mockToastService.error).toHaveBeenCalledWith('Erro ao buscar câmera no servidor.');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cameras']);
    });

    it('should handle missing path_id', () => {
      const cameraWithoutPath = { ...mockCamera, path_id: null };
      mockCameraService.getCameraById.and.returnValue(of(cameraWithoutPath as any));

      fixture.detectChanges();

      expect(mockToastService.error).toHaveBeenCalledWith(
        'Câmera sem configuração de caminho (path_id).'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cameras']);
    });

    it('should detect low quality availability', () => {
      mockCameraService.getCameraById.and.returnValue(of(mockCamera));
      mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe-url' as any);

      fixture.detectChanges();

      expect(component.hasLowQuality).toBe(true);
    });

    it('should detect when low quality is not available', () => {
      const cameraWithoutLowQuality = {
        ...mockCamera,
        path_id_low: null,
        visualisation_url_hls_low: null
      };
      mockCameraService.getCameraById.and.returnValue(of(cameraWithoutLowQuality as any));
      mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe-url' as any);

      fixture.detectChanges();

      expect(component.hasLowQuality).toBe(false);
    });
  });

  describe('loadQualityStream', () => {
    beforeEach(() => {
      component.camera = mockCamera;
      mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe-url' as any);
    });

    it('should load high quality stream', () => {
      component.isHighQuality = true;
      component.loadQualityStream();

      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        mockCamera.visualisation_url_hls
      );
      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(false);
    });

    it('should load low quality stream', () => {
      component.isHighQuality = false;
      component.loadQualityStream();

      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        mockCamera.visualisation_url_hls_low
      );
      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(false);
    });

    it('should not load if camera is not set', () => {
      component.camera = null;
      component.loadQualityStream();

      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    });
  });

  describe('toggleQuality', () => {
    beforeEach(() => {
      component.camera = mockCamera;
      component.hasLowQuality = true;
      mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe-url' as any);
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should toggle quality from high to low', () => {
      component.isHighQuality = true;
      component.toggleQuality();

      jasmine.clock().tick(300);

      expect(component.isHighQuality).toBe(false);
      expect(mockToastService.show).toHaveBeenCalledWith('Alternado para qualidade Baixa', 'info');
    });

    it('should toggle quality from low to high', () => {
      component.isHighQuality = false;
      component.toggleQuality();

      jasmine.clock().tick(300);

      expect(component.isHighQuality).toBe(true);
      expect(mockToastService.show).toHaveBeenCalledWith('Alternado para qualidade Alta', 'info');
    });

    it('should not toggle if low quality is not available', () => {
      component.hasLowQuality = false;
      const initialQuality = component.isHighQuality;

      component.toggleQuality();

      expect(component.isHighQuality).toBe(initialQuality);
    });

    it('should not toggle if currently switching', () => {
      component.isSwitching = true;
      const initialQuality = component.isHighQuality;

      component.toggleQuality();

      expect(component.isHighQuality).toBe(initialQuality);
      expect(mockToastService.show).not.toHaveBeenCalled();
    });

    it('should not toggle if loading', () => {
      component.isLoading = true;
      const initialQuality = component.isHighQuality;

      component.toggleQuality();

      expect(component.isHighQuality).toBe(initialQuality);
      expect(mockToastService.show).not.toHaveBeenCalled();
    });

    it('should set isSwitching flag during toggle', () => {
      component.toggleQuality();

      expect(component.isSwitching).toBe(true);

      jasmine.clock().tick(800);

      expect(component.isSwitching).toBe(false);
    });
  });

  describe('goBack', () => {
    it('should navigate to cameras list', () => {
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cameras']);
    });
  });

  describe('onIframeLoad', () => {
    it('should set isLoading to false', () => {
      component.isLoading = true;
      component.onIframeLoad();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('checkStreamState', () => {
    it('should set stream as available', () => {
      component.isLoading = true;
      component.hasError = true;

      component.checkStreamState();

      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(false);
    });
  });
});
