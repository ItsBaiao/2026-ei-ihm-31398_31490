import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-nova-lista',
  templateUrl: './nova-lista.page.html',
  styleUrls: ['./nova-lista.page.scss'],
  standalone: false
})
export class NovaListaPage implements OnInit {

  public isColorModalOpen = false;

  // 1. Variáveis que guardam o que o utilizador escolhe no ecrã
  public nomeDaLista: string = ''; 
  public iconeEscolhido: string = 'cart-outline'; 
  public corEscolhida: string = 'border-dark'; 

  constructor(
    private listasService: ListasService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  setModalOpen(isOpen: boolean) {
    this.isColorModalOpen = isOpen;
  }

  // 2. Funções ativadas quando clicas num ícone ou cor
  selecionarIcone(icone: string) {
    this.iconeEscolhido = icone;
  }

  selecionarCor(cor: string) {
    this.corEscolhida = cor;
  }

  // 3. A função de guardar agora usa as tuas escolhas reais
  guardarLista() {
    // Se não escreveres nada, ele dá o nome "Nova Lista" para não ficar vazio
    const nomeFinal = this.nomeDaLista.trim() !== '' ? this.nomeDaLista : 'Nova Lista';

    const nova: Lista = {
      nome: nomeFinal,
      icone: this.iconeEscolhido,
      cor: this.corEscolhida,
      dataEdicao: 'Criada agora mesmo',
      totalItens: 0
    };

    this.listasService.adicionarLista(nova);
    this.navCtrl.back();
  }
}