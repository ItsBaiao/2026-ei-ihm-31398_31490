import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nova-lista',
  templateUrl: './nova-lista.page.html',
  styleUrls: ['./nova-lista.page.scss'],
  standalone: false,
})
export class NovaListaPage implements OnInit {

  // Controla se a janela das cores está aberta ou fechada
  isColorModalOpen = false;

  constructor() { }

  ngOnInit() {
  }

  // Função para abrir ou fechar o modal
  setModalOpen(isOpen: boolean) {
    this.isColorModalOpen = isOpen;
  }

}