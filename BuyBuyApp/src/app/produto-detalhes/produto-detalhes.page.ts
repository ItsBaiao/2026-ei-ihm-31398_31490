import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-produto-detalhes',
  templateUrl: './produto-detalhes.page.html',
  styleUrls: ['./produto-detalhes.page.scss'],
  standalone: false
})
export class ProdutoDetalhesPage implements OnInit {
  
  public produtoIdId: string | null = null;
  public isListModalOpen = false; // A variável do teu Modal voltou!

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Recebe o ID da página de pesquisa
    this.produtoIdId = this.route.snapshot.paramMap.get('id');
    console.log('Sucesso! A página abriu e recebeu o Produto com ID:', this.produtoIdId);
  }

  // A função que abre e fecha o teu Bottom Sheet Modal
  setModalOpen(isOpen: boolean) {
    this.isListModalOpen = isOpen;
  }
}