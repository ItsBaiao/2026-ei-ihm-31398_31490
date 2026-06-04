import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Lista {
  nome: string;
  icone: string;
  cor: string;
  dataEdicao: string;
  totalItens: number;
}

@Injectable({
  providedIn: 'root'
})
export class ListasService {
  
  public minhasListas: Lista[] = [];

  // Injetamos o HttpClient para poder ler ficheiros
  constructor(private http: HttpClient) { 
    this.carregarDoJSON();
  }

  // Função que vai buscar os dados ao ficheiro JSON
  carregarDoJSON() {
    this.http.get<{listas: Lista[]}>('assets/data/listas.json').subscribe(dados => {
      this.minhasListas = dados.listas;
    });
  }

  adicionarLista(novaLista: Lista) {
    this.minhasListas.unshift(novaLista);
  }
}