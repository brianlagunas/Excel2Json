import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncaughtErrorComponent } from './uncaught-error.component';

describe('UncaughtErrorComponent', () => {
  let component: UncaughtErrorComponent;
  let fixture: ComponentFixture<UncaughtErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UncaughtErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UncaughtErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
