import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBreadcrumb } from '../configs';
import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  let component: Breadcrumb;
  let fixture: ComponentFixture<Breadcrumb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breadcrumb],
      providers: [provideBreadcrumb(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumb);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
