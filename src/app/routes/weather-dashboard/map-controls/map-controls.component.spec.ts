import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FOCUS_MAP_ZOOM } from '@constants/map.constant';
import { Station } from '@models/buienradar-api.model';
import { VisualizationType } from '@models/weather.model';
import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { MapControlsComponent } from './map-controls.component';

class WeatherServiceMock {
  stations$ = new BehaviorSubject<Station[]>([]);
  getWeatherData = jasmine
    .createSpy('getWeatherData')
    .and.returnValue(of({}) as Observable<unknown>);
  getStationDataById = jasmine
    .createSpy('getStationDataById')
    .and.callFake(
      (id: number): Station | null => this.stations$.value.find((s) => s.stationid === id) ?? null,
    );
}

class MapControlServiceMock {
  selectedStation$ = new BehaviorSubject<Station | null>(null);
  visualizationType$ = new BehaviorSubject<VisualizationType>(VisualizationType.temperature);
  heatmapEnabled$ = new BehaviorSubject<boolean>(false);

  setSelectedStation = jasmine
    .createSpy('setSelectedStation')
    .and.callFake((station: Station | null) => this.selectedStation$.next(station));
  setVisualizationType = jasmine
    .createSpy('setVisualizationType')
    .and.callFake((type: VisualizationType) => this.visualizationType$.next(type));
  setHeatmapEnabled = jasmine
    .createSpy('setHeatmapEnabled')
    .and.callFake((enabled: boolean) => this.heatmapEnabled$.next(enabled));
}

