import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BuienradarApiResponse } from '@models/buienradar-api.model';

import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  const mockResponse = (override?: Partial<BuienradarApiResponse>): BuienradarApiResponse => {
    const base: BuienradarApiResponse = {
      buienradar: { copyright: 'c', terms: 't', version: '1' },
      actual: {
        actualradarurl: 'r',
        sunrise: 's',
        sunset: 's',
        stationmeasurements: [
          {
            stationid: 1,
            stationname: 'A',
            regio: 'R1',
            timestamp: new Date(2020, 0, 1),
            weatherdescription: 'wd',
            iconurl: 'iu',
            fullIconUrl: 'fi',
            graphUrl: 'gu',
            lat: 0 as any,
            lon: 0 as any,
            winddirection: 'N' as any,
            windazimuth: 0,
            windspeed: 1,
            temperature: 10,
            groundtemperature: 9,
            feeltemperature: 8,
            humidity: 50,
            airpressure: 1000,
            visibility: 10,
            windgusts: 2,
            precipitation: 0,
            radiation: 0,
            sunpower: 0,
            rainFallLast24Hour: 0,
            rainFallLastHour: 0,
            windspeedBft: 1,
            measured: true,
          },
          {
            stationid: 2,
            stationname: 'B',
            regio: 'R2',
            timestamp: new Date(2020, 0, 2),
            weatherdescription: 'wd2',
            iconurl: 'iu2',
            fullIconUrl: 'fi2',
            graphUrl: 'gu2',
            lat: 1 as any,
            lon: 1 as any,
            winddirection: 'S' as any,
            windazimuth: 180,
            windspeed: 3,
            temperature: 12,
            groundtemperature: 11,
            feeltemperature: 10,
            humidity: 60,
            airpressure: 1005,
            visibility: 9,
            windgusts: 4,
            precipitation: 1,
            radiation: 1,
            sunpower: 1,
            rainFallLast24Hour: 1,
            rainFallLastHour: 1,
            windspeedBft: 2,
            measured: true,
          },
        ],
      },
      forecast: {
        weatherreport: {
          published: new Date(2020, 0, 1),
          title: 't',
          summary: 's',
          text: 'x',
          author: 'a',
          authorbio: 'b',
        },
        fivedayforecast: [
          {
            day: new Date(2020, 0, 1),
            mintemperature: '5',
            maxtemperature: '11',
            mintemperatureMax: 6,
            mintemperatureMin: 4,
            maxtemperatureMax: 13,
            maxtemperatureMin: 10,
            rainChance: 20,
            sunChance: 50,
            windDirection: 'N' as any,
            wind: 3,
            mmRainMin: 0,
            mmRainMax: 2,
            weatherdescription: 'sunny',
            iconurl: 'i1',
            fullIconUrl: 'fi1',
          },
          {
            day: new Date(2020, 0, 2),
            mintemperature: '6',
            maxtemperature: '12',
            mintemperatureMax: 7,
            mintemperatureMin: 5,
            maxtemperatureMax: 14,
            maxtemperatureMin: 11,
            rainChance: 30,
            sunChance: 40,
            windDirection: 'E' as any,
            wind: 4,
            mmRainMin: 1,
            mmRainMax: 3,
            weatherdescription: 'cloudy',
            iconurl: 'i2',
            fullIconUrl: 'fi2',
          },
          {
            day: new Date(2020, 0, 3),
            mintemperature: '7',
            maxtemperature: '13',
            mintemperatureMax: 8,
            mintemperatureMin: 6,
            maxtemperatureMax: 15,
            maxtemperatureMin: 12,
            rainChance: 40,
            sunChance: 30,
            windDirection: 'W' as any,
            wind: 5,
            mmRainMin: 2,
            mmRainMax: 4,
            weatherdescription: 'rain',
            iconurl: 'i3',
            fullIconUrl: 'fi3',
          },
        ],
      },
    };
    return { ...base, ...override };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [WeatherService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('stations$ emits [] initially', async () => {
    const value = await firstValueFrom(service.stations$);
    expect(value).toEqual([]);
  });

  it('forecast$ emits [] initially', async () => {
    const value = await firstValueFrom(service.forecast$);
    expect(value).toEqual([]);
  });

  it('getWeatherData returns data and updates internal subjects', async () => {
    const promise = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    expect(req.request.method).toBe('GET');

    const data = mockResponse();
    req.flush(data);

    const result = await promise;
    expect(result).toEqual(data);

    const stations = await firstValueFrom(service.stations$.pipe(take(1)));
    expect(stations.length).toBe(2);
  });

  it('getWeatherData retries and then errors, setting error$', fakeAsync(async () => {
    const spyMsg = spyOn<any>(service as any, 'getErrorMessage').and.returnValue('ERR');
    const errorSpy = jasmine.createSpy('error');
    service.getWeatherData().subscribe({ error: errorSpy });

    for (let i = 0; i < 4; i++) {
      const req = httpMock.expectOne(() => true);
      expect(req.request.method).toBe('GET');
      req.flush('x', { status: 500, statusText: 'Server Error' });
      tick(500);
    }

    expect(spyMsg).toHaveBeenCalled();
    const lastError = await firstValueFrom(service.error$.pipe(take(1)));
    expect(lastError).toBe('ERR');
    expect(errorSpy).toHaveBeenCalled();
  }));

  it('getStationDataById returns station when present and null otherwise', async () => {
    const p = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockResponse());
    await p;
    const s1 = service.getStationDataById(2);
    expect(s1?.stationname).toBe('B');
    const s2 = service.getStationDataById(999);
    expect(s2).toBeNull();
  });

  it('get3LettersDayforecast emits 3-letter weekdays', async () => {
    const p = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockResponse());
    await p;
    const days = await firstValueFrom(service.get3LettersDayforecast().pipe(take(1)));
    expect(days.length).toBe(3);
    expect(days.every((day) => typeof day === 'string' && day.length >= 3)).toBeTrue();
  });

  it('getMaxTemperatureForecast emits numbers', async () => {
    const p = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockResponse());
    await p;
    const vals = await firstValueFrom(service.getMaxTemperatureForecast().pipe(take(1)));
    expect(vals).toEqual([13, 14, 15]);
  });

  it('getMinTemperatureForecast emits numbers', async () => {
    const response = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockResponse());
    await response;
    const vals = await firstValueFrom(service.getMinTemperatureForecast().pipe(take(1)));
    expect(vals).toEqual([4, 5, 6]);
  });

  it('getRainChanceForecast emits numbers', async () => {
    const response = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockResponse());
    await response;
    const vals = await firstValueFrom(service.getRainChanceForecast().pipe(take(1)));
    expect(vals).toEqual([20, 30, 40]);
  });
});
