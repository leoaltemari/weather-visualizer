import { TestBed } from '@angular/core/testing';

import { Station } from '@models/buienradar-api.model';
import { VisualizationType } from '@models/weather.model';
import { WeatherService } from '@services/weather.service';

import { BehaviorSubject, firstValueFrom, take } from 'rxjs';

import { MapControlService } from './map-control.service';

class WeatherServiceMock {
  stationsSubject = new BehaviorSubject<Station[]>([]);
  stations$ = this.stationsSubject.asObservable();
}

describe('MapControlService', () => {
  let service: MapControlService;
  let weatherServiceMock: WeatherServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapControlService, { provide: WeatherService, useClass: WeatherServiceMock }],
    });
    service = TestBed.inject(MapControlService);
    weatherServiceMock = TestBed.inject(WeatherService) as unknown as WeatherServiceMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose default values for selected station, visualization and heatmap', async () => {
    const selectedStation = await firstValueFrom(service.selectedStation$.pipe(take(1)));
    const visualization = await firstValueFrom(service.visualizationType$.pipe(take(1)));
    const heatmap = await firstValueFrom(service.heatmapEnabled$.pipe(take(1)));

    expect(selectedStation).toBeNull();
    expect(visualization).toBe(VisualizationType.temperature);
    expect(heatmap).toBeFalse();
  });

  it('should update visualization type when setVisualizationType is called', async () => {
    service.setVisualizationType(VisualizationType.wind);
    const first = await firstValueFrom(service.visualizationType$.pipe(take(1)));
    expect(first).toBe(VisualizationType.wind);

    service.setVisualizationType(VisualizationType.pressure);
    const second = await firstValueFrom(service.visualizationType$.pipe(take(1)));
    expect(second).toBe(VisualizationType.pressure);
  });

  it('should toggle heatmapEnabled when setHeatmapEnabled is called', async () => {
    service.setHeatmapEnabled(true);
    const first = await firstValueFrom(service.heatmapEnabled$.pipe(take(1)));
    expect(first).toBeTrue();

    service.setHeatmapEnabled(false);
    const second = await firstValueFrom(service.heatmapEnabled$.pipe(take(1)));
    expect(second).toBeFalse();
  });

  it('should select station when it exists in stations list', async () => {
    const stationOne = { stationid: 1, stationname: 'One' } as unknown as Station;
    const stationTwo = { stationid: 2, stationname: 'Two' } as unknown as Station;

    weatherServiceMock.stationsSubject.next([stationOne, stationTwo]);
    service.setSelectedStation(stationTwo);

    const selected = await firstValueFrom(service.selectedStation$.pipe(take(1)));
    expect(selected).toEqual(stationTwo);
  });

  it('should return null when selected station does not exist in stations list', async () => {
    const stationExisting = { stationid: 3, stationname: 'Three' } as unknown as Station;
    weatherServiceMock.stationsSubject.next([stationExisting]);

    const nonExisting = { stationid: 99, stationname: 'Ninety Nine' } as unknown as Station;
    service.setSelectedStation(nonExisting);

    const selected = await firstValueFrom(service.selectedStation$.pipe(take(1)));
    expect(selected).toBeNull();
  });

  it('should update selected station when stations list changes after selection', async () => {
    const target = { stationid: 7, stationname: 'Target' } as unknown as Station;

    weatherServiceMock.stationsSubject.next([]);
    service.setSelectedStation(target);

    const initial = await firstValueFrom(service.selectedStation$.pipe(take(1)));
    expect(initial).toBeNull();

    weatherServiceMock.stationsSubject.next([target]);

    const updated = await firstValueFrom(service.selectedStation$.pipe(take(1)));
    expect(updated).toEqual(target);
  });

  it('should clear selected station when setSelectedStation is called with null', async () => {
    const station = { stationid: 11, stationname: 'Eleven' } as unknown as Station;
    weatherServiceMock.stationsSubject.next([station]);

    service.setSelectedStation(station);
    const beforeClear = await firstValueFrom(service.selectedStation$.pipe(take(1)));
    expect(beforeClear).toEqual(station);

    service.setSelectedStation(null);
    const afterClear = await firstValueFrom(service.selectedStation$.pipe(take(1)));
    expect(afterClear).toBeNull();
  });
});
