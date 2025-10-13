import { Injectable } from '@angular/core';

import { DEFAULT_MAP_OPTIONS, MAX_MAP_ZOOM } from '@constants/map.constant';
import { TEMPERATURE_COLORS, WIND_COLORS } from '@constants/weather.constant';
import { Station } from '@models/buienradar-api.model';
import { MapOptions, Position } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';

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
      const value = this.getStationValue(visualizationType, station);
      const color = this.getColorByVisualizationType(visualizationType, value);
      const popupHTML = `
        <strong>${station.stationname}</strong><br>
        ${visualizationType}: ${value ?? 'N/A'}
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

  private getStationValue(type: VisualizationType, station: Station): number | null {
    const valueByType = {
      [VisualizationType.temperature]: station.temperature,
      [VisualizationType.wind]: station.windspeed,
      [VisualizationType.pressure]: station.airpressure,
    } as const;

    return valueByType[type] ?? null;
  }

  private getColorByVisualizationType(type: VisualizationType, value: number | null): string {
    const getTemperatureColor = (temperature: number | null): string => {
      if (!temperature && temperature !== 0) return TEMPERATURE_COLORS.NONE;
      if (temperature > 20) return TEMPERATURE_COLORS.HOT;
      if (temperature > 10) return TEMPERATURE_COLORS.MILD;
      return TEMPERATURE_COLORS.COLD;
    };

    const getWindColor = (wind: number | null): string => {
      if (!wind && wind !== 0) return WIND_COLORS.NONE;

      return wind > 10 ? WIND_COLORS.STRONG : WIND_COLORS.LIGHT;
    };

    switch (type) {
      case VisualizationType.temperature:
        return getTemperatureColor(value);
      case VisualizationType.wind:
        return getWindColor(value);
      case VisualizationType.pressure:
      default:
        return '#84cc16';
    }
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
