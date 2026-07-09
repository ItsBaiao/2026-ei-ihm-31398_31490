import { Component, inject } from '@angular/core';
import { ListasService, Lista } from '../services/listas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { ProdutosService } from '../services/produtos.service';
import { DeliveryService } from '../services/delivery.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  private listasService = inject(ListasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private actionSheetCtrl = inject(ActionSheetController);
  
  public listasSelecionadas: Set<string> = new Set<string>();


  get listasNoEcra(): Lista[] {
    return this.listasService.minhasListas.filter(l => !l.arquivada);
  }

  get todasSelecionadas(): boolean {
    const ativas = this.listasNoEcra;
    return ativas.length > 0 && ativas.every(l => this.listasSelecionadas.has(l.nome));
  }

  obterCorDeEstilo(cor: string): string {
    if (!cor) return '#0da33d';
    if (cor.startsWith('#')) return cor;
    switch (cor) {
      case 'border-dark': return '#008000';   // Verde
      case 'border-light': return '#3b82f6';  // Azul
      case 'border-brown': return '#f97316';  // Laranja
      case 'border-purple': return '#a855f7'; // Roxo
      case 'border-yellow': return '#eab308'; // Amarelo
      case 'border-pink': return '#ec4899';   // Rosa
      default: return '#0da33d';
    }
  }

  obterFundoSuaveDeEstilo(cor: string): string {
    const corReal = this.obterCorDeEstilo(cor);
    return this.hexToRgba(corReal, 0.06);
  }

  private hexToRgba(hex: string, alpha: number): string {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  async ionViewWillEnter() {
    await this.listasService.init(); 

    // Verificar se há link de importação de lista
    this.route.queryParams.subscribe(async params => {
      const importData = params['import'];
      if (importData) {
        // Limpar parâmetros da URL para evitar importações repetidas ao atualizar a página
        this.router.navigate([], {
          queryParams: { import: null },
          queryParamsHandling: 'merge'
        });
        
        await this.importarListaPartilhada(importData);
      }
    });
  }

  // Descodifica os dados em Base64 e importa a lista para as listas locais
  async importarListaPartilhada(base64: string) {
    try {
      // Descodifica base64 (suporta caracteres acentuados)
      const jsonStr = decodeURIComponent(escape(atob(base64)));
      const shared = JSON.parse(jsonStr);
      
      if (!shared || !shared.n || !shared.p) return;
      
      const alert = await this.alertCtrl.create({
        header: 'Importar Lista',
        message: `Deseja importar a lista "${shared.n}" com ${shared.p.length} produtos?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Importar',
            handler: async () => {
              let nomeFinal = shared.n;
              let contador = 1;
              
              // Garante que não há nomes duplicados
              while (this.listasService.minhasListas.some(l => l.nome === nomeFinal)) {
                nomeFinal = `${shared.n} (${contador})`;
                contador++;
              }
              
              const novaLista: Lista = {
                nome: nomeFinal,
                icone: shared.i || 'cart-outline',
                cor: shared.c || 'border-light',
                dataEdicao: 'Importada agora mesmo',
                totalItens: shared.p.reduce((acc: number, prod: any) => acc + (prod.q || 1), 0),
                produtos: shared.p.map((p: any) => ({
                  nome: p.n,
                  preco: p.pr,
                  tamanho: p.t,
                  categoria: p.cat,
                  imagemUrl: p.img,
                  quantidade: p.q,
                  riscado: false
                }))
              };
              
              await this.listasService.adicionarLista(novaLista);
              
              const toast = await this.toastCtrl.create({
                message: `Lista "${nomeFinal}" importada com sucesso!`,
                duration: 3000,
                color: 'success',
                icon: 'download-outline',
                position: 'top'
              });
              await toast.present();
            }
          }
        ]
      });
      await alert.present();
    } catch (err) {
      console.error('Erro ao importar lista:', err);
      const toast = await this.toastCtrl.create({
        message: 'O link de partilha é inválido ou está corrompido.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  async confirmarExclusaoLista(nome: string) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir Lista',
      message: `Tem a certeza que deseja eliminar a lista "${nome}" permanentemente?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.listasService.minhasListas = this.listasService.minhasListas.filter(l => l.nome !== nome);
            await this.listasService.guardarAlteracoes();
            this.mostrarToast(`Lista "${nome}" excluída com sucesso!`, 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'top'
    });
    await toast.present();
  }

  // Métodos adicionados para seleção em lote (Modo Gmail permanente)
  toggleSelecaoLista(nome: string) {
    if (this.listasSelecionadas.has(nome)) {
      this.listasSelecionadas.delete(nome);
    } else {
      this.listasSelecionadas.add(nome);
    }
  }

  cliqueNaLista(lista: Lista) {
    this.router.navigate(['/lista-detalhes', lista.nome]);
  }

  toggleSelecionarTodas() {
    if (this.todasSelecionadas) {
      this.listasSelecionadas.clear();
    } else {
      this.listasNoEcra.forEach(l => this.listasSelecionadas.add(l.nome));
    }
  }

  async arquivarSelecionadas() {
    if (this.listasSelecionadas.size === 0) return;
    const selecionadas = Array.from(this.listasSelecionadas);

    const alert = await this.alertCtrl.create({
      header: 'Arquivar Listas',
      message: `Deseja arquivar as ${selecionadas.length} listas selecionadas?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Arquivar',
          handler: async () => {
            this.listasService.minhasListas.forEach(l => {
              if (this.listasSelecionadas.has(l.nome)) {
                l.arquivada = true;
              }
            });
            await this.listasService.guardarAlteracoes();
            this.mostrarToast(`${selecionadas.length} listas arquivadas com sucesso!`, 'success');
            this.listasSelecionadas.clear();
          }
        }
      ]
    });
    await alert.present();
  }

  async excluirSelecionadas() {
    if (this.listasSelecionadas.size === 0) return;
    const selecionadas = Array.from(this.listasSelecionadas);

    const alert = await this.alertCtrl.create({
      header: 'Excluir Listas',
      message: `Deseja eliminar permanentemente as ${selecionadas.length} listas selecionadas?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.listasService.minhasListas = this.listasService.minhasListas.filter(
              l => !this.listasSelecionadas.has(l.nome)
            );
            await this.listasService.guardarAlteracoes();
            this.mostrarToast(`${selecionadas.length} listas excluídas com sucesso!`, 'success');
            this.listasSelecionadas.clear();
          }
        }
      ]
    });
    await alert.present();
  }
}