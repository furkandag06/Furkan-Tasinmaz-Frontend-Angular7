import { Component, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { Draw } from 'ol/interaction';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { MapService } from '../mapservice.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit {
  private map: Map | undefined;
  private vectorSource: VectorSource | undefined;
  private selectedFeatureType: string = 'marker';
  private drawInteraction: Draw | undefined;
  coordinates: string | undefined;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.initMap();
    this.setupFeatureSelection();
  }

  initMap(): void {
    this.vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([35.2433, 38.9637]), // Coordinates close to Turkey's center
        zoom: 6.5
      })
    });

    this.map.on('click', (event) => {
      if (this.selectedFeatureType === 'marker') {
        const coordinate = event.coordinate;
        const lonLatCoordinate = toLonLat(coordinate);

        // Update the coordinates display
        this.coordinates = `Lat: ${lonLatCoordinate[1].toFixed(6)}, Lon: ${lonLatCoordinate[0].toFixed(6)}`;

        console.log('Selected Coordinates:', this.coordinates);

        this.addMarker(coordinate);
        this.mapService.emitCoordinate(lonLatCoordinate);
      }
    });

    this.map.getView().on('change:resolution', () => this.updateZoomLevel());
  }

  private addMarker(coordinate: [number, number]): void {
    const element = document.createElement('div');
    element.className = 'fa fa-map-marker-alt';
    element.style.position = 'absolute';
    element.style.transform = 'translate(-50%, -100%)';
    element.style.color = 'red';
    element.style.fontSize = '24px';

    const overlay = new Overlay({
      element: element,
      positioning: 'center-center',
      stopEvent: false,
      offset: [0, 0]
    });

    if (this.map) {
      this.map.addOverlay(overlay);
      overlay.setPosition(coordinate);
    }
  }

  private setupFeatureSelection(): void {
    const inputs = document.querySelectorAll('input[name="featureType"]');
    inputs.forEach(input => {
      input.addEventListener('change', (event) => {
        this.selectedFeatureType = (event.target as HTMLInputElement).value;
        this.enableDrawInteraction(this.selectedFeatureType);
      });
    });
  }

  private enableDrawInteraction(type: string): void {
    if (this.map && this.vectorSource) {
      if (this.drawInteraction) {
        this.map.removeInteraction(this.drawInteraction);
      }

      if (type === 'circle' || type === 'line') {
        const geometryType = type === 'circle' ? 'Circle' : 'LineString';
        this.drawInteraction = new Draw({
          source: this.vectorSource,
          type: geometryType,
          style: new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 2
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.2)'
            }),
            image: new CircleStyle({
              radius: 5,
              fill: new Fill({
                color: 'blue'
              }),
              stroke: new Stroke({
                color: 'blue',
                width: 2
              })
            })
          })
        });

        this.drawInteraction.on('drawend', (event) => {
          const feature = event.feature;
          feature.setStyle(new Style({
            stroke: new Stroke({
              color: 'blue',
              width: 3
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.3)'
            }),
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({
                color: 'blue'
              }),
              stroke: new Stroke({
                color: 'blue',
                width: 2
              })
            })
          }));
        });

        this.map.addInteraction(this.drawInteraction);
      }
    }
  }

  private clearFeatures(): void {
    if (this.vectorSource) {
      this.vectorSource.clear();
    }
    if (this.map) {
      this.map.getOverlays().clear();
    }
  }

  zoomIn(): void {
    if (this.map) {
      const view = this.map.getView();
      view.setZoom(view.getZoom() + 1);
      this.updateZoomLevel();
    }
  }

  zoomOut(): void {
    if (this.map) {
      const view = this.map.getView();
      view.setZoom(view.getZoom() - 1);
      this.updateZoomLevel();
    }
  }

  private updateZoomLevel(): void {
    if (this.map) {
      const view = this.map.getView();
      const zoom = view.getZoom();
      // Update zoom level display (optional, if needed in the HTML template)
      const zoomLevelElement = document.querySelector('.zoom-level');
      if (zoomLevelElement) {
        zoomLevelElement.textContent = `Zoom Level: ${Math.round(zoom)}`;
      }
    }
  }
}
