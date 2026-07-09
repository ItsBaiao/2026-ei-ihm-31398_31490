import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';
import { DeliveryService } from '../services/delivery.service';
import { Network } from '@capacitor/network'; 

@Component({
  selector: 'app-lista-detalhes',
  templateUrl: './lista-detalhes.page.html',
  styleUrls: ['./lista-detalhes.page.scss'],
  standalone: false
})
export class ListaDetalhesPage implements OnInit, OnDestroy {

  public listaAtual: Lista | undefined;
  public progresso: number = 0;
  public marcados: number = 0;
  public searchQuery: string = '';
  
  public isOffline: boolean = false;
  public avisoOffline: HTMLIonToastElement | null = null;
  private networkListener: any; 

  get produtosFiltrados(): any[] {
    if (!this.listaAtual || !this.listaAtual.produtos) return [];
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.listaAtual.produtos;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.listaAtual.produtos.filter(p => 
      p.nome.toLowerCase().includes(query) || 
      (p.categoria && p.categoria.toLowerCase().includes(query))
    );
  }

  constructor(
    private route: ActivatedRoute,
    private listasService: ListasService,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private deliveryService: DeliveryService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.ligarDetetores();
  }

  async ionViewWillEnter() {
    this.isOffline = !navigator.onLine;
    await this.listasService.init();
    
    const nomeRecebido = this.route.snapshot.paramMap.get('nome');
    if (nomeRecebido) {
      this.listaAtual = this.listasService.minhasListas.find(l => l.nome === nomeRecebido);
      this.calcularProgresso(); 
    }
  }

