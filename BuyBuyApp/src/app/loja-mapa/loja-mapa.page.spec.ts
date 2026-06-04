import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LojaMapaPage } from './loja-mapa.page';

describe('LojaMapaPage', () => {
  let component: LojaMapaPage;
  let fixture: ComponentFixture<LojaMapaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LojaMapaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
