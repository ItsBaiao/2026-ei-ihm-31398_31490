import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Importado para as mensagens

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

  // Controlo dos Modais
  public isNotificationsModalOpen = false;
  public isArchivedListsModalOpen = false;
  public isPurchaseHistoryModalOpen = false;
  public isSupportModalOpen = false;

  // Definições de Notificações
  public notificacoesPromo = true;
  public notificacoesLembretes = true;
  public notificacoesPartilha = false;

  // Listas Arquivadas
  public listasArquivadas = [
    { nome: 'Churrasco Fim de Semana', icone: 'flame-outline', cor: 'border-brown', dataEdicao: 'Arquivada em 15/05/2026', totalItens: 8 },
    { nome: 'Preparações Aniversário', icone: 'gift-outline', cor: 'border-pink', dataEdicao: 'Arquivada em 02/05/2026', totalItens: 15 }
  ];

  // Histórico de Compras
  public historicoCompras = [
    { data: '05/06/2026', loja: 'ÉBarato - Constituição', total: '€14,85', itens: 6 },
    { data: '28/05/2026', loja: 'ÉBarato - Constituição', total: '€22,40', itens: 11 },
    { data: '14/05/2026', loja: 'Continente Bom Dia', total: '€8,90', itens: 4 }
  ];

  // FAQ Ajuda e Suporte
  public faqs = [
    { pergunta: 'Como partilho uma lista com um amigo?', resposta: 'Abra a lista que deseja partilhar, clique no ícone de partilha no canto superior direito e envie pelos canais habituais.', aberta: false },
    { pergunta: 'A app funciona sem ligação à Internet?', resposta: 'Sim! Pode consultar as suas listas e usar o Modo Loja offline. As alterações serão sincronizadas quando recuperar a ligação.', aberta: false },
    { pergunta: 'Como crio uma nova lista?', resposta: 'No ecrã principal (Listas), clique no botão "+" no canto inferior direito, escolha o ícone e a cor, e comece a adicionar produtos.', aberta: false }
  ];

  constructor(private router: Router, private toastCtrl: ToastController) {}

  ionViewWillEnter() {
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

  async restaurarLista(lista: any) {
    const toast = await this.toastCtrl.create({
      message: `Lista "${lista.nome}" restaurada com sucesso! 📦`,
      duration: 2000,
      color: 'success',
      position: 'bottom',
      cssClass: 'toast-acima-das-tabs'
    });
    await toast.present();
    this.setArchivedListsOpen(false);
  }

  async enviarMensagemSuporte() {
    const toast = await this.toastCtrl.create({
      message: 'Mensagem enviada com sucesso! Entraremos em contacto brevemente. ✉️',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
    this.setSupportOpen(false);
  }

  async mostrarEmDesenvolvimento() {
    const toast = await this.toastCtrl.create({
      message: 'Funcionalidade ainda em desenvolvimento! 🚧',
      duration: 3000,
      color: 'warning',
      position: 'bottom',
      cssClass: 'toast-acima-das-tabs',
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