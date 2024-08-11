import { TestBed } from '@angular/core/testing';

import { core } from '@angular/compiler';
import { CoordinateService } from './coordinate-service.service';

describe('CoordinateServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoordinateService = TestBed.get(CoordinateService);
    expect(service).toBeTruthy();
  });
});
