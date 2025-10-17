import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Station } from '@models/buienradar-api.model';
import { MapControlService } from '@services/map-control.service';

import { BehaviorSubject, Observable } from 'rxjs';

import { StationDataComponent } from './station-data.component';

describe('StationDataComponent', () => {
  let componentFixture: ComponentFixture<StationDataComponent>;
  let componentInstance: StationDataComponent;
  let selectedStationSubject: BehaviorSubject<Station | null>;
  let unsubscribeSpy: jasmine.Spy;

  function buildStation(id: number, name: string): Station {
    return {
      stationid: id,
      stationname: name,
      regio: '',
      timestamp: new Date(0),
      weatherdescription: '',
      iconurl: '',
      fullIconUrl: '',
      graphUrl: '',
      lat: 0 as any,
      lon: 0 as any,
      winddirection: 'N' as any,
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
  }

  beforeEach(async () => {
    selectedStationSubject = new BehaviorSubject<Station | null>(null);
    unsubscribeSpy = jasmine.createSpy('unsubscribe');

    const selectedStation$ = new Observable<Station | null>((observer) => {
      const subscription = selectedStationSubject.subscribe(observer);
      return () => {
        subscription.unsubscribe();
        unsubscribeSpy();
      };
    });

    await TestBed.configureTestingModule({
      imports: [StationDataComponent],
      providers: [
        {
          provide: MapControlService,
          useValue: {
            selectedStation$: selectedStation$,
          },
        },
      ],
    }).compileComponents();

    componentFixture = TestBed.createComponent(StationDataComponent);
    componentInstance = componentFixture.componentInstance;
    componentFixture.detectChanges();
  });

  afterEach(() => {
    if (componentFixture) {
      componentFixture.destroy();
    }
  });

  it('should create', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should expose null when no station is selected', () => {
    expect(componentInstance.selectedStation()).toBeNull();
  });

  it('should reflect latest station emission from the service', () => {
    const stationOne = buildStation(1, 'Station One');
    selectedStationSubject.next(stationOne);
    componentFixture.detectChanges();
    expect(componentInstance.selectedStation()).toEqual(stationOne);

    const stationTwo = buildStation(2, 'Station Two');
    selectedStationSubject.next(stationTwo);
    componentFixture.detectChanges();
    expect(componentInstance.selectedStation()).toEqual(stationTwo);

    selectedStationSubject.next(null);
    componentFixture.detectChanges();
    expect(componentInstance.selectedStation()).toBeNull();
  });

  it('should unsubscribe from the service observable on destroy', () => {
    componentFixture.destroy();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
