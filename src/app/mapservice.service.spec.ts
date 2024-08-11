import { TestBed } from '@angular/core/testing';
import { MapService } from './mapservice.service';


describe('MapserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapService = TestBed.get(MapService);
    expect(service).toBeTruthy();
  });
});