describe('MapControlsComponent', () => {
  let fixture: ComponentFixture<MapControlsComponent>;
  let component: MapControlsComponent;

  let weatherServiceMock: WeatherServiceMock;
  let mapControlServiceMock: MapControlServiceMock;
  let mapServiceMock: jasmine.SpyObj<MapService>;

  const createSelectEvent = (value: string): Event => ({ target: { value } }) as unknown as Event;
  const createToggleEvent = (checked: boolean): Event =>
    ({ target: { checked } }) as unknown as Event;

  beforeEach(async () => {
    weatherServiceMock = new WeatherServiceMock();
    mapControlServiceMock = new MapControlServiceMock();
    mapServiceMock = jasmine.createSpyObj<MapService>('MapService', [
      'flyTo',
      'openPopupAt',
      'resetMap',
      'updateMarkers',
      'updateHeatmap',
    ]);

    await TestBed.configureTestingModule({
      imports: [MapControlsComponent],
      providers: [
        { provide: WeatherService, useValue: weatherServiceMock },
        { provide: MapControlService, useValue: mapControlServiceMock },
        { provide: MapService, useValue: mapServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset map when selecting a station that does not exist', () => {
    const nonExistingId = '999';
    weatherServiceMock.stations$.next([]);
    component.onStationSelect(createSelectEvent(nonExistingId));
    expect(mapControlServiceMock.setSelectedStation).toHaveBeenCalledWith(null);
    expect(mapServiceMock.resetMap).toHaveBeenCalled();
    expect(mapServiceMock.flyTo).not.toHaveBeenCalled();
    expect(mapServiceMock.openPopupAt).not.toHaveBeenCalled();
  });

  it('should focus and open popup when selecting an existing station and heatmap is disabled', () => {
    const station: Station = {
      stationid: 1,
      lat: 10,
      lon: 20,
      stationname: 'Station A',
    } as Station;
    weatherServiceMock.stations$.next([station]);
    mapControlServiceMock.heatmapEnabled$.next(false);

    component.onStationSelect(createSelectEvent('1'));

    expect(mapControlServiceMock.setSelectedStation).toHaveBeenCalledWith(station);
    expect(mapServiceMock.flyTo).toHaveBeenCalledWith([station.lat, station.lon], FOCUS_MAP_ZOOM);
    expect(mapServiceMock.openPopupAt).toHaveBeenCalledWith([station.lat, station.lon]);
  });

  it('should not change map view when selecting an existing station and heatmap is enabled', () => {
    const station: Station = {
      stationid: 2,
      lat: 30,
      lon: 40,
      stationname: 'Station B',
    } as Station;
    weatherServiceMock.stations$.next([station]);
    mapControlServiceMock.heatmapEnabled$.next(true);

    component.onStationSelect(createSelectEvent('2'));

    expect(mapControlServiceMock.setSelectedStation).toHaveBeenCalledWith(station);
    expect(mapServiceMock.flyTo).not.toHaveBeenCalled();
    expect(mapServiceMock.openPopupAt).not.toHaveBeenCalled();
  });

  it('should change visualization type and update markers', () => {
    const stations: Station[] = [
      { stationid: 3, lat: 50, lon: 60 } as Station,
      { stationid: 4, lat: 70, lon: 80 } as Station,
    ];
    weatherServiceMock.stations$.next(stations);
    mapControlServiceMock.heatmapEnabled$.next(false);

    component.onVisualizationTypeSelect(createSelectEvent(VisualizationType.wind));

    expect(mapControlServiceMock.setVisualizationType).toHaveBeenCalledWith(VisualizationType.wind);
    expect(mapServiceMock.updateMarkers).toHaveBeenCalledWith(stations, VisualizationType.wind);
  });

  it('should enable heatmap, reset map, and update heatmap', () => {
    const stations: Station[] = [{ stationid: 5, lat: 1, lon: 2 } as Station];
    weatherServiceMock.stations$.next(stations);
    mapControlServiceMock.visualizationType$.next(VisualizationType.pressure);

    component.onHeatmapToggle(createToggleEvent(true));

    expect(mapControlServiceMock.setHeatmapEnabled).toHaveBeenCalledWith(true);
    expect(mapServiceMock.resetMap).toHaveBeenCalled();
    expect(mapServiceMock.updateHeatmap).toHaveBeenCalledWith(stations, VisualizationType.pressure);
  });

  it('should disable heatmap, reset map, and update markers', () => {
    const stations: Station[] = [{ stationid: 6, lat: 3, lon: 4 } as Station];
    weatherServiceMock.stations$.next(stations);
    mapControlServiceMock.visualizationType$.next(VisualizationType.temperature);
    mapControlServiceMock.heatmapEnabled$.next(true);

    component.onHeatmapToggle(createToggleEvent(false));

    expect(mapControlServiceMock.setHeatmapEnabled).toHaveBeenCalledWith(false);
    expect(mapServiceMock.resetMap).toHaveBeenCalled();
    expect(mapServiceMock.updateMarkers).toHaveBeenCalledWith(
      stations,
      VisualizationType.temperature,
    );
  });

  it('should reset controls to defaults and update markers', () => {
    const stations: Station[] = [{ stationid: 7, lat: 9, lon: 8 } as Station];
    weatherServiceMock.stations$.next(stations);
    mapControlServiceMock.visualizationType$.next(VisualizationType.wind);
    mapControlServiceMock.heatmapEnabled$.next(true);
    mapControlServiceMock.selectedStation$.next(stations[0]);

    component.onReset();

    expect(mapControlServiceMock.setSelectedStation).toHaveBeenCalledWith(null);
    expect(mapControlServiceMock.setVisualizationType).toHaveBeenCalledWith(
      VisualizationType.temperature,
    );
    expect(mapControlServiceMock.setHeatmapEnabled).toHaveBeenCalledWith(false);
    expect(mapServiceMock.resetMap).toHaveBeenCalled();
    expect(mapServiceMock.updateMarkers).toHaveBeenCalledWith(
      stations,
      VisualizationType.temperature,
    );
  });

  it('should not refresh when already refreshing', () => {
    component.isRefreshing.set(true);
    component.onRefresh();
    expect(weatherServiceMock.getWeatherData).not.toHaveBeenCalled();
  });

  it('should refresh data, update map, and toggle refreshing state', fakeAsync(() => {
    const stations: Station[] = [{ stationid: 8, lat: 11, lon: 12 } as Station];
    weatherServiceMock.stations$.next(stations);
    mapControlServiceMock.heatmapEnabled$.next(false);
    mapControlServiceMock.visualizationType$.next(VisualizationType.temperature);

    component.onRefresh();

    expect(component.isRefreshing()).toBeTrue();
    expect(weatherServiceMock.getWeatherData).toHaveBeenCalled();
    expect(mapServiceMock.updateMarkers).toHaveBeenCalledWith(
      stations,
      VisualizationType.temperature,
    );

    tick(1000);
    expect(component.isRefreshing()).toBeFalse();
  }));
});
