import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscolhaLojaPage } from './escolha-loja.page';

describe('EscolhaLojaPage', () => {
  let component: EscolhaLojaPage;
  let fixture: ComponentFixture<EscolhaLojaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EscolhaLojaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
