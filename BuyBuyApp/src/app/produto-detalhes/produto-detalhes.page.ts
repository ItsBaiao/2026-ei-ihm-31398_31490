import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProdutosService } from '../services/produtos.service'; // Chamamos o empregado

@Component({
  selector: 'app-produto-detalhes',
  templateUrl: './produto-detalhes.page.html',
  styleUrls: ['./produto-detalhes.page.scss'],
  standalone: false
})
export class ProdutoDetalhesPage implements OnInit {
  
  public produtoIdId: string | null = null;
  public isListModalOpen = false;
  
  // A variável que vai guardar o produto correto para mostrar no ecrã
  public produtoAtual: any = null;

  constructor(
    private route: ActivatedRoute,
    private produtosService: ProdutosService // Injetamos o serviço
  ) { }

  ngOnInit() {
    // 1. Recebe o ID do produto pelo URL
    this.produtoIdId = this.route.snapshot.paramMap.get('id');

    if (this.produtoIdId) {
      // 2. Chama o serviço para ler o catálogo
      this.produtosService.getTodosProdutos().subscribe(dados => {
        
        // 3. Procura no catálogo o produto cujo ID seja igual ao ID do URL
        // Usamos o comando "find" do JavaScript
        const produtoEncontrado = dados.produtos.find(
          (p: any) => p.id.toString() === this.produtoIdId
        );

        if (produtoEncontrado) {
          this.produtoAtual = produtoEncontrado;
        }
      });
    }
  }

  setModalOpen(isOpen: boolean) {
    this.isListModalOpen = isOpen;
  }
}