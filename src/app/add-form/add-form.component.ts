import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { Tasinmaz } from '../home/models/tasinmaz';
import { CoordinateService } from '../coordinate-service.service';
import { ApiserviceService } from '../apiservice.service';
import { AuthService } from '../auth-service.service';
import { LogService } from '../log.service'; // LogService'i ekleyin
import * as alertify from 'alertifyjs'; // Alertify.js'i import edin

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.css']
})
export class AddFormComponent implements OnInit, AfterViewInit {
  addForm: FormGroup;
  cities: any[] = [];
  districts: any[] = [];
  neighborhoods: any[] = [];
  propertyId: number = 1; // Replace with actual ID from backend
  map: Map;
  markerSource: VectorSource;
  markerLayer: VectorLayer;

  constructor(
    private apiService: ApiserviceService,
    private fb: FormBuilder,
    private coordinateService: CoordinateService,
    private router: Router,
    private authService: AuthService,
    private logService: LogService // LogService'i inject edin
  ) {
    this.addForm = this.fb.group({
      city: ['', Validators.required],
      district: ['', Validators.required],
      neighborhoodId: ['', Validators.required],
      island: [''],
      parcel: [''],
      quality: [''],
      coordinates: [''],
      userId: [''] // userId için başlangıç değeri
    });
  }

  ngOnInit(): void {
    this.loadCities();
    this.loadPropertyDetails();
    this.setUserId();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.markerSource = new VectorSource();
    this.markerLayer = new VectorLayer({
      source: this.markerSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
        })
      })
    });
  
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.markerLayer
      ],
      view: new View({
        center: fromLonLat([35.2433, 39.0730]), // Centering the map on Turkey
        zoom: 6.5 // Adjust zoom level as needed
      })
    });
  
    this.map.on('singleclick', (event) => {
      const coordinates = event.coordinate;
      this.addMarker(coordinates);
      const lonLat = toLonLat(coordinates);
      this.addForm.patchValue({
        coordinates: `${lonLat[0]}, ${lonLat[1]}`
      });
  
      this.coordinateService.setCoordinates(lonLat);
    });
  }

  addMarker(coordinates: [number, number]): void {
    this.markerSource.clear();
    const marker = new Feature({
      geometry: new Point(coordinates)
    });
    this.markerSource.addFeature(marker);
  }

  loadCities(): void {
    this.apiService.getCities().subscribe(
      data => {
        this.cities = data;
      },
      error => {
        console.error('Error loading cities:', error);
      }
    );
  }

  loadPropertyDetails(): void {
    if (this.propertyId) {
      this.apiService.getPropertyDetails(this.propertyId).subscribe(
        data => {
          this.populateForm(data);
        },
        error => {
          console.error('Error loading property details:', error);
        }
      );
    }
  }

  populateForm(data: any): void {
    this.addForm.patchValue({
      city: data.city,
      district: data.district,
      neighborhoodId: data.neighborhood,
      island: data.island,
      parcel: data.parcel,
      quality: data.quality,
      coordinates: data.coordinates,
      userId: data.userId
    });

    this.onCityChange(data.city);
    this.onDistrictChange(data.district);
  }

  setUserId(): void {
    const userId = this.authService.getUserId();
    this.addForm.patchValue({
      userId: userId
    });
  }

  onCityChange(cityId: number): void {
    if (cityId) {
      this.apiService.getDistricts(cityId).subscribe(
        data => {
          this.districts = data;
          this.addForm.patchValue({ district: '', neighborhoodId: '' });
          this.neighborhoods = [];
        },
        error => {
          console.error('Error loading districts:', error);
        }
      );
    }
  }

  onDistrictChange(districtId: number): void {
    if (districtId) {
      this.apiService.getNeighborhoods(districtId).subscribe(
        data => {
          this.neighborhoods = data;
          this.addForm.patchValue({ neighborhoodId: '' });
        },
        error => {
          console.error('Error loading neighborhoods:', error);
        }
      );
    }
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      const formData: Tasinmaz = new Tasinmaz(
        parseInt(this.addForm.value.neighborhoodId),
        parseInt(this.addForm.value.userId), // Include userId
        this.addForm.value.island,
        this.addForm.value.parcel,
        this.addForm.value.quality,
        this.addForm.value.coordinates
      );

      this.apiService.addData(formData).subscribe(
        response => {
          console.log('Form submitted successfully', response);
          this.router.navigate(['/home']).then(() => {
            alertify.success('Taşınmaz başarıyla eklendi.'); // Başarı mesajını göster
          });

          // Başarı logu
          this.logService.addLog(
            'Başarılı',
            'Taşınmaz Ekleme',
            `Taşınmaz başarıyla eklendi. Detaylar: ${JSON.stringify(formData)}`
          ).subscribe(
            () => console.log('Log kaydedildi.'),
            error => console.error('Log kaydedilirken hata oluştu:', error)
          );
        },
        error => {
          console.error('Error submitting form', error);
          alertify.error('Taşınmaz eklenirken bir hata oluştu.');

          // Hata logu
          this.logService.addLog(
            'Başarısız',
            'Taşınmaz Ekleme',
            `Taşınmaz eklenirken hata oluştu: ${error.message}`
          ).subscribe(
            () => console.log('Hata logu kaydedildi.'),
            error => console.error('Hata logu kaydedilirken hata oluştu:', error)
          );
        }
      );
    } else {
      this.addForm.markAsTouched();
    }
  }
}
