import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListasService } from '../services/listas.service'; // O nosso cofre

@Component({
  selector: 'app-nova-lista',
  templateUrl: './nova-lista.page.html',
  styleUrls: ['./nova-lista.page.scss'],
  standalone: false
})
export class NovaListaPage {

  // Variáveis do formulário
  public nomeDaLista: string = '';
  public iconeEscolhido: string = 'cart-outline';
  public corEscolhida: string = 'border-dark';

  // Variáveis da Modal de Cores
  public isColorModalOpen = false;
  public hueValue = 0;
  public lightnessValue = 50;
  public corPersonalizada = '#FF0000';

  // A variável que vai guardar a loja selecionada no cofre
  public lojaSelecionada: any;

  constructor(private router: Router, private listasService: ListasService) {}

  // Lê a loja sempre que a página abre
  ionViewWillEnter() {
    this.lojaSelecionada = this.listasService.lojaSelecionadaGlobal;
  }

  // Funções dos botões da interface
  selecionarIcone(icone: string) {
    this.iconeEscolhido = icone;
  }

  selecionarCor(cor: string) {
    this.corEscolhida = cor;
  }

  setModalOpen(isOpen: boolean) {
    this.isColorModalOpen = isOpen;
  }

  atualizarCorPeloSlider(event: any) {
    this.hueValue = event.target.value;
  }

  atualizarLuminosidadePeloSlider(event: any) {
    this.lightnessValue = event.target.value;
  }

  confirmarCorModal() {
    this.setModalOpen(false);
  }

  // Guardar a lista e voltar à página principal
  async guardarLista() {
    if (this.nomeDaLista.trim() !== '') {
      const novaLista = {
        nome: this.nomeDaLista,
        icone: this.iconeEscolhido,
        cor: this.corEscolhida,
        dataEdicao: 'Criada agora mesmo',
        totalItens: 0,
        produtos: []
      };
      await this.listasService.adicionarLista(novaLista);
    }
    this.router.navigate(['/tabs/tab1']);
  }
}