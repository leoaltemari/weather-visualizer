import { inject, Injectable } from '@angular/core';

import { DEFAULT_MAP_OPTIONS, FOCUS_MAP_ZOOM, MAX_MAP_ZOOM } from '@constants/map.constant';
import { Station } from '@models/buienradar-api.model';
import { MapOptions, Position } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';
import {
  getColorByVisualizationType,
  getStationValue,
  getStationValueWithUnit,
} from '@utils/weather.util';

import * as Leaflet from 'leaflet';

import { MapControlService } from './map-control.service';

@Injectable()
export class MapService {
  private readonly mapControlService = inject(MapControlService);

  private readonly tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private readonly tileLayerAttribution = `© OpenStreetMap contributors`;

  private map!: Leaflet.Map;
  private markers: Leaflet.LayerGroup = Leaflet.layerGroup();

  public createMap(options: MapOptions = DEFAULT_MAP_OPTIONS): void {
    this.map = Leaflet.map('map').setView(options.center, options.zoom);

    Leaflet.tileLayer(this.tileLayerUrl, {
      attribution: this.tileLayerAttribution,
      maxZoom: MAX_MAP_ZOOM,
    }).addTo(this.map);
  }

  public updateMarkers(stations: Station[], visualizationType: VisualizationType): void {
    this.markers.clearLayers();

    stations.forEach((station) => {
      const valueWithUnit = getStationValueWithUnit(visualizationType, station);
      const value = getStationValue(visualizationType, station);
      const color = getColorByVisualizationType(visualizationType, value);

      const popupHTML = this.getPopupContent(station);

      const marker = Leaflet.marker([station.lat, station.lon], {
        icon: this.getMarkerOptions(station.fullIconUrl, color, value ? valueWithUnit : 'N/A'),
      })
        .bindPopup(popupHTML)
        .on('click', () => {
          this.mapControlService.setSelectedStation(station);
          this.flyTo([station.lat, station.lon], FOCUS_MAP_ZOOM);
        });

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

  private getPopupContent(station: Station): string {
    return `
      <span class="font-bold">${station.stationname}</span>

      <div class="flex flex-col mt-2">
        <span>Temperature: <strong>${station.temperature ?? '--'} °C</strong></span>
        <span>Humidity: <strong>${station.humidity ?? '--'} %</strong></span>
        <span>Wind Speed: <strong>${station.windspeed ?? '--'} km/h</strong></span>
        <span>Rainfall (1h): <strong>${station.rainFallLastHour ?? '--'} mm</strong></span>
        <span>Rainfall (24h): <strong>${station.rainFallLast24Hour ?? '--'} mm</strong></span>
      </div>
    `;
  }

  private getMarkerOptions(iconUrl: string, color: string, value: string | number | null) {
    return Leaflet.divIcon({
      className: '',
      html: `
        <div class="flex flex-col items-center">
          <img src="${iconUrl}" alt="Station Icon" style="width: 50px !important" />

          <div class="flex items-center justify-center -mt-2">
            <div class="w-3 h-3 rounded-full border border-grey-600" style="background-color: ${color}"></div>
            <p class="text-center font-bold text-xs ml-1">${value}</p>
          </div>
        </div>
      `,
      iconSize: [100, 60],
    });
  }
}
