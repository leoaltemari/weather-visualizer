import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Station } from '@models/buienradar-api.model';
import { VisualizationType } from '@models/weather.model';
import { MapControlService } from '@services/map-control.service';
import { MapService } from '@services/map.service';
import { WeatherService } from '@services/weather.service';

import { BehaviorSubject } from 'rxjs';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>;
  let component: MapComponent;

  let mapServiceSpy: jasmine.SpyObj<MapService>;

  let stationsSubject: BehaviorSubject<Station[] | undefined>;
  let visualizationTypeSubject: BehaviorSubject<VisualizationType | undefined>;
  let heatmapEnabledSubject: BehaviorSubject<boolean | undefined>;

  const sampleStations: Station[] = [
    {
      stationid: 100,
      stationname: 'Sample Station',
      lat: 1,
      lon: 2,
      temperature: 10,
      humidity: 50,
      windspeed: 5,
      rainFallLastHour: 1,
      rainFallLast24Hour: 2,
      fullIconUrl: 'http://example.com/icon.png',
    } as unknown as Station,
  ];

  beforeEach(async () => {
    stationsSubject = new BehaviorSubject<Station[] | undefined>(undefined);
    visualizationTypeSubject = new BehaviorSubject<VisualizationType | undefined>(undefined);
    heatmapEnabledSubject = new BehaviorSubject<boolean | undefined>(undefined);

    mapServiceSpy = jasmine.createSpyObj<MapService>('MapService', [
      'createMap',
      'updateMarkers',
      'updateHeatmap',
    ]);

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        { provide: MapService, useValue: mapServiceSpy },
        {
          provide: MapControlService,
          useValue: {
            visualizationType$: visualizationTypeSubject.asObservable(),
            heatmapEnabled$: heatmapEnabledSubject.asObservable(),
          } as Partial<MapControlService>,
        },
        {
          provide: WeatherService,
          useValue: {
            stations$: stationsSubject.asObservable(),
          } as Partial<WeatherService>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    stationsSubject.complete();
    visualizationTypeSubject.complete();
    heatmapEnabledSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not update map before map is created', () => {
    stationsSubject.next(sampleStations);
    visualizationTypeSubject.next(VisualizationType.temperature);
    heatmapEnabledSubject.next(false);

    expect(mapServiceSpy.updateMarkers).not.toHaveBeenCalled();
    expect(mapServiceSpy.updateHeatmap).not.toHaveBeenCalled();
  });

  it('should create the map and update markers when heatmap is disabled', () => {
    stationsSubject.next(sampleStations);
    visualizationTypeSubject.next(VisualizationType.temperature);
    heatmapEnabledSubject.next(false);

    fixture.detectChanges();

    expect(mapServiceSpy.createMap).toHaveBeenCalledTimes(1);
    expect(mapServiceSpy.updateMarkers).toHaveBeenCalledTimes(1);
    expect(mapServiceSpy.updateMarkers).toHaveBeenCalledWith(
      sampleStations,
      VisualizationType.temperature,
    );
    expect(mapServiceSpy.updateHeatmap).not.toHaveBeenCalled();
  });

  it('should create the map and update heatmap when heatmap is enabled', () => {
    stationsSubject.next(sampleStations);
    visualizationTypeSubject.next(VisualizationType.temperature);
    heatmapEnabledSubject.next(true);

    fixture.detectChanges();

    expect(mapServiceSpy.createMap).toHaveBeenCalledTimes(1);
    expect(mapServiceSpy.updateHeatmap).toHaveBeenCalledTimes(1);
    expect(mapServiceSpy.updateHeatmap).toHaveBeenCalledWith(
      sampleStations,
      VisualizationType.temperature,
    );
    expect(mapServiceSpy.updateMarkers).not.toHaveBeenCalled();
  });
});
