import { TestBed } from '@angular/core/testing';

import { Station } from '@models/buienradar-api.model';

import * as Leaflet from 'leaflet';

import { MapControlService } from './map-control.service';
import { MapService } from './map.service';

describe('MapService private methods', () => {
  let service: MapService;

  const mapControlMock = {
    setSelectedStation: jasmine.createSpy('setSelectedStation'),
  };

  const createStation = (overrides: Partial<Station> = {}): Station => ({
    stationid: 1,
    stationname: 'Test Station',
    regio: 'Test Region',
    timestamp: new Date(),
    weatherdescription: 'Clear',
    iconurl: 'http://example.com/icon.png',
    fullIconUrl: 'http://example.com/full-icon.png',
    graphUrl: 'http://example.com/graph.png',
    lat: 52.1,
    lon: 5.3,
    winddirection: 'n',
    windazimuth: 0,
    windspeed: 20,
    temperature: 12.3,
    groundtemperature: 11.2,
    feeltemperature: 10.1,
    humidity: 55,
    airpressure: 1012,
    visibility: 10,
    windgusts: 25,
    precipitation: 0,
    radiation: 0,
    sunpower: 0,
    rainFallLast24Hour: 2.5,
    rainFallLastHour: 0.2,
    windspeedBft: 3,
    measured: true,
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapService, { provide: MapControlService, useValue: mapControlMock }],
    });

    service = TestBed.inject(MapService);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  describe('getPopupContent', () => {
    it('should build the popup HTML with station values', () => {
      const station = createStation({
        stationname: 'Amsterdam',
        temperature: 18.5,
        humidity: 65,
        windspeed: 33,
        rainFallLastHour: 0.4,
        rainFallLast24Hour: 3.7,
      });

      const result = (service as any).getPopupContent(station) as string;

      expect(typeof result).toBe('string');
      expect(result).toContain('<span class="font-bold">Amsterdam</span>');
      expect(result).toContain('Temperature: <strong>18.5 °C</strong>');
      expect(result).toContain('Humidity: <strong>65 %</strong>');
      expect(result).toContain('Wind Speed: <strong>33 km/h</strong>');
      expect(result).toContain('Rainfall (1h): <strong>0.4 mm</strong>');
      expect(result).toContain('Rainfall (24h): <strong>3.7 mm</strong>');
    });

    it('should fallback to "--" for undefined values', () => {
      const stationWithMissingValues = createStation({
        temperature: undefined as unknown as number,
        humidity: undefined as unknown as number,
        windspeed: undefined as unknown as number,
        rainFallLastHour: undefined as unknown as number,
        rainFallLast24Hour: undefined as unknown as number,
      });

      const result = (service as any).getPopupContent(stationWithMissingValues) as string;

      expect(result).toContain('Temperature: <strong>-- °C</strong>');
      expect(result).toContain('Humidity: <strong>-- %</strong>');
      expect(result).toContain('Wind Speed: <strong>-- km/h</strong>');
      expect(result).toContain('Rainfall (1h): <strong>-- mm</strong>');
      expect(result).toContain('Rainfall (24h): <strong>-- mm</strong>');
    });
  });

  describe('getMarkerOptions', () => {
    it('should create a Leaflet DivIcon with provided values', () => {
      const iconUrl = 'http://example.com/marker.png';
      const color = '#ff0000';
      const displayValue = '42 km/h';

      const divIcon = (service as any).getMarkerOptions(
        iconUrl,
        color,
        displayValue,
      ) as Leaflet.DivIcon;

      expect(divIcon instanceof Leaflet.DivIcon).toBeTrue();

      const options = divIcon.options as Leaflet.DivIconOptions;
      expect(typeof options.html).toBe('string');

      const html = options.html as string;
      expect(html).toContain(`<img src="${iconUrl}"`);
      expect(html).toContain(`style="background-color: ${color}"`);
      expect(html).toContain(`class="text-center font-bold text-xs ml-1">${displayValue}</p>`);
      expect(html).toContain('style="width: 50px !important"');
    });

    it('should handle numeric values correctly in icon label', () => {
      const iconUrl = 'http://example.com/marker.png';
      const color = '#00ff00';
      const numericValue = 15;

      const divIcon = (service as any).getMarkerOptions(
        iconUrl,
        color,
        numericValue,
      ) as Leaflet.DivIcon;

      const html = (divIcon.options.html as string) || '';
      expect(html).toContain(`class="text-center font-bold text-xs ml-1">${numericValue}</p>`);
    });
  });
});
