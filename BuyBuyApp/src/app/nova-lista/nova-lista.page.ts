import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ListasService } from '../services/listas.service';

@Component({
  selector: 'app-nova-lista',
  templateUrl: './nova-lista.page.html',
  styleUrls: ['./nova-lista.page.scss'],
  standalone: false
})
export class NovaListaPage implements OnInit {
  public nomeDaLista: string = '';
  public iconeEscolhido: string = 'cart-outline';
  public corEscolhida: string = 'border-dark';
  public isEditMode: boolean = false;
  public nomeListaOriginal: string = '';
  public isColorModalOpen = false;
  public hueValue = 0;
  public lightnessValue = 50;
  public corPersonalizada = '#FF0000';

  public lojaSelecionada: any;

  constructor(private router: Router, private route: ActivatedRoute, private listasService: ListasService) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      if (params['editar']) {
        this.isEditMode = true;
        this.nomeListaOriginal = params['editar'];
        await this.carregarDadosDaLista();
      }
    });
  }

  ionViewWillEnter() { this.lojaSelecionada = this.listasService.lojaSelecionadaGlobal; }

  async carregarDadosDaLista() {
    await this.listasService.init();
    const lista = this.listasService.minhasListas.find(l => l.nome === this.nomeListaOriginal);
    if (lista) {
      this.nomeDaLista = lista.nome;
      this.iconeEscolhido = lista.icone;
      this.corEscolhida = lista.cor;
    }
  }

  selecionarIcone(icone: string) { this.iconeEscolhido = icone; }
  selecionarCor(cor: string) { this.corEscolhida = cor; }
  setModalOpen(isOpen: boolean) { this.isColorModalOpen = isOpen; }

  atualizarCorPeloSlider(event: any) { 
    this.hueValue = event.target.value; 
    this.atualizarCorHex();
  }
  
  atualizarLuminosidadePeloSlider(event: any) { 
    this.lightnessValue = event.target.value; 
    this.atualizarCorHex();
  }

  atualizarCorHex() {
    const h = this.hueValue;
    const l = this.lightnessValue;
    const a = 100 * Math.min(l / 100, 1 - l / 100) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    this.corPersonalizada = `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  confirmarCorModal() { 
    this.corEscolhida = this.corPersonalizada;
    this.setModalOpen(false); 
  }

  async guardarLista() {
    if (this.nomeDaLista.trim() === '') return;
    
    if (this.isEditMode) {
      // MODO EDIÇÃO: Atualizamos apenas as características visuais, os produtos ficam intocáveis!
      const index = this.listasService.minhasListas.findIndex(l => l.nome === this.nomeListaOriginal);
      
      if (index > -1) {
        this.listasService.minhasListas[index].nome = this.nomeDaLista;
        this.listasService.minhasListas[index].icone = this.iconeEscolhido;
        this.listasService.minhasListas[index].cor = this.corEscolhida;
        this.listasService.minhasListas[index].dataEdicao = 'Editada agora mesmo';
        // Repara: não mexemos no .produtos nem no .totalItens!
      }
    } else {
        // MODO CRIAÇÃO: Criamos tudo do zero, com 0 itens e array de produtos vazio
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
    
    await this.listasService.guardarAlteracoes();
    this.router.navigate(['/tabs/tab1']);
  }
}