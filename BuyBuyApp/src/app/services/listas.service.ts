import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Lista {
  nome: string;
  icone: string;
  cor: string;
  dataEdicao: string;
  totalItens: number;
  produtos?: any[];
  arquivada?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class ListasService {

  private _storage: Storage | null = null;
  public minhasListas: Lista[] = [];

  // -----------------------------------------------------
  // A NOSSA FONTE ÚNICA DE VERDADE PARA AS LOJAS
  public lojasDoSistema = [
    { id: 'ebarato', nome: 'ÉBarato', morada: 'Catálogo de preços baixos', ativa: true },
    { id: 'continente', nome: 'Continente', morada: 'Preços continentais', ativa: false },
    { id: 'pingodoce', nome: 'Pingo Doce', morada: 'Preços doces', ativa: false },
    { id: 'lidl', nome: 'Lidl', morada: 'Mais para si', ativa: false },
    { id: 'auchan', nome: 'Auchan', morada: 'Preços baixos', ativa: false }
  ];

  // Guarda a loja que o utilizador tem escolhida neste momento
  public lojaSelecionadaGlobal = this.lojasDoSistema[0];
  // -----------------------------------------------------

  constructor(private storage: Storage) { }

  private getChaveStorage(): string {
    const email = localStorage.getItem('emailAtual');
    if (email) {
      return 'listas_' + email;
    }
    return 'listas'; 
  }

  async init() {
    if (!this._storage) {
      const storage = await this.storage.create();
      this._storage = storage;
    }
    
    const chave = this.getChaveStorage();
    const listasGuardadas = await this._storage.get(chave);
    
    if (listasGuardadas) {
      this.minhasListas = listasGuardadas;
    } else {
      this.minhasListas = []; 
    }
  }

  async adicionarLista(lista: Lista) {
    this.minhasListas.push(lista);
    const chave = this.getChaveStorage();
    await this._storage?.set(chave, this.minhasListas);
  }

  async adicionarProdutoALista(nomeDaLista: string, produto: any, quantidade: number = 1) {
    const index = this.minhasListas.findIndex(l => l.nome === nomeDaLista);
    if (index !== -1) {
      if (!this.minhasListas[index].produtos) {
        this.minhasListas[index].produtos = [];
      }
      
      const prodExistente = this.minhasListas[index].produtos!.find(p => p.id === produto.id);
      if (prodExistente) {
        prodExistente.quantidade = (prodExistente.quantidade || 1) + quantidade;
      } else {
        this.minhasListas[index].produtos!.push({ ...produto, quantidade: quantidade, riscado: false, recente: true });
      }

      this.minhasListas[index].totalItens = this.minhasListas[index].produtos!.reduce((acc, p) => acc + (p.quantidade || 1), 0);
      this.minhasListas[index].dataEdicao = 'Atualizada agora mesmo';

      const chave = this.getChaveStorage();
      await this._storage?.set(chave, this.minhasListas);
    }
  }

  async guardarAlteracoes() {
    const chave = this.getChaveStorage();
    await this._storage?.set(chave, this.minhasListas);
  }
}