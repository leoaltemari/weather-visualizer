import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BuienradarApiResponse, BuienradarGraphQLResponse } from '@models/buienradar-api.model';

import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  const mockResponse = (override?: Partial<BuienradarApiResponse>): BuienradarApiResponse => {
    const base: BuienradarApiResponse = {
      actual: {
        stationmeasurements: [
          {
            stationid: 1,
            stationname: 'A',
            regio: 'R1',
            timestamp: new Date(2020, 0, 1),
            weatherdescription: 'wd',
            fullIconUrl: 'fi',
            lat: 0,
            lon: 0,
            windspeed: 1,
            temperature: 10,
            feeltemperature: 8,
            humidity: 50,
            airpressure: 1000,
            rainFallLast24Hour: 0,
            rainFallLastHour: 0,
          },
          {
            stationid: 2,
            stationname: 'B',
            regio: 'R2',
            timestamp: new Date(2020, 0, 2),
            weatherdescription: 'wd2',
            fullIconUrl: 'fi2',
            lat: 1,
            lon: 1,
            windspeed: 3,
            temperature: 12,
            feeltemperature: 10,
            humidity: 60,
            airpressure: 1005,
            rainFallLast24Hour: 1,
            rainFallLastHour: 1,
          },
        ],
      },
      forecast: {
        fivedayforecast: [
          {
            day: new Date(2020, 0, 1),
            mintemperatureMin: 4,
            maxtemperatureMax: 13,
            rainChance: 20,
            windDirection: 'n',
            wind: 3,
            fullIconUrl: 'fi1',
          },
          {
            day: new Date(2020, 0, 2),
            mintemperatureMin: 5,
            maxtemperatureMax: 14,
            rainChance: 30,
            windDirection: 'z',
            wind: 4,
            fullIconUrl: 'fi2',
          },
          {
            day: new Date(2020, 0, 3),
            mintemperatureMin: 6,
            maxtemperatureMax: 15,
            rainChance: 40,
            windDirection: 'w',
            wind: 5,
            fullIconUrl: 'fi3',
          },
        ],
      },
    };
    return { ...base, ...override };
  };

  const mockGraphQLResponse = (
    override?: Partial<BuienradarApiResponse>,
  ): BuienradarGraphQLResponse => {
    return {
      data: {
        weatherData: mockResponse(override),
      },
    };
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
    expect(req.request.method).toBe('POST');

    const data = mockGraphQLResponse();
    req.flush(data);

    const result = await promise;
    expect(result).toEqual(data.data.weatherData);

    const stations = await firstValueFrom(service.stations$.pipe(take(1)));
    expect(stations.length).toBe(2);
  });

  it('getWeatherData retries and then errors, setting error$', fakeAsync(async () => {
    const spyMsg = spyOn(
      service as unknown as { getErrorMessage: (status: number) => string },
      'getErrorMessage',
    ).and.returnValue('ERR');
    const errorSpy = jasmine.createSpy('error');
    service.getWeatherData().subscribe({ error: errorSpy });

    for (let i = 0; i < 4; i++) {
      const req = httpMock.expectOne(() => true);
      expect(req.request.method).toBe('POST');
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
    req.flush(mockGraphQLResponse());
    await p;
    const s1 = service.getStationDataById(2);
    expect(s1?.stationname).toBe('B');
    const s2 = service.getStationDataById(999);
    expect(s2).toBeNull();
  });

  it('get3LettersDayforecast emits 3-letter weekdays', async () => {
    const p = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockGraphQLResponse());
    await p;
    const days = await firstValueFrom(service.get3LettersDayforecast().pipe(take(1)));
    expect(days.length).toBe(3);
    expect(days.every((day) => typeof day === 'string' && day.length >= 3)).toBeTrue();
  });

  it('getMaxTemperatureForecast emits numbers', async () => {
    const p = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockGraphQLResponse());
    await p;
    const vals = await firstValueFrom(service.getMaxTemperatureForecast().pipe(take(1)));
    expect(vals).toEqual([13, 14, 15]);
  });

  it('getMinTemperatureForecast emits numbers', async () => {
    const response = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockGraphQLResponse());
    await response;
    const vals = await firstValueFrom(service.getMinTemperatureForecast().pipe(take(1)));
    expect(vals).toEqual([4, 5, 6]);
  });

  it('getRainChanceForecast emits numbers', async () => {
    const response = firstValueFrom(service.getWeatherData());
    const req = httpMock.expectOne(() => true);
    req.flush(mockGraphQLResponse());
    await response;
    const vals = await firstValueFrom(service.getRainChanceForecast().pipe(take(1)));
    expect(vals).toEqual([20, 30, 40]);
  });
});
