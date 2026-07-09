import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { DeliveryService } from '../services/delivery.service';
import { ListasService, Lista } from '../services/listas.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  
  public nomeUtilizador: string = 'Poupador';
  public iniciais: string = 'PO';
  public emailUtilizador: string = 'poupador@email.com';

  public deliveryService = inject(DeliveryService);
  private listasService = inject(ListasService);

  // Controlo dos Modais
  public isNotificationsModalOpen = false;
  public isArchivedListsModalOpen = false;
  public isPurchaseHistoryModalOpen = false;
  public isSupportModalOpen = false;

  // Definições de Notificações
  public notificacoesPromo = true;
  public notificacoesLembretes = true;
  public notificacoesPartilha = false;
  public notificacoesMensagens = true; // Adicionado

  // Listas Arquivadas dinâmicas do ListasService
  get listasArquivadas(): Lista[] {
    return this.listasService.minhasListas.filter(l => l.arquivada);
  }

  get encomendasDelivery(): any[] {
    return this.deliveryService.ordersHistory.filter(o => o.morada !== 'Compra Presencial');
  }

  get comprasEmLoja(): any[] {
    return this.deliveryService.ordersHistory.filter(o => o.morada === 'Compra Presencial');
  }



  // FAQ Ajuda e Suporte
  public faqs = [
    { pergunta: 'Como crio uma nova lista?', resposta: 'No ecrã principal (Listas), clique no botão de criar lista no canto superior direito. Escolha o nome, cor, ícone e associe a sua loja preferida.', aberta: false },
    { pergunta: 'Como adiciono produtos a uma lista?', resposta: 'Abra a lista pretendida, clique no botão flutuante "+" no canto inferior direito e será direcionado para o catálogo de produtos disponíveis na loja selecionada.', aberta: false },
    { pergunta: 'Como marco um produto como comprado?', resposta: 'Basta tocar diretamente no produto na sua lista para o riscar. Quando todos os produtos estiverem riscados (progresso 100%), surgirá um botão para "Finalizar Compra" e registar o histórico.', aberta: false },
    { pergunta: 'Como partilho uma lista com um amigo?', resposta: 'Abra o separador de Mensagens, entre na conversa com o seu amigo ou grupo, clique no botão de partilha ao lado do campo de texto e selecione a lista que pretende enviar.', aberta: false },
    { pergunta: 'A app funciona sem ligação à Internet?', resposta: 'Sim! Pode consultar as suas listas e riscar produtos offline na loja. As alterações serão guardadas e sincronizadas assim que restabelecer a ligação à internet.', aberta: false }
  ];

  constructor(
    private router: Router, 
    private toastCtrl: ToastController,
    private route: ActivatedRoute
  ) {}

  async ionViewWillEnter() {
    await this.listasService.init();

    // Abre o histórico automaticamente se vier de finalizar compra
    this.route.queryParams.subscribe(params => {
      if (params['openHistory'] === 'true') {
        this.isPurchaseHistoryModalOpen = true;
        // Limpa query params
        this.router.navigate([], {
          queryParams: { openHistory: null },
          queryParamsHandling: 'merge'
        });
      }
    });

    const userGuardado = localStorage.getItem('utilizadorAtual');
    if (userGuardado) {
      this.nomeUtilizador = userGuardado;
      this.gerarIniciais(userGuardado);
    }

    const emailGuardado = localStorage.getItem('emailAtual');
    if (emailGuardado) {
      this.emailUtilizador = emailGuardado;
    }
  }

  gerarIniciais(nome: string) {
    const nomes = nome.trim().split(' ');
    if (nomes.length > 1) {
      this.iniciais = nomes[0][0].toUpperCase() + nomes[nomes.length - 1][0].toUpperCase();
    } else {
      this.iniciais = nome.substring(0, 2).toUpperCase();
    }
  }

  terminarSessao() {
    localStorage.removeItem('utilizadorAtual');
    localStorage.removeItem('emailAtual');
    this.router.navigate(['/welcome']);
  }

  // Notificações Modais
  setNotificationsOpen(isOpen: boolean) {
    this.isNotificationsModalOpen = isOpen;
  }

  async guardarNotificacoes() {
    this.setNotificationsOpen(false);
    const toast = await this.toastCtrl.create({
      message: 'Definições de notificações guardadas com sucesso! 🔔',
      duration: 2500,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  setArchivedListsOpen(isOpen: boolean) {
    this.isArchivedListsModalOpen = isOpen;
  }

  setPurchaseHistoryOpen(isOpen: boolean) {
    this.isPurchaseHistoryModalOpen = isOpen;
  }

  setSupportOpen(isOpen: boolean) {
    this.isSupportModalOpen = isOpen;
  }

  toggleFaq(faq: any) {
    faq.aberta = !faq.aberta;
  }

  async restaurarLista(lista: Lista) {
    lista.arquivada = false;
    await this.listasService.guardarAlteracoes();

    const toast = await this.toastCtrl.create({
      message: `Lista "${lista.nome}" restaurada com sucesso! 📦`,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    this.setArchivedListsOpen(false);
  }

  async enviarMensagemSuporte() {
    const toast = await this.toastCtrl.create({
      message: 'Mensagem enviada com sucesso! Entraremos em contacto brevemente. ✉️',
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    this.setSupportOpen(false);
  }

  async mostrarEmDesenvolvimento() {
    const toast = await this.toastCtrl.create({
      message: 'Funcionalidade ainda em desenvolvimento! 🚧',
      duration: 3000,
      color: 'warning',
      position: 'top',
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}