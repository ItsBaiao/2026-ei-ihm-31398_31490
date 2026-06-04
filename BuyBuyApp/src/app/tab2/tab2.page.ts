import { Component, OnInit } from '@angular/core';
import { ProdutosService } from '../services/produtos.service'; // Chamamos o Empregado

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  
  // As variáveis do teu design original
  public searchQuery: string = '';
  public showResults: boolean = false;

  // A variável nova que vai receber a lista do JSON
  public produtosDoCatalogo: any[] = []; 

  // Injetamos o serviço no motor da página
  constructor(private produtosService: ProdutosService) {}

  ngOnInit() {
    // Mal a página abre, pede os produtos ao serviço
    this.produtosService.getTodosProdutos().subscribe(dados => {
      // O '.produtos' vem exatamente da palavra que usaste dentro do teu ficheiro JSON
      this.produtosDoCatalogo = dados.produtos; 
    });
  }

  // As tuas funções originais da barra de pesquisa
  onSearchChange(event: any) {
    if (this.searchQuery.length > 0) {
      this.showResults = true;
    } else {
      this.showResults = false;
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.showResults = false;
  }

  simulateSearch() {
    this.searchQuery = 'Leite';
    this.showResults = true;
  }
}