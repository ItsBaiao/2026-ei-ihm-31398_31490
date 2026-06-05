import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-loja-navegacao',
  templateUrl: './loja-navegacao.page.html',
  styleUrls: ['./loja-navegacao.page.scss'],
  standalone: false
})
export class LojaNavegacaoPage implements OnInit {

  public listaAtual: Lista | undefined;
  public isMapModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private listasService: ListasService,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    await this.listasService.init();
    const nomeRecebido = this.route.snapshot.paramMap.get('nome');
    if (nomeRecebido) {
      this.listaAtual = this.listasService.minhasListas.find(l => l.nome === nomeRecebido);
    }
  }

  setMapModalOpen(isOpen: boolean) {
    this.isMapModalOpen = isOpen;
  }

  terminarSessao() {
    this.navCtrl.back();
  }

  // A FUNÇÃO QUE DÁ VIDA AOS BOTÕES:
  async riscarProduto(produto: any) {
    produto.riscado = !produto.riscado; // Alterna entre riscado e não riscado
    await this.listasService.guardarAlteracoes(); // Guarda logo na memória!
  }
}