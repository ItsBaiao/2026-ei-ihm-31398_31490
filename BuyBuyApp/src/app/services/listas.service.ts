import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Lista {
  nome: string;
  icone: string;
  cor: string;
  dataEdicao: string;
  totalItens: number;
  produtos?: any[];
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
    { id: 'ebarato', nome: 'ÉBarato - Constituição', morada: 'Rua de Cedofeita, Porto', ativa: true },
    { id: 'aldi', nome: 'Aldi - Viana do Castelo', morada: 'Rua de Monserrate', ativa: false },
    { id: 'mercadona', nome: 'Mercadona - Viana do Castelo', morada: 'Estrada da Abelheira', ativa: false },
    { id: 'continente', nome: 'Continente Bom Dia - Viana do Castelo', morada: 'R. Gen. Humberto Delgado', ativa: false }
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

  async adicionarProdutoALista(nomeDaLista: string, produto: any) {
    const index = this.minhasListas.findIndex(l => l.nome === nomeDaLista);
    if (index !== -1) {
      if (!this.minhasListas[index].produtos) {
        this.minhasListas[index].produtos = [];
      }
      this.minhasListas[index].produtos.push({ ...produto, riscado: false, recente: true });
      this.minhasListas[index].totalItens = this.minhasListas[index].produtos.length;
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