  async ionViewDidEnter() {
    const status = await Network.getStatus();
    if (!status.connected || !navigator.onLine) {
      this.mostrarAvisoOffline();
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
    window.removeEventListener('online', this.esconderAviso.bind(this));
    window.removeEventListener('offline', this.mostrarAvisoOffline.bind(this));
  }

  voltarParaListas() {
    this.navCtrl.navigateBack('/tabs/tab1');
  }

  async editarListaCompleta() {
    if (this.listaAtual) {
      this.navCtrl.navigateForward(['/nova-lista'], {
        queryParams: { editar: this.listaAtual.nome }
      });
    }
  }

  async apagarLista() {
    if (this.listaAtual) {
      const index = this.listasService.minhasListas.findIndex(l => l.nome === this.listaAtual?.nome);
      
      if (index > -1) {
        this.listasService.minhasListas.splice(index, 1);
        await this.listasService.guardarAlteracoes();
        
        const toast = await this.toastCtrl.create({
          message: 'Lista apagada com sucesso!',
          duration: 2000, 
          color: 'dark', 
          position: 'bottom', // <-- Alterado para baixo
          cssClass: 'toast-acima-do-botao' // <-- Nova classe
        });
        await toast.present();
        
        this.navCtrl.navigateBack('/tabs/tab1');
      }
    }
  }

  async limparProdutos() {
    if (this.listaAtual && this.listaAtual.produtos) {
      this.listaAtual.produtos = []; 
      this.listaAtual.totalItens = 0;
      this.listaAtual.dataEdicao = 'Esvaziada agora mesmo';
      
      this.calcularProgresso(); 
      await this.listasService.guardarAlteracoes(); 

      const toast = await this.toastCtrl.create({
        message: 'Todos os produtos foram removidos da lista.',
        duration: 2500,
        color: 'dark',
        position: 'top'
      });
      await toast.present();
    }
  }

  async removerProduto(produto: any, slidingItem: any) {
    slidingItem.close(); 

    if (this.listaAtual && this.listaAtual.produtos) {
      // 1. Encontra a posição exata daquela linha específica na lista
      const index = this.listaAtual.produtos.indexOf(produto);
      
      // 2. Se encontrou, apaga APENAS esse elemento (1)
      if (index > -1) {
        this.listaAtual.produtos.splice(index, 1);
        
        this.listaAtual.totalItens = this.listaAtual.produtos.length;
        this.listaAtual.dataEdicao = 'Atualizada agora mesmo';

        this.calcularProgresso(); 
        await this.listasService.guardarAlteracoes();

        const toast = await this.toastCtrl.create({
          message: `${produto.nome} removido.`,
          duration: 2000,
          color: 'dark',
          position: 'top'
        });
        await toast.present();
      }
    }
  }

  async ligarDetetores() {
    this.networkListener = await Network.addListener('networkStatusChange', async status => {
      if (status.connected) { this.esconderAviso(); } else { this.mostrarAvisoOffline(); }
    });
    window.addEventListener('online', () => this.esconderAviso());
    window.addEventListener('offline', () => this.mostrarAvisoOffline());
  }

  async esconderAviso() {
    this.isOffline = false;
    if (this.avisoOffline) {
      await this.avisoOffline.dismiss();
      this.avisoOffline = null;
      const toast = await this.toastCtrl.create({
        message: 'Ligação restaurada. Sincronizado!', 
        duration: 2500, 
        color: 'success', 
        icon: 'wifi-outline', 
        position: 'top'
      });
      await toast.present();
    }
  }

  async mostrarAvisoOffline() {
    this.isOffline = true;
    
    if (this.avisoOffline) return; 
    
    this.avisoOffline = await this.toastCtrl.create({
      message: 'A funcionar em modo offline. As alterações estão a ser guardadas.', 
      color: 'dark', 
      icon: 'cloud-offline-outline', 
      position: 'top',
      duration: 3500
    });

    this.avisoOffline.onDidDismiss().then(() => {
      this.avisoOffline = null;
    });

    await this.avisoOffline.present();
  }

  async riscarProduto(produto: any, slidingItem: any) {
    produto.riscado = !produto.riscado; 
    slidingItem.close(); 
    this.calcularProgresso(); 
    await this.listasService.guardarAlteracoes(); 

    const status = await Network.getStatus();
    if (!status.connected || !navigator.onLine) {
      this.mostrarAvisoOffline();
    }
  }

  calcularProgresso() {
    if (this.listaAtual && this.listaAtual.produtos && this.listaAtual.produtos.length > 0) {
      this.marcados = this.listaAtual.produtos.filter((p: any) => p.riscado).length;
      this.progresso = Math.round((this.marcados / this.listaAtual.produtos.length) * 100);
    }
  }

  async alterarQuantidadeItem(produto: any, alteracao: number, event: Event) {
    event.stopPropagation(); // Impede cliques indesejados nas linhas
    const novaQuantidade = (produto.quantidade || 1) + alteracao;
    
    if (novaQuantidade === 0) {
      // Cria o diálogo de confirmação (AlertController) para remover o item (Revertido para padrão)
      const alert = await this.alertCtrl.create({
        header: 'Remover produto',
        message: `Deseja mesmo remover ${produto.nome} da sua lista de compras?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Remover',
            handler: async () => {
              if (this.listaAtual && this.listaAtual.produtos) {
                const idx = this.listaAtual.produtos.indexOf(produto);
                if (idx > -1) {
                  this.listaAtual.produtos.splice(idx, 1);
                  this.listaAtual.totalItens = this.listaAtual.produtos.reduce(
                    (acc, p) => acc + (p.quantidade || 1), 
                    0
                  );
                  this.listaAtual.dataEdicao = 'Atualizada agora mesmo';
                  this.calcularProgresso();
                  await this.listasService.guardarAlteracoes();

                  const toast = await this.toastCtrl.create({
                    message: `${produto.nome} removido.`,
                    duration: 2000,
                    color: 'dark',
                    position: 'top'
                  });
                  await toast.present();
                }
              }
            }
          }
        ]
      });
      await alert.present();

    } else if (novaQuantidade >= 1) {
      produto.quantidade = novaQuantidade;
      
      if (this.listaAtual && this.listaAtual.produtos) {
        // Atualiza a soma total de itens na lista
        this.listaAtual.totalItens = this.listaAtual.produtos.reduce(
          (acc, p) => acc + (p.quantidade || 1), 
          0
        );
        this.listaAtual.dataEdicao = 'Atualizada agora mesmo';
        this.calcularProgresso();
        await this.listasService.guardarAlteracoes();
      }
    }
  }

  // Função utilitária para calcular o preço total escalado pela quantidade
  obterPrecoTotalItem(prod: any): string {
    if (!prod || !prod.preco) return '';
    // Converte de "€1,89" para 1.89
    const precoLimpo = prod.preco.replace('€', '').replace(',', '.').trim();
    const precoUnitario = parseFloat(precoLimpo);
    if (isNaN(precoUnitario)) return prod.preco;

    const total = precoUnitario * (prod.quantidade || 1);
    // Devolve no formato "€X,XX"
    return '€' + total.toFixed(2).replace('.', ',');
  }

  async toggleRiscado(produto: any) {
    produto.riscado = !produto.riscado;
    this.calcularProgresso();
    await this.listasService.guardarAlteracoes();
  }

  async finalizarCompra() {
    if (!this.listaAtual || !this.listaAtual.produtos || this.listaAtual.produtos.length === 0) return;

    // 1. Mapeia os itens
    const itensMapeados = this.listaAtual.produtos.map(p => ({
      nome: p.nome,
      quantidade: p.quantidade || 1,
      preco: p.preco || '€0,00',
      imagemUrl: p.imagemUrl
    }));

    // 2. Calcula total
    const total = this.listaAtual.produtos.reduce((acc, p) => {
      const precoLimpo = p.preco ? p.preco.replace('€', '').replace(',', '.').trim() : '0';
      const parsed = parseFloat(precoLimpo);
      return acc + (isNaN(parsed) ? 0 : parsed * (p.quantidade || 1));
    }, 0);

    // 3. Adiciona ao histórico do DeliveryService
    this.deliveryService.adicionarCompraConcluida(
      this.listaAtual.nome + ' (Loja: ÉBarato)', 
      itensMapeados, 
      total
    );

    // 4. Limpa os produtos da lista atual
    this.listaAtual.produtos = [];
    this.listaAtual.totalItens = 0;
    this.listaAtual.dataEdicao = 'Concluída agora mesmo';
    this.calcularProgresso();
    await this.listasService.init();
    await this.listasService.guardarAlteracoes();

    // 5. Mostra alerta de sucesso
    const alert = await this.alertCtrl.create({
      header: 'Compra Finalizada! 🎉',
      message: 'Os produtos foram registados no seu histórico de compras e a lista foi limpa.',
      buttons: [
        {
          text: 'Ver Histórico',
          handler: () => {
            this.router.navigate(['/tabs/tab3'], { queryParams: { openHistory: 'true' } });
          }
        },
        {
          text: 'Fechar',
          role: 'cancel',
          handler: () => {
            this.navCtrl.navigateBack('/tabs/tab1');
          }
        }
      ]
    });
    await alert.present();
  }
}