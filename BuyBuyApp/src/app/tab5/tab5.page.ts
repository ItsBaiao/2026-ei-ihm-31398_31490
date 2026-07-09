import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';
import { ProdutosService } from '../services/produtos.service';
import { DeliveryService } from '../services/delivery.service';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false
})
export class Tab5Page implements OnInit {

  public deliveryService = inject(DeliveryService);
  private listasService = inject(ListasService);
  private produtosService = inject(ProdutosService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public deliveryStep: 'select_source' | 'select_list' | 'select_products' | 'confirm_products' | 'address_store' | 'final_checkout' | 'tracking' | 'receipt' = 'select_source';
  public deliveryAddress: string = '';
  public deliveryStore: string = 'ÉBarato';
  public deliveryPaymentMethod: string = 'mbway';
  public deliveryMBWayPhone: string = '';
  public deliveryProducts: any[] = [];
  public deliverySearchQuery: string = '';
  public catalogProducts: any[] = [];
  public listasNoEcra: Lista[] = [];
  public deliveryFee: number = 2.90;

  // Novos campos para Checkout Avançado
  public checkoutMode: 'entrega' | 'recolha' = 'entrega';
  public pickupTime: string = '';
  public promoCodeInput: string = '';
  public appliedPromoCode: string = '';
  public promoCodeError: string = '';
  public cardNumber: string = '';
  public cardExpiry: string = '';
  public cardCvv: string = '';
  public emailAtual: string = '';
  private trackingCheckInterval: any = null;
  public isDatePickerOpen: boolean = false;
  public tempPickupTime: string = '';

  ngOnInit() {
    this.produtosService.getTodosProdutos().subscribe(dados => {
      this.catalogProducts = dados.produtos || dados;
    });
  }

  async ionViewWillEnter() {
    await this.listasService.init();
    this.listasNoEcra = this.listasService.minhasListas.filter(l => !l.arquivada);

    // Carrega morada guardada anteriormente e email atual
    const savedAddress = localStorage.getItem('buybuy_saved_address');
    this.deliveryAddress = savedAddress || '';
    this.emailAtual = localStorage.getItem('emailAtual') || 'anonymous';

    // Se houver encomenda ativa, mostra sempre o ecrã correspondente (tracking ou fatura)
    if (this.deliveryService.activeOrder) {
      if (this.deliveryService.activeOrder.estado === 'Entregue') {
        this.deliveryStep = 'receipt';
      } else {
        this.deliveryStep = 'tracking';
        this.deliveryService.iniciarMonitorizacao();
        this.iniciarVerificacaoEntrega();
      }
    } else {
      // Senão, verifica se veio um pedido de delivery de uma lista específica
      this.route.queryParams.subscribe(params => {
        const startDelivery = params['startDelivery'];
        if (startDelivery) {
          // Limpa os parâmetros
          this.router.navigate([], {
            queryParams: { startDelivery: null },
            queryParamsHandling: 'merge'
          });

          const lista = this.listasNoEcra.find(l => l.nome === startDelivery);
          if (lista) {
            this.selecionarListaParaDelivery(lista);
          }
        } else {
          if (this.deliveryStep === 'tracking') {
            this.deliveryStep = 'select_source';
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.trackingCheckInterval) {
      clearInterval(this.trackingCheckInterval);
    }
  }

  selecionarListaParaDelivery(lista: Lista) {
    this.deliveryProducts = (lista.produtos || []).map(p => ({
      nome: p.nome,
      quantidade: p.quantidade || 1,
      preco: p.preco,
      imagemUrl: p.imagemUrl
    }));
    this.deliveryStep = 'confirm_products'; // Vai primeiro para a confirmação de produtos!
  }

  adicionarProdutoAoDelivery(prod: any) {
    const existe = this.deliveryProducts.find(p => p.nome === prod.nome);
    if (existe) {
      existe.quantidade++;
    } else {
      this.deliveryProducts.push({
        nome: prod.nome,
        quantidade: 1,
        preco: prod.preco,
        imagemUrl: prod.imagemUrl
      });
    }
  }

  async removerProdutoDoDelivery(prod: any) {
    const existe = this.deliveryProducts.find(p => p.nome === prod.nome);
    if (existe) {
      if (existe.quantidade === 1) {
        const alert = await this.alertCtrl.create({
          header: 'Remover Produto',
          message: `Deseja remover o produto ${prod.nome} do seu carrinho?`,
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Remover',
              role: 'destructive',
              handler: () => {
                this.deliveryProducts = this.deliveryProducts.filter(p => p.nome !== prod.nome);
              }
            }
          ]
        });
        await alert.present();
      } else {
        existe.quantidade--;
      }
    }
  }

  obterQuantidadeNoDelivery(prodName: string): number {
    const existe = this.deliveryProducts.find(p => p.nome === prodName);
    return existe ? existe.quantidade : 0;
  }

  get deliverySubtotal(): number {
    return this.deliveryProducts.reduce((acc, p) => {
      const precoLimpo = parseFloat((p.preco || '0').replace('€', '').replace(',', '.'));
      return acc + (precoLimpo * p.quantidade);
    }, 0);
  }

  get currentDeliveryFee(): number {
    return this.checkoutMode === 'recolha' ? 0.00 : 2.90;
  }

  get deliveryDiscount(): number {
    if (this.appliedPromoCode === 'BUYBUYNEW') {
      return this.deliverySubtotal * 0.30;
    }
    return 0.00;
  }

  get deliveryTotal(): number {
    return Math.max(0, this.deliverySubtotal - this.deliveryDiscount + this.currentDeliveryFee);
  }

  get deliveryItensFiltrados(): any[] {
    if (!this.deliverySearchQuery) return this.catalogProducts;
    const query = this.deliverySearchQuery.toLowerCase().trim();
    return this.catalogProducts.filter(p => p.nome.toLowerCase().includes(query));
  }

  // Avanços de ecrã
  avancarParaConfirmacao() {
    if (this.deliveryProducts.length === 0) {
      this.mostrarToast('Selecione pelo menos um produto para continuar.', 'warning');
      return;
    }
    this.deliveryStep = 'confirm_products';
  }

  avancarParaMoradaLoja() {
    if (this.deliveryProducts.length === 0) {
      this.mostrarToast('O seu carrinho de compras está vazio.', 'warning');
      return;
    }
    this.deliveryStep = 'address_store';
  }

  avancarParaPagamento() {
    if (this.checkoutMode === 'entrega' && !this.deliveryAddress.trim()) {
      this.mostrarToast('Por favor, insira uma morada para entrega.', 'warning');
      return;
    }
    this.deliveryStep = 'final_checkout';
  }

  aplicarCodigoPromo() {
    const code = this.promoCodeInput.trim().toUpperCase();
    if (code === 'BUYBUYNEW') {
      const alreadyUsed = localStorage.getItem('buybuy_promo_used_' + this.emailAtual) === 'true';
      if (alreadyUsed) {
        this.promoCodeError = 'Este código promocional já foi utilizado nesta conta.';
        this.appliedPromoCode = '';
        this.mostrarToast('O código BUYBUYNEW já foi utilizado nesta conta.', 'warning');
      } else {
        this.appliedPromoCode = 'BUYBUYNEW';
        this.promoCodeError = '';
        this.mostrarToast('Código BUYBUYNEW aplicado: 30% de desconto!', 'success');
      }
    } else {
      this.promoCodeError = 'Código promocional inválido.';
      this.appliedPromoCode = '';
      this.mostrarToast('Código promocional inválido.', 'danger');
    }
  }

  async confirmarPedidoDelivery() {
    if (this.checkoutMode === 'entrega' && !this.deliveryAddress.trim()) {
      this.mostrarToast('Por favor, insira uma morada de entrega válida.', 'warning');
      return;
    }
    if (this.checkoutMode === 'recolha' && !this.pickupTime.trim()) {
      this.mostrarToast('Por favor, defina um horário para o levantamento.', 'warning');
      return;
    }
    if (this.deliveryProducts.length === 0) {
      this.mostrarToast('O seu carrinho de compras está vazio.', 'warning');
      return;
    }

    // Validações de Pagamento
    if (this.deliveryPaymentMethod === 'mbway' && !this.deliveryMBWayPhone.trim()) {
      this.mostrarToast('Por favor, insira o número de telemóvel para MBWay.', 'warning');
      return;
    }
    if (this.deliveryPaymentMethod === 'card' && (!this.cardNumber.trim() || !this.cardExpiry.trim() || !this.cardCvv.trim())) {
      this.mostrarToast('Por favor, preencha todos os dados do cartão de crédito.', 'warning');
      return;
    }

    // Guarda morada se for entrega
    if (this.checkoutMode === 'entrega') {
      localStorage.setItem('buybuy_saved_address', this.deliveryAddress);
    }

    // Se aplicou cupão de primeira utilização, grava na conta do utilizador
    if (this.appliedPromoCode === 'BUYBUYNEW') {
      localStorage.setItem('buybuy_promo_used_' + this.emailAtual, 'true');
    }

    const subtotalFinal = this.deliverySubtotal;
    const desc = this.deliveryDiscount;
    const totalFinal = this.deliveryTotal;
    const fee = this.currentDeliveryFee;

    const itensMapeados = this.deliveryProducts.map(p => ({
      nome: p.nome,
      quantidade: p.quantidade,
      preco: p.preco,
      imagemUrl: p.imagemUrl
    }));

    const moradaFinal = this.checkoutMode === 'recolha'
      ? `Levantamento na Loja (Horário: ${this.formatarDataRecolha(this.pickupTime)})`
      : this.deliveryAddress;

    const metadataPagamento = this.deliveryPaymentMethod.toUpperCase() + (this.appliedPromoCode ? ' (Promo: -30%)' : '');

    this.deliveryService.criarEncomenda(
      this.deliveryStore,
      moradaFinal,
      metadataPagamento,
      itensMapeados,
      subtotalFinal - desc,
      fee
    );

    this.deliveryStep = 'tracking';
    this.deliveryService.iniciarMonitorizacao();
    this.iniciarVerificacaoEntrega();

    this.mostrarToast(
      this.checkoutMode === 'recolha'
        ? 'Pedido de levantamento efetuado com sucesso! 📦'
        : 'Encomenda efetuada com sucesso! 🚴',
      'success'
    );
  }

  async cancelarPedidoAtivo() {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar Pedido',
      message: 'Deseja mesmo cancelar este pedido?',
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, Cancelar',
          role: 'destructive',
          handler: () => {
            if (this.trackingCheckInterval) {
              clearInterval(this.trackingCheckInterval);
              this.trackingCheckInterval = null;
            }
            this.deliveryService.cancelarEncomendaAtiva();
            this.deliveryStep = 'select_source';
            this.deliveryProducts = [];
            this.appliedPromoCode = '';
            this.promoCodeInput = '';
            this.mostrarToast('Pedido cancelado.', 'warning');
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(msg: string, cor: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: cor,
      position: 'top'
    });
    await toast.present();
  }

  voltarPasso() {
    if (this.deliveryStep === 'select_list' || this.deliveryStep === 'select_products') {
      this.deliveryProducts = [];
      this.deliveryStep = 'select_source';
    } else if (this.deliveryStep === 'confirm_products') {
      this.deliveryStep = this.deliveryProducts.length > 0 ? 'select_products' : 'select_source';
    } else if (this.deliveryStep === 'address_store') {
      this.deliveryStep = 'confirm_products';
    } else if (this.deliveryStep === 'final_checkout') {
      this.deliveryStep = 'address_store';
    }
  }

  iniciarVerificacaoEntrega() {
    if (this.trackingCheckInterval) return;
    this.trackingCheckInterval = setInterval(() => {
      if (this.deliveryService.activeOrder && this.deliveryService.activeOrder.estado === 'Entregue') {
        clearInterval(this.trackingCheckInterval);
        this.trackingCheckInterval = null;
        this.deliveryStep = 'receipt';
      }
    }, 1000);
  }

  dataAtualFormatada(): string {
    return new Date().toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  finalizarRecibo() {
    this.deliveryService.finalizarPedidoEntregue();
    this.deliveryStep = 'select_source';
  }

  formatarDataRecolha(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const hoje = new Date();
      const amanha = new Date();
      amanha.setDate(hoje.getDate() + 1);

      const horas = date.getHours().toString().padStart(2, '0');
      const minutos = date.getMinutes().toString().padStart(2, '0');

      const dataStr = date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });

      if (date.toDateString() === hoje.toDateString()) {
        return `Hoje às ${horas}:${minutos}`;
      } else if (date.toDateString() === amanha.toDateString()) {
        return `Amanhã às ${horas}:${minutos}`;
      } else {
        return `${dataStr} às ${horas}:${minutos}`;
      }
    } catch (e) {
      return isoString;
    }
  }

  abrirAgendador() {
    this.tempPickupTime = this.pickupTime || new Date().toISOString();
    this.isDatePickerOpen = true;
  }

  confirmarAgendamento() {
    this.pickupTime = this.tempPickupTime;
    this.isDatePickerOpen = false;
  }

  fecharAgendador() {
    this.isDatePickerOpen = false;
  }

  obterSubtotalItem(item: any): number {
    if (!item || !item.preco) return 0;
    const precoLimpo = String(item.preco).replace('€', '').replace(',', '.').trim();
    const preco = parseFloat(precoLimpo) || 0;
    return preco * (item.quantidade || 0);
  }
}
