import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaDetalhesPage } from './lista-detalhes.page';

describe('ListaDetalhesPage', () => {
  let component: ListaDetalhesPage;
  let fixture: ComponentFixture<ListaDetalhesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaDetalhesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
