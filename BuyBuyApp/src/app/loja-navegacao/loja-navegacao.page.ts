import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-loja-navegacao',
  templateUrl: './loja-navegacao.page.html',
  styleUrls: ['./loja-navegacao.page.scss'],
  standalone: false
})
export class LojaNavegacaoPage {

  public listaAtual: Lista | undefined;
  public isMapModalOpen = false;
  
  // Variáveis para gerir os corredores no Modo Loja
  public gruposCorredores: any[] = [];
  public corredorAtual: any = null;
  public filtroCorredor: string = 'Toda a Lista'; // Adicionado para gerir as pílulas (Pills)

  constructor(
    private route: ActivatedRoute,
    private listasService: ListasService,
    private navCtrl: NavController
  ) { }

  async ionViewWillEnter() {
    await this.listasService.init();
    const nomeRecebido = this.route.snapshot.paramMap.get('nome');
    
    if (nomeRecebido) {
      this.listaAtual = this.listasService.minhasListas.find(l => l.nome === nomeRecebido);
      
      // Assim que temos a lista, agrupamos logo os produtos!
      if (this.listaAtual && this.listaAtual.produtos) {
        this.agruparProdutosPorCorredor();
      }
    }
  }

  // 1. ORGANIZAR OS PRODUTOS NOS SEUS CORREDORES
  agruparProdutosPorCorredor() {
    
    // Se não houver lista ou produtos, aborta a função!
    if (!this.listaAtual || !this.listaAtual.produtos) return;

    const mapa: any = {
      'Lacticínios': { corredor: 'Corredor 1', icone: '🧀' },
      'Legumes':     { corredor: 'Corredor 2', icone: '🥦' },
      'Padaria':     { corredor: 'Corredor 3', icone: '🍞' },
      'Limpeza':     { corredor: 'Corredor 4', icone: '🧹' },
      'Bebidas':     { corredor: 'Corredor 5', icone: '🥤' },
      'Carnes':      { corredor: 'Corredor 6', icone: '🍖' }
    };

    let grupos: any = {};

    this.listaAtual.produtos.forEach((prod: any) => {
      const info = mapa[prod.categoria] || { corredor: 'Outros Corredores', icone: '🛒' };
      const chave = info.corredor;

      if (!grupos[chave]) {
        grupos[chave] = {
          nomeCorredor: info.corredor,
          categoria: prod.categoria || 'Diversos',
          icone: info.icone,
          produtos: []
        };
      }
      grupos[chave].produtos.push(prod);
    });

    this.gruposCorredores = Object.values(grupos).sort((a: any, b: any) => a.nomeCorredor.localeCompare(b.nomeCorredor));

    this.atualizarProximaParagem();
  }

  // 2. ATUALIZAR O RETÂNGULO VERDE
  atualizarProximaParagem() {
    this.corredorAtual = this.gruposCorredores.find(grupo => 
      grupo.produtos.some((p: any) => !p.riscado)
    );
  }

  // Conta quantos itens faltam em cada categoria
  contarPendentes(grupo: any) {
    return grupo.produtos.filter((p: any) => !p.riscado).length;
  }

  setMapModalOpen(isOpen: boolean) {
    this.isMapModalOpen = isOpen;
  }

  // Atualiza a variável ao clicar nas pílulas de filtro
  mudarFiltroCorredor(corredor: string) {
    this.filtroCorredor = corredor;
  }

  terminarSessao() {
    // Quando clicamos em Terminar, volta para os detalhes da lista de onde viemos
    if (this.listaAtual) {
      this.navCtrl.navigateBack(['/lista-detalhes', this.listaAtual.nome]);
    } else {
      this.navCtrl.navigateRoot('/tabs/tab1');
    }
  }

  async riscarProduto(produto: any) {
    produto.riscado = !produto.riscado; 
    await this.listasService.guardarAlteracoes(); 
    this.atualizarProximaParagem(); // Verifica se o corredor já acabou para mudar o cartão verde!
  }
}