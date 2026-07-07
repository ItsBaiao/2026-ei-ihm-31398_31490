import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';
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
    private navCtrl: NavController
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

  async iniciarCompras() {
    if (!this.listaAtual?.produtos || this.listaAtual.produtos.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Adiciona pelo menos um produto para iniciar as compras.',
        duration: 2500,
        color: 'warning',
        icon: 'alert-circle-outline',
        position: 'bottom', // <-- Alterado para baixo
        cssClass: 'toast-acima-do-botao' // <-- Nova classe
      });
      await toast.present();
    } else {
      this.navCtrl.navigateForward(['/loja-navegacao', this.listaAtual.nome]);
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
    window.removeEventListener('online', this.esconderAviso.bind(this));
    window.removeEventListener('offline', this.mostrarAvisoOffline.bind(this));
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
        position: 'bottom', // <-- Alterado para baixo
        cssClass: 'toast-acima-do-botao' // <-- Nova classe
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
          position: 'bottom',
          cssClass: 'toast-acima-do-botao'
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
        position: 'bottom', // <-- Alterado para baixo
        cssClass: 'toast-acima-do-botao' // <-- Nova classe
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
      position: 'bottom', // <-- Alterado para baixo
      duration: 3500,
      cssClass: 'toast-acima-do-botao' // <-- Nova classe
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
                    position: 'bottom',
                    cssClass: 'toast-acima-do-botao'
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

  // Gera um link Base64 com os dados da lista e copia para o Clipboard (com suporte a fallback para contextos não seguros)
  async partilharLista() {
    if (!this.listaAtual) return;
    
    try {
      const shareData = {
        n: this.listaAtual.nome,
        i: this.listaAtual.icone,
        c: this.listaAtual.cor,
        p: (this.listaAtual.produtos || []).map((p: any) => ({
          n: p.nome,
          pr: p.preco,
          t: p.tamanho,
          cat: p.categoria,
          img: p.imagemUrl,
          q: p.quantidade || 1
        }))
      };
      
      const jsonStr = JSON.stringify(shareData);
      const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
      const shareUrl = `${window.location.origin}/tabs/tab1?import=${base64Data}`;
      
      // Tenta copiar usando a nossa função de cópia robusta
      const copiou = await this.copiarParaClipboard(shareUrl);
      
      if (copiou) {
        const toast = await this.toastCtrl.create({
          message: 'Link de partilha copiado! Envie-o a um amigo.',
          duration: 3000,
          color: 'success',
          icon: 'share-social-outline',
          position: 'bottom',
          cssClass: 'toast-acima-do-botao'
        });
        await toast.present();
      } else {
        // Se a cópia em background falhar (ex: restrições do browser local), mostra para cópia manual
        await this.mostrarAlertaLinkPartilha(shareUrl);
      }
    } catch (err) {
      console.error('Erro ao partilhar lista:', err);
      // Fallback em caso de erro extremo
      try {
        const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(this.listaAtual))));
        const shareUrl = `${window.location.origin}/tabs/tab1?import=${base64Data}`;
        await this.mostrarAlertaLinkPartilha(shareUrl);
      } catch (e) {}
    }
  }

  // Função interna para copiar texto para a área de transferência com fallback
  async copiarParaClipboard(texto: string): Promise<boolean> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(texto);
        return true;
      } catch (err) {
        console.warn('Navigator clipboard falhou, tentando fallback...', err);
      }
    }
    
    // Fallback usando textarea temporário no DOM (essencial para contextos HTTP locais como Capacitor Live Reload)
    try {
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const exito = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (exito) return true;
    } catch (err) {
      console.error('Falha no fallback de cópia:', err);
    }
    return false;
  }

  // Mostra um aviso com a URL caso a cópia automática seja bloqueada pelo browser/dispositivo
  async mostrarAlertaLinkPartilha(link: string) {
    const alert = await this.alertCtrl.create({
      header: 'Partilhar Lista',
      message: 'A cópia automática foi bloqueada. Por favor, copie manualmente o link abaixo para partilhar:',
      inputs: [
        {
          type: 'textarea',
          value: link,
          attributes: {
            readonly: true,
            style: 'height: 100px; font-size: 12px; font-family: monospace;'
          }
        }
      ],
      buttons: ['OK']
    });
    await alert.present();
  }
}