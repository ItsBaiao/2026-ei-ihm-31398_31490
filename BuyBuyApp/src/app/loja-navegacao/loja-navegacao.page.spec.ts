import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LojaNavegacaoPage } from './loja-navegacao.page';

describe('LojaNavegacaoPage', () => {
  let component: LojaNavegacaoPage;
  let fixture: ComponentFixture<LojaNavegacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LojaNavegacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
