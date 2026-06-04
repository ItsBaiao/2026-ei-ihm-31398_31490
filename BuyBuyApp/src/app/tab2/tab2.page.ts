import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  
  // Variável que guarda o que está escrito na barra
  searchQuery: string = '';
  // Variável que decide se mostra o estado inicial ou os resultados
  showResults: boolean = false;

  constructor() {}

  // Deteta sempre que o utilizador escreve algo
  onSearchChange(event: any) {
    const query = event.detail.value;
    
    // Se a pessoa escrever "leite", mostramos os resultados!
    if (query && query.toLowerCase().includes('leite')) {
      this.showResults = true;
    } else if (!query) {
      this.showResults = false; // Se apagar tudo, volta ao início
    }
  }

  // Função para limpar a barra ao clicar no "X"
  clearSearch() {
    this.searchQuery = '';
    this.showResults = false;
  }

  // Função para quando se clica na pesquisa recente
  simulateSearch() {
    this.searchQuery = 'leite';
    this.showResults = true;
  }
}