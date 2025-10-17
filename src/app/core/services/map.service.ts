import { inject, Injectable } from '@angular/core';

import { DEFAULT_MAP_OPTIONS, FOCUS_MAP_ZOOM, MAX_MAP_ZOOM } from '@constants/map.constant';
import { Station } from '@models/buienradar-api.model';
import { HeatLayerOptions, HeatPoint, MapOptions, Position } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';
import { collectValidHeatmapSamples, createHeatMapPoints } from '@utils/map.utils';
import {
  getColorByVisualizationType,
  getStationValue,
  getStationValueWithUnit,
} from '@utils/weather.util';

import * as Leaflet from 'leaflet';
import 'leaflet.heat';

import { MapControlService } from './map-control.service';

@Injectable()
export class MapService {
  private readonly mapControlService = inject(MapControlService);

  private readonly tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private readonly tileLayerAttribution = `© OpenStreetMap contributors`;

  private map!: Leaflet.Map;

  /**
   * Layer group containing all station markers displayed on the map.
   * Manages the collection of markers and provides batch operations.
   */
  private markers: Leaflet.LayerGroup = Leaflet.layerGroup();

  /**
   * Reference to the currently active heatmap layer on the map.
   * Null when no heatmap is displayed.
   */
  private heatLayer: Leaflet.Layer | null = null;

  /** Stores the station id of the popup that is opened to not remove it from the map when data updates */
  private _openedPopupStationId: number | null = null;

  public createMap(options: MapOptions = DEFAULT_MAP_OPTIONS): void {
    this.map = Leaflet.map('map').setView(options.center, options.zoom);

    Leaflet.tileLayer(this.tileLayerUrl, {
      attribution: this.tileLayerAttribution,
      maxZoom: MAX_MAP_ZOOM,
    }).addTo(this.map);
  }

  public destroyMap(): void {
    this.map.remove();
  }

  public updateMarkers(stations: Station[], visualizationType: VisualizationType): void {
    this.clearMapContent();

    stations
      .filter((station) => this._openedPopupStationId !== station.stationid)
      .forEach((station) => {
        const valueWithUnit = getStationValueWithUnit(visualizationType, station);
        const value = getStationValue(visualizationType, station);
        const color = getColorByVisualizationType(visualizationType, value);

        const popupHTML = this.getPopupContent(station);

        const marker = Leaflet.marker([station.lat, station.lon], {
          icon: this.getMarkerOptions(station.fullIconUrl, color, value ? valueWithUnit : 'N/A'),
        })
          .bindPopup(popupHTML)
          .on('popupopen', () => this.onMarkerClick(station))
          .on('popupclose', () => (this._openedPopupStationId = null));

        // Tag the marker with station id so we can preserve it later
        (marker as any)._stationId = station.stationid;

        this.markers.addLayer(marker);
      });

    this.markers.addTo(this.map);
  }

  public updateHeatmap(stations: Station[], visualizationType: VisualizationType): void {
    this.clearMapContent();

    const samples = collectValidHeatmapSamples(stations, visualizationType);

    const points = createHeatMapPoints(samples);
    this.addHeatLayer(points);
  }

  /**
   * Animates the map view to fly to a specific position with a target zoom level.
   * Provides smooth transition animation between the current view and target position.
   *
   * @param position - Target coordinates [latitude, longitude]
   * @param zoom - Target zoom level for the map
   */
  public flyTo(position: Position, zoom: number): void {
    this.map.flyTo(position, zoom);
  }

  public openPopupAt([lat, lon]: Position): void {
    this.map.closePopup();

    this.markers.eachLayer((layer) => {
      if (!(layer instanceof Leaflet.Marker)) {
        return;
      }

      const position = layer.getLatLng();
      if (position.lat === lat && position.lng === lon) {
        layer.openPopup();
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

  private clearMapContent(): void {
    this.removeMarkersFromMap();

    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
      this.heatLayer = null;
    }
  }

  /** Remove all markers except the one with the opened popup (if any) */
  private removeMarkersFromMap(): void {
    const markersToRemove = this.markers
      .getLayers()
      .filter((layer) => (layer as any)._stationId !== this._openedPopupStationId);

    markersToRemove.forEach((layer) => this.markers.removeLayer(layer));
  }

  private onMarkerClick(station: Station): void {
    this.mapControlService.setSelectedStation(station);
    this._openedPopupStationId = station.stationid;
    this.flyTo([station.lat, station.lon], FOCUS_MAP_ZOOM);
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

  /**
   * Creates and adds a heatmap layer to the map using the provided heat points.
   * Configures the heatmap with predefined styling including radius, opacity, blur, and gradient colors.
   *
   * @param points - Array of heat points [latitude, longitude, intensity] to display on the heatmap
   */
  private addHeatLayer(points: HeatPoint[]): void {
    this.heatLayer = (
      Leaflet as unknown as {
        default: {
          heatLayer: (points: HeatPoint[], options?: HeatLayerOptions) => Leaflet.Layer;
        };
      }
    ).default
      .heatLayer(points, {
        radius: 30,
        minOpacity: 0.1,
        blur: 30,
        maxZoom: 3,
        gradient: {
          0.0: '#1d4ed888',
          0.5: '#22c55e88',
          1.0: '#ef444488',
        },
      })
      .addTo(this.map);
  }
}
