import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleComponent } from './title.component';

describe('TitleComponent', () => {
  let component: TitleComponent;
  let fixture: ComponentFixture<TitleComponent>;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.componentRef.setInput('title', 'Weather');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
