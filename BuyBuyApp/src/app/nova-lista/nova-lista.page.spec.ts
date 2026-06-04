import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaListaPage } from './nova-lista.page';

describe('NovaListaPage', () => {
  let component: NovaListaPage;
  let fixture: ComponentFixture<NovaListaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NovaListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
