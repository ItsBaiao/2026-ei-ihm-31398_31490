import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; // Adicionado ActivatedRoute
import { ListasService } from '../services/listas.service';

@Component({
  selector: 'app-nova-lista',
  templateUrl: './nova-lista.page.html',
  styleUrls: ['./nova-lista.page.scss'],
  standalone: false
})
export class NovaListaPage implements OnInit {

  // Variáveis do formulário
  public nomeDaLista: string = '';
  public iconeEscolhido: string = 'cart-outline';
  public corEscolhida: string = 'border-dark';

  // VARIÁVEIS NOVAS PARA A EDIÇÃO
  public isEditMode: boolean = false;
  public nomeListaOriginal: string = '';

  // Variáveis da Modal de Cores
  public isColorModalOpen = false;
  public hueValue = 0;
  public lightnessValue = 50;
  public corPersonalizada = '#FF0000';

  public lojaSelecionada: any;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, // Injetado para ler os parâmetros
    private listasService: ListasService
  ) {}

  async ngOnInit() {
    // Fica à escuta: "Será que fui chamado com um nome para editar?"
    this.route.queryParams.subscribe(async params => {
      if (params['editar']) {
        this.isEditMode = true;
        this.nomeListaOriginal = params['editar'];
        await this.carregarDadosDaLista();
      } else {
        // Se não trouxer nada, garante que entra em modo de criação limpo
        this.isEditMode = false;
        this.nomeDaLista = '';
        this.iconeEscolhido = 'cart-outline';
        this.corEscolhida = 'border-dark';
      }
    });
  }

  ionViewWillEnter() {
    this.lojaSelecionada = this.listasService.lojaSelecionadaGlobal;
  }

  // Função nova que vai ao cofre buscar as cores e ícones da lista a editar
  async carregarDadosDaLista() {
    await this.listasService.init();
    const listaParaEditar = this.listasService.minhasListas.find(l => l.nome === this.nomeListaOriginal);
    
    if (listaParaEditar) {
      this.nomeDaLista = listaParaEditar.nome;
      this.iconeEscolhido = listaParaEditar.icone;
      this.corEscolhida = listaParaEditar.cor;
    }
  }

  selecionarIcone(icone: string) { this.iconeEscolhido = icone; }
  selecionarCor(cor: string) { this.corEscolhida = cor; }
  setModalOpen(isOpen: boolean) { this.isColorModalOpen = isOpen; }
  atualizarCorPeloSlider(event: any) { this.hueValue = event.target.value; }
  atualizarLuminosidadePeloSlider(event: any) { this.lightnessValue = event.target.value; }
  confirmarCorModal() { this.setModalOpen(false); }

  // O nosso botão inteligente
  async guardarLista() {
    if (this.nomeDaLista.trim() !== '') {
      
      if (this.isEditMode) {
        // MODO EDIÇÃO: Atualiza a lista existente
        const index = this.listasService.minhasListas.findIndex(l => l.nome === this.nomeListaOriginal);
        if (index > -1) {
          this.listasService.minhasListas[index].nome = this.nomeDaLista;
          this.listasService.minhasListas[index].icone = this.iconeEscolhido;
          this.listasService.minhasListas[index].cor = this.corEscolhida;
          this.listasService.minhasListas[index].dataEdicao = 'Editada agora mesmo';
          
          await this.listasService.guardarAlteracoes();
        }
      } else {
        // MODO CRIAÇÃO: O que tu já tinhas antes
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
    }
    this.router.navigate(['/tabs/tab1']);
  }
}