import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-produto-detalhes',
  templateUrl: './produto-detalhes.page.html',
  styleUrls: ['./produto-detalhes.page.scss'],
  standalone: false,
})
export class ProdutoDetalhesPage implements OnInit {

  // Controla se o Bottom Sheet das listas está aberto ou fechado
  isListModalOpen = false;

  constructor() { }

  ngOnInit() {
  }

  // Função para abrir/fechar o modal
  setModalOpen(isOpen: boolean) {
    this.isListModalOpen = isOpen;
  }
}