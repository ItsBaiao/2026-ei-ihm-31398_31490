import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { ToastController, AlertController, ActionSheetController, IonContent } from '@ionic/angular';
import { ListasService, Lista } from '../services/listas.service';
import { SupabaseService } from '../services/supabase.service';

interface Amigo {
  nome: string;
  email: string;
  iniciais: string;
}

interface Grupo {
  id: string;
  nome: string;
  criador: string;
  membros: string[];
  iniciais: string;
}

interface Mensagem {
  remetente: string; // email do remetente
  remetenteNome?: string; // nome do remetente (apenas para grupos)
  texto: string;
  data: string;
  tipo: 'texto' | 'lista';
  listaDados?: any; // dados da lista caso tipo seja 'lista'
}

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false
})
export class Tab4Page implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  public emailAtual: string = '';
  public nomeAtual: string = '';
  
  public emailAmigoInput: string = '';
  public amigos: Amigo[] = [];
  public amigoAtivo: Amigo | null = null;
  public mensagens: Mensagem[] = [];
  public novaMensagemText: string = '';
  
  public isShareListModalOpen = false;
  public isInfoModalOpen = false;
  public isCriarGrupoModalOpen = false;
  public isAddFriendModalOpen = false;

  // Variáveis para funcionalidade de Grupos e WhatsApp Style
  public segmentoAtivo: 'amigos' | 'grupos' = 'amigos';
  public grupos: Grupo[] = [];
  public grupoAtivo: Grupo | null = null;
  public nomeGrupoInput: string = '';
  public membrosSelecionados: { [email: string]: boolean } = {};
  public isInfoGrupoModalOpen: boolean = false;
  
  public isNovoChatModalOpen: boolean = false;
  public termoPesquisa: string = '';

  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private actionSheetCtrl = inject(ActionSheetController);
  private listasService = inject(ListasService);
  private supabaseService = inject(SupabaseService);

  private chatInterval: any = null;


  ngOnInit() {
    this.listasService.init();
    this.carregarUtilizadorAtual();
  }

  ngOnDestroy() {
    this.pararIntervaloChat();
  }

  async ionViewWillEnter() {
    const anteriorEmail = this.emailAtual;
    this.carregarUtilizadorAtual();
    
    if (this.emailAtual) {
      await this.sincronizarContas();
      await this.sincronizarAmigos();
      await this.sincronizarGrupos();
    }
    
    if (this.emailAtual !== anteriorEmail) {
      this.fecharChat();
    } else {
      if (this.amigoAtivo || this.grupoAtivo) {
        this.iniciarIntervaloChat();
      }
    }
  }

  carregarUtilizadorAtual() {
    this.emailAtual = localStorage.getItem('emailAtual') || '';
    const contas = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');
    const conta = contas.find((c: any) => c.email.toLowerCase() === this.emailAtual.toLowerCase());
    this.nomeAtual = conta ? conta.nome : (localStorage.getItem('utilizadorAtual') || 'Poupador');
  }

  async sincronizarContas() {
    if (!this.emailAtual) return;
    const iniciais = this.obterIniciais(this.nomeAtual);
    await this.supabaseService.registarConta(this.emailAtual, this.nomeAtual, iniciais);
    
    const contasSupabase = await this.supabaseService.obterContas();
    let contasLocais = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');
    contasSupabase.forEach((c: any) => {
      const index = contasLocais.findIndex((cl: any) => cl.email.toLowerCase() === c.email.toLowerCase());
      if (index >= 0) {
        contasLocais[index].nome = c.nome;
      } else {
        contasLocais.push({
          nome: c.nome,
          email: c.email,
          senha: ''
        });
      }
    });
    localStorage.setItem('contasRegistadas', JSON.stringify(contasLocais));
  }

  async sincronizarAmigos() {
    if (!this.emailAtual) return;
    const amigosSupabase = await this.supabaseService.obterAmigos(this.emailAtual);
    this.amigos = amigosSupabase;
    localStorage.setItem(`amigos_${this.emailAtual}`, JSON.stringify(this.amigos));
  }

  async sincronizarGrupos() {
    if (!this.emailAtual) return;
    const gruposSupabase = await this.supabaseService.obterGrupos(this.emailAtual);
    this.grupos = gruposSupabase;
    localStorage.setItem('grupos_sistema', JSON.stringify(this.grupos));
  }

  iniciarIntervaloChat() {
    this.pararIntervaloChat();
    this.chatInterval = setInterval(() => {
      if (this.amigoAtivo) {
        this.carregarMensagens();
      } else if (this.grupoAtivo) {
        this.carregarMensagensGrupo();
      }
    }, 3000);
  }

  pararIntervaloChat() {
    if (this.chatInterval) {
      clearInterval(this.chatInterval);
      this.chatInterval = null;
    }
  }


  acaoBotaoFlutuante() {
    if (this.segmentoAtivo === 'amigos') {
      this.isAddFriendModalOpen = true;
    } else {
      this.isCriarGrupoModalOpen = true;
    }
  }

  setCriarGrupoModalOpen(isOpen: boolean) {
    this.isCriarGrupoModalOpen = isOpen;
    if (!isOpen) {
      this.isNovoChatModalOpen = true;
    }
  }

  setAddFriendModalOpen(isOpen: boolean) {
    this.isAddFriendModalOpen = isOpen;
    if (!isOpen) {
      this.isNovoChatModalOpen = true;
    }
  }

  async confirmarAdicionarAmigo() {
    if (!this.emailAmigoInput.trim()) {
      this.mostrarMensagem('Por favor, insira o e-mail.', 'warning');
      return;
    }
    await this.adicionarAmigoPorEmail(this.emailAmigoInput);
    this.isAddFriendModalOpen = false;
    this.emailAmigoInput = '';
    this.isNovoChatModalOpen = true;
  }

  async adicionarAmigoPorEmail(email: string) {
    if (!this.emailAtual) {
      this.mostrarMensagem('Inicie sessão para poder adicionar amigos.', 'warning');
      return;
    }

    const emailAmigo = (email || '').trim().toLowerCase();
    
    if (!emailAmigo) {
      this.mostrarMensagem('Insira o e-mail do seu amigo.', 'warning');
      return;
    }

    if (emailAmigo === this.emailAtual.toLowerCase()) {
      this.mostrarMensagem('Não se pode adicionar a si mesmo como amigo!', 'danger');
      return;
    }

    // 1. Verificar se o e-mail existe no registo de contas (já sincronizado do Supabase)
    const contas = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');
    const contaAmigo = contas.find((c: any) => c.email.toLowerCase() === emailAmigo);

    if (!contaAmigo) {
      this.mostrarMensagem('Não existe nenhuma conta registada com esse e-mail!', 'danger');
      return;
    }

    // 2. Verificar se já é amigo
    if (this.amigos.some(a => a.email.toLowerCase() === emailAmigo)) {
      this.mostrarMensagem('Este utilizador já está na sua lista de amigos!', 'warning');
      return;
    }

    // 3. Adicionar no Supabase (Mapeamento bidirecional recíproco)
    const iniciaisAmigo = this.obterIniciais(contaAmigo.nome);
    await this.supabaseService.adicionarAmigo(this.emailAtual, contaAmigo.email, contaAmigo.nome, iniciaisAmigo);
    
    const iniciaisEu = this.obterIniciais(this.nomeAtual);
    await this.supabaseService.adicionarAmigo(contaAmigo.email, this.emailAtual, this.nomeAtual, iniciaisEu);

    await this.sincronizarAmigos();
    this.mostrarMensagem(`${contaAmigo.nome} adicionado com sucesso!`, 'success');
  }

  obterIniciais(nome: string): string {
    const partes = nome.trim().split(' ');
    if (partes.length > 1) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  abrirChat(amigo: Amigo) {
    this.amigoAtivo = amigo;
    this.grupoAtivo = null;
    this.isInfoModalOpen = false;
    this.mensagens = [];
    this.carregarMensagens();
    this.iniciarIntervaloChat();
  }

  fecharChat() {
    this.pararIntervaloChat();
    this.amigoAtivo = null;
    this.grupoAtivo = null;
    this.mensagens = [];
    this.isInfoModalOpen = false;
    this.isInfoGrupoModalOpen = false;
  }

  getChaveConversa(): string {
    if (!this.amigoAtivo) return '';
    const emails = [this.emailAtual.toLowerCase().trim(), this.amigoAtivo.email.toLowerCase().trim()].sort();
    return `chat_${emails[0]}_${emails[1]}`;
  }

  async carregarMensagens() {
    const chave = this.getChaveConversa();
    if (!chave) return;
    const msgs = await this.supabaseService.obterMensagens(chave);
    if (msgs.length !== this.mensagens.length) {
      this.mensagens = msgs;
      this.rolarParaFundo(100);
    }
  }

  async enviarMensagem() {
    const texto = this.novaMensagemText.trim();
    if (!texto) return;

    if (this.amigoAtivo) {
      const chatId = this.getChaveConversa();
      this.novaMensagemText = '';
      await this.supabaseService.enviarMensagem(chatId, this.emailAtual, this.nomeAtual, texto, 'texto', null);
      await this.carregarMensagens();
    } else if (this.grupoAtivo) {
      const chatId = `chat_group_${this.grupoAtivo.id}`;
      this.novaMensagemText = '';
      await this.supabaseService.enviarMensagem(chatId, this.emailAtual, this.nomeAtual, texto, 'texto', null);
      await this.carregarMensagensGrupo();
    }
  }

  // Permite selecionar uma das listas locais para partilhar no chat
  async abrirSeletorDeListas() {
    this.listasService.init();
    const listas = this.listasService.minhasListas;

    if (listas.length === 0) {
      this.mostrarMensagem('Não tem nenhuma lista de compras criada para partilhar.', 'warning');
      return;
    }

    const botoes = listas.map(l => ({
      text: l.nome,
      icon: l.icone || 'cart-outline',
      handler: () => {
        this.enviarListaNoChat(l);
      }
    }));

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecione a Lista a Partilhar',
      buttons: [
        ...botoes,
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    await actionSheet.present();
  }

  async enviarListaNoChat(lista: Lista) {
    const listaDadosSimplificados = {
      nome: lista.nome,
      icone: lista.icone,
      cor: lista.cor,
      produtos: (lista.produtos || []).map((p: any) => ({
        nome: p.nome,
        preco: p.preco,
        tamanho: p.tamanho,
        categoria: p.categoria,
        imagemUrl: p.imagemUrl,
        quantidade: p.quantidade || 1
      }))
    };

    if (this.amigoAtivo) {
      const chatId = this.getChaveConversa();
      await this.supabaseService.enviarMensagem(chatId, this.emailAtual, this.nomeAtual, `Partilhou a lista: ${lista.nome}`, 'lista', listaDadosSimplificados);
      await this.carregarMensagens();
    } else if (this.grupoAtivo) {
      const chatId = `chat_group_${this.grupoAtivo.id}`;
      await this.supabaseService.enviarMensagem(chatId, this.emailAtual, this.nomeAtual, `Partilhou a lista: ${lista.nome}`, 'lista', listaDadosSimplificados);
      await this.carregarMensagensGrupo();
    }
  }

  // Helper para fazer scroll de forma assíncrona dando tempo ao Angular para renderizar
  rolarParaFundo(tempo: number = 100) {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, tempo);
  }

  // Importa a lista recebida na conversa para as listas locais do utilizador
  async importarListaDoChat(listaDados: any) {
    if (!listaDados) return;

    const alert = await this.alertCtrl.create({
      header: 'Importar Lista Recebida',
      message: `Deseja importar a lista "${listaDados.nome}" com ${listaDados.produtos.length} produtos para a sua conta?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Importar',
          handler: async () => {
            let nomeFinal = listaDados.nome;
            let contador = 1;

            // Evita colisão de nomes
            while (this.listasService.minhasListas.some(l => l.nome === nomeFinal)) {
              nomeFinal = `${listaDados.nome} (${contador})`;
              contador++;
            }

            const novaLista: Lista = {
              nome: nomeFinal,
              icone: listaDados.icone || 'cart-outline',
              cor: listaDados.cor || 'border-light',
              dataEdicao: 'Importada via chat',
              totalItens: listaDados.produtos.reduce((acc: number, p: any) => acc + (p.quantidade || 1), 0),
              produtos: listaDados.produtos.map((p: any) => ({
                ...p,
                riscado: false
              }))
            };

            await this.listasService.adicionarLista(novaLista);
            this.mostrarMensagem(`Lista "${nomeFinal}" importada com sucesso!`, 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarMensagem(msg: string, cor: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: cor,
      position: 'bottom',
      cssClass: 'toast-acima-do-botao'
    });
    await toast.present();
  }

  async removerAmigo(amigo: Amigo, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: 'Remover Amigo',
      message: `Deseja mesmo remover ${amigo.nome} da sua lista de amigos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: async () => {
            // Remove de forma recíproca no Supabase
            await this.supabaseService.removerAmigo(this.emailAtual, amigo.email);
            await this.supabaseService.removerAmigo(amigo.email, this.emailAtual);
            
            await this.sincronizarAmigos();
            this.mostrarMensagem(`${amigo.nome} removido da lista de amigos.`, 'success');
          }
        }
      ]
    });
    await alert.present();
  }


  // Abre o modal de informações do contacto (estilo WhatsApp)
  abrirInfoAmigo() {
    this.isInfoModalOpen = true;
  }

  // Define o estado aberto/fechado do modal de contacto
  setInfoModalOpen(isOpen: boolean) {
    this.isInfoModalOpen = isOpen;
  }

  // Devolve as mensagens do tipo 'lista' para mostrar no painel de info do contacto
  obterListasPartilhadas(): Mensagem[] {
    return this.mensagens.filter(m => m.tipo === 'lista');
  }

  async criarGrupo() {
    const nome = this.nomeGrupoInput.trim();
    if (!nome) {
      this.mostrarMensagem('Insira o nome do grupo.', 'warning');
      return;
    }

    const membrosEmails = [this.emailAtual.toLowerCase().trim()];
    this.amigos.forEach(a => {
      if (this.membrosSelecionados[a.email]) {
        membrosEmails.push(a.email.toLowerCase().trim());
      }
    });

    const iniciais = this.obterIniciais(nome);
    const novoGrupoId = 'group_' + Date.now().toString();

    // 1. Criar no Supabase
    await this.supabaseService.criarGrupo(novoGrupoId, nome, this.emailAtual, membrosEmails, iniciais);
    await this.sincronizarGrupos();

    this.isCriarGrupoModalOpen = false;
    this.nomeGrupoInput = '';
    this.membrosSelecionados = {};
    this.mostrarMensagem(`Grupo "${nome}" criado com sucesso!`, 'success');
    this.isNovoChatModalOpen = true;
  }

  abrirChatGrupo(grupo: Grupo) {
    this.grupoAtivo = grupo;
    this.amigoAtivo = null;
    this.isInfoGrupoModalOpen = false;
    this.mensagens = [];
    this.carregarMensagensGrupo();
    this.iniciarIntervaloChat();
  }

  async carregarMensagensGrupo() {
    if (!this.grupoAtivo) return;
    const chatId = `chat_group_${this.grupoAtivo.id}`;
    const msgs = await this.supabaseService.obterMensagens(chatId);
    if (msgs.length !== this.mensagens.length) {
      this.mensagens = msgs;
      this.rolarParaFundo(100);
    }
  }

  async sairDoGrupo() {
    if (!this.grupoAtivo) return;
    const grupo = this.grupoAtivo;

    const alert = await this.alertCtrl.create({
      header: 'Sair do Grupo',
      message: `Tem a certeza que deseja sair do grupo "${grupo.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          role: 'destructive',
          handler: async () => {
            const novosMembros = grupo.membros.filter(
              m => m.toLowerCase().trim() !== this.emailAtual.toLowerCase().trim()
            );

            if (novosMembros.length === 0) {
              // Se não sobra ninguém, exclui o grupo
              await this.supabaseService.excluirGrupo(grupo.id);
            } else {
              // Senão, atualiza a lista no Supabase
              await this.supabaseService.atualizarMembrosGrupo(grupo.id, novosMembros);
            }

            this.fecharChat();
            await this.sincronizarGrupos();
            this.mostrarMensagem(`Saiu do grupo "${grupo.nome}".`, 'success');
          }
        }
      ]
    });
    await alert.present();
  }


  obterNomeMembro(email: string): string {
    const contas = JSON.parse(localStorage.getItem('contasRegistadas') || '[]');
    const conta = contas.find((c: any) => c.email.toLowerCase() === email.toLowerCase());
    return conta ? conta.nome : email;
  }

  abrirInfoGrupo() {
    this.isInfoGrupoModalOpen = true;
  }

  setInfoGrupoModalOpen(isOpen: boolean) {
    this.isInfoGrupoModalOpen = isOpen;
  }

  // Devolve amigos selecionados para o grupo
  obterMembrosSelecionados(): Amigo[] {
    return this.amigos.filter(a => this.membrosSelecionados[a.email]);
  }

  // Desmarca membro do grupo
  desmarcarMembro(email: string) {
    this.membrosSelecionados[email] = false;
  }

  // Alterna a seleção de um membro para o grupo
  toggleSelecaoMembro(email: string) {
    this.membrosSelecionados[email] = !this.membrosSelecionados[email];
  }

  // --- MÉTODOS ESTILO WHATSAPP (NOVO CHAT DIALOG) ---
  abrirNovoChatModal() {
    this.isNovoChatModalOpen = true;
    this.termoPesquisa = '';
  }

  abrirNovoGrupo() {
    this.isNovoChatModalOpen = false;
    this.isCriarGrupoModalOpen = true;
  }

  abrirNovoContacto() {
    this.isNovoChatModalOpen = false;
    this.isAddFriendModalOpen = true;
  }

  selecionarItem(item: any) {
    this.isNovoChatModalOpen = false;
    if (item.tipo === 'amigo') {
      this.abrirChat(item);
    } else {
      this.abrirChatGrupo(item);
    }
  }

  obterItensFiltrados(): any[] {
    const termo = this.termoPesquisa.trim().toLowerCase();
    const amigosMapeados = this.amigos.map(a => ({ ...a, tipo: 'amigo' }));
    const gruposMapeados = this.grupos.map(g => ({ ...g, tipo: 'grupo' }));
    const todos: any[] = [...amigosMapeados, ...gruposMapeados];

    if (!termo) {
      return todos;
    }

    return todos.filter((item: any) => {
      if (item.tipo === 'amigo') {
        return item.nome.toLowerCase().includes(termo) || item.email.toLowerCase().includes(termo);
      } else {
        return item.nome.toLowerCase().includes(termo);
      }
    });
  }
}



