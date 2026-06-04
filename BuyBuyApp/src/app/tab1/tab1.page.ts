import { Component } from '@angular/core';
import { ListasService, Lista } from '../services/listas.service'; // Importamos o cofre

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  // Variável que vai segurar as listas para o ecrã mostrar
  public listasNoEcra: Lista[] = [];

  constructor(private listasService: ListasService) {}

  // Este comando corre SEMPRE que a Tab 1 fica visível
  async ionViewWillEnter() {
    // 1. Garante que o cofre do Ionic Storage já foi lido
    await this.listasService.init();
    
    // 2. Passa as listas do cofre para a nossa variável do ecrã
    this.listasNoEcra = this.listasService.minhasListas;
  }

}