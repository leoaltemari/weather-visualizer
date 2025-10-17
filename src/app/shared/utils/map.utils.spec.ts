import { Station } from '@models/buienradar-api.model';
import { HeatMapSample } from '@models/map.model';
import { VisualizationType } from '@models/weather.model';

import { collectValidHeatmapSamples, createHeatMapPoints } from './map.utils';

describe('map.utils', () => {
  describe('createHeatMapPoints', () => {
    it('returns empty array when no samples are provided', () => {
      expect(createHeatMapPoints([])).toEqual([]);
    });

    it('normalizes intensities between 0 and 1 using min/max', () => {
      const samples: HeatMapSample[] = [
        { lat: 10, lon: 20, value: 5 },
        { lat: 11, lon: 21, value: 10 },
        { lat: 12, lon: 22, value: 15 },
      ];
      const result = createHeatMapPoints(samples);
      expect(result.length).toBe(3);
      expect(result[0][0]).toBe(10);
      expect(result[0][1]).toBe(20);
      expect(result[0][2]).toBe(0);
      expect(result[2][0]).toBe(12);
      expect(result[2][1]).toBe(22);
      expect(result[2][2]).toBe(1);
      const mid = result[1][2];
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(1);
      expect(mid).toBeCloseTo(Math.pow(0.5, 0.7), 10);
    });

    it('handles all samples with identical values (denom fallback)', () => {
      const samples: HeatMapSample[] = [
        { lat: 1, lon: 2, value: 7 },
        { lat: 3, lon: 4, value: 7 },
      ];
      const result = createHeatMapPoints(samples);
      expect(result).toEqual([
        [1, 2, 0],
        [3, 4, 0],
      ]);
    });
  });

  describe('collectValidHeatmapSamples', () => {
    const base: Station = {
      stationid: 1,
      stationname: 's',
      regio: 'r',
      timestamp: new Date(),
      weatherdescription: '',
      iconurl: '',
      fullIconUrl: '',
      graphUrl: '',
      lat: 0,
      lon: 0,
      winddirection: 'n',
      windazimuth: 0,
      windspeed: 0,
      temperature: 0,
      groundtemperature: 0,
      feeltemperature: 0,
      humidity: 0,
      airpressure: 0,
      visibility: 0,
      windgusts: 0,
      precipitation: 0,
      radiation: 0,
      sunpower: 0,
      rainFallLast24Hour: 0,
      rainFallLastHour: 0,
      windspeedBft: 0,
      measured: true,
    };

    const makeStation = (overrides: Partial<Station>): Station => ({ ...base, ...overrides });

    it('maps stations and filters out falsy values (e.g., 0)', () => {
      const stations: Station[] = [
        makeStation({ stationid: 1, lat: 50.1, lon: 4.1, temperature: 0 }),
        makeStation({ stationid: 2, lat: 50.2, lon: 4.2, temperature: 5 }),
        makeStation({ stationid: 3, lat: 50.3, lon: 4.3, temperature: 10 }),
      ];
      const samples = collectValidHeatmapSamples(stations, VisualizationType.temperature);
      expect(samples.length).toBe(2);
      expect(samples).toEqual([
        { lat: 50.2, lon: 4.2, value: 5 },
        { lat: 50.3, lon: 4.3, value: 10 },
      ]);
    });

    it('works with other visualization types (wind)', () => {
      const stations: Station[] = [
        makeStation({ stationid: 4, lat: 60.1, lon: 5.1, windspeed: 0 }),
        makeStation({ stationid: 5, lat: 60.2, lon: 5.2, windspeed: 12 }),
      ];
      const samples = collectValidHeatmapSamples(stations, VisualizationType.wind);
      expect(samples).toEqual([{ lat: 60.2, lon: 5.2, value: 12 }]);
    });

    it('works with other visualization types (pressure)', () => {
      const stations: Station[] = [
        makeStation({ stationid: 6, lat: 70.1, lon: 6.1, airpressure: 0 }),
        makeStation({ stationid: 7, lat: 70.2, lon: 6.2, airpressure: 1012 }),
      ];
      const samples = collectValidHeatmapSamples(stations, VisualizationType.pressure);
      expect(samples).toEqual([{ lat: 70.2, lon: 6.2, value: 1012 }]);
    });
  });
});
