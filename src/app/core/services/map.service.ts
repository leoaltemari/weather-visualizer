import { Injectable } from '@angular/core';

import { DEFAULT_MAP_OPTIONS, MAX_MAP_ZOOM } from '@constants/map.constant';
import { Station } from '@models/buienradar-api.model';
import { MapOptions, Position } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';
import {
  getColorByVisualizationType,
  getStationValue,
  getStationValueWithUnit,
} from '@utils/weather.util';

import * as Leaflet from 'leaflet';

@Injectable()
export class MapService {
  private map!: Leaflet.Map;
  private markers: Leaflet.LayerGroup = Leaflet.layerGroup();

  public createMap(options: MapOptions = DEFAULT_MAP_OPTIONS): void {
    this.map = Leaflet.map('map').setView(options.center, options.zoom);

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: MAX_MAP_ZOOM,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  public updateMarkers(stations: Station[], visualizationType: VisualizationType): void {
    this.markers.clearLayers();

    stations.forEach((station) => {
      const valueWithUnit = getStationValueWithUnit(visualizationType, station);
      const value = getStationValue(visualizationType, station);
      const color = getColorByVisualizationType(visualizationType, value);

      const popupHTML = `
        <strong>${station.stationname}</strong><br>
        ${visualizationType}: ${valueWithUnit ?? 'N/A'}
      `;

      const marker = Leaflet.circleMarker(
        [station.lat, station.lon],
        this.getMarkerOptions(color),
      ).bindPopup(popupHTML);

      this.markers.addLayer(marker);
    });

    this.markers.addTo(this.map);
  }

  public flyTo(position: Position, zoom: number): void {
    this.map.flyTo(position, zoom);
  }

  public openPopupAt([lat, lon]: Position): void {
    this.map.closePopup();

    this.markers.eachLayer((layer) => {
      const marker = layer as Leaflet.CircleMarker;

      if (marker && typeof marker.getLatLng === 'function') {
        const pos = marker.getLatLng();

        if (pos.lat === lat && pos.lng === lon) {
          marker.openPopup();
        }
      }
    });
  }

  public resetMap(): void {
    this.map.closePopup();
    this.flyTo(
      [DEFAULT_MAP_OPTIONS.center[0], DEFAULT_MAP_OPTIONS.center[1]],
      DEFAULT_MAP_OPTIONS.zoom,
    );
  }

  private getMarkerOptions(color: string): Leaflet.CircleMarkerOptions {
    return {
      radius: 8,
      fillColor: color,
      color: '#000',
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.8,
    };
  }
}
