import { Component, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service.service';
import { ApiserviceService } from '../apiservice.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map: Map;
  private vectorSource: VectorSource;
  private osmLayer: TileLayer;
  private googleLayer: TileLayer;
  private vectorLayer: VectorLayer;
  private isAdmin: boolean = false;

  constructor(private http: HttpClient, private authService: AuthService, private apiService: ApiserviceService) {}

  ngOnInit(): void {
    this.checkAdminStatus();
    this.initializeMap();
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadCoordinates();
  }

  private initializeMap(): void {
    this.vectorSource = new VectorSource();

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.osmLayer = new TileLayer({
      source: new OSM(),
      visible: true
    });

    this.googleLayer = new TileLayer({
      source: new XYZ({
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        attributions: '© Google'
      }),
      visible: false
    });

    this.map = new Map({
      target: 'map',
      layers: [
        this.osmLayer,
        this.googleLayer,
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([35.2, 39.0]),
        zoom: 6
      })
    });

    this.setupZoomControls();
    this.setupMapSwitcher();
  }

  private loadCoordinates(): void {
    if (this.isAdmin) {
      this.apiService.getAllTasinmazlar().subscribe(data => {
        this.addFeaturesToMap(data);
      }, error => {
        console.error('Error fetching all coordinates:', error);
      });
    } else {
      const userId = this.authService.getUserId();
      if (userId) {
        this.apiService.getTasinmazByUserId(userId).subscribe(data => {
          this.addFeaturesToMap(data);
        }, error => {
          console.error('Error fetching user coordinates:', error);
        });
      } else {
        console.error('User ID not found');
      }
    }
  }

  private addFeaturesToMap(data: any[]): void {
    data.forEach(item => {
      if (item.coordinateInformation) {
        const [longitude, latitude] = item.coordinateInformation.split(',').map(coord => parseFloat(coord.trim()));

        if (!isNaN(longitude) && !isNaN(latitude)) {
          const coordinates = fromLonLat([longitude, latitude]);

          const feature = new Feature({
            geometry: new Point(coordinates)
          });

          feature.setStyle(new Style({
            image: new Icon({
              anchor: [0.5, 1],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
            })
          }));

          this.vectorSource.addFeature(feature);
        } else {
          console.error('Invalid coordinates format:', item.coordinateInformation);
        }
      } else {
        console.error('No coordinates found for item:', item);
      }
    });

    if (this.vectorSource.getFeatures().length > 0) {
      this.map.getView().fit(this.vectorSource.getExtent(), { padding: [50, 50, 50, 50] });
    } else {
      console.warn('No features to fit on the map');
    }
  }

  onOpacityChange(event: any): void {
    const opacity = event.target.value / 100;
    // Set a minimum opacity value to avoid complete invisibility
    const minOpacity = 0.2; // Minimum opacity value (10%)
    this.osmLayer.setOpacity(Math.max(opacity, minOpacity));
    this.googleLayer.setOpacity(Math.max(opacity, minOpacity));
  }

  private setupZoomControls(): void {
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');

    if (zoomInButton && zoomOutButton) {
      zoomInButton.addEventListener('click', () => {
        const view = this.map.getView();
        view.setZoom(view.getZoom() + 1);
      });

      zoomOutButton.addEventListener('click', () => {
        const view = this.map.getView();
        view.setZoom(view.getZoom() - 1);
      });
    }
  }

  private setupMapSwitcher(): void {
    const osmButton = document.getElementById('osm-button');
    const googleButton = document.getElementById('google-button');

    if (osmButton && googleButton) {
      osmButton.addEventListener('click', () => {
        this.showOSM();
      });

      googleButton.addEventListener('click', () => {
        this.showGoogleMaps();
      });
    }
  }

  private showOSM(): void {
    this.osmLayer.setVisible(true);
    this.googleLayer.setVisible(false);
  }

  private showGoogleMaps(): void {
    this.osmLayer.setVisible(false);
    this.googleLayer.setVisible(true);
  }
}
