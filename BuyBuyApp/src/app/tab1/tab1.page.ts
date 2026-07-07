import { Component, inject } from '@angular/core';
import { ListasService, Lista } from '../services/listas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';

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

  get temListasArquivadas(): boolean {
    return this.listasService.minhasListas.some(l => l.arquivada);
  }

  // O nosso Getter para as listas - exclui as listas arquivadas da vista principal
  get listasNoEcra(): Lista[] {
    return this.listasService.minhasListas.filter(l => !l.arquivada);
  }

  get todasSelecionadas(): boolean {
    const ativas = this.listasNoEcra;
    return ativas.length > 0 && ativas.every(l => this.listasSelecionadas.has(l.nome));
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
                position: 'bottom',
                cssClass: 'toast-acima-do-botao'
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
        position: 'bottom',
        cssClass: 'toast-acima-do-botao'
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

  async verListasArquivadas() {
    const listasArquivadas = this.listasService.minhasListas.filter(l => l.arquivada);
    if (listasArquivadas.length === 0) {
      this.mostrarToast('Não tem nenhuma lista arquivada.', 'warning');
      return;
    }

    const botoes = listasArquivadas.map(l => ({
      text: l.nome,
      icon: l.icone || 'cart-outline',
      handler: () => {
        this.mostrarOpcoesListaArquivada(l);
      }
    }));

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Listas Arquivadas',
      buttons: [
        ...botoes,
        { text: 'Cancelar', role: 'cancel', icon: 'close' }
      ]
    });
    await actionSheet.present();
  }

  async mostrarOpcoesListaArquivada(lista: Lista) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Opções: ${lista.nome}`,
      buttons: [
        {
          text: 'Desarquivar (Restaurar)',
          icon: 'folder-open-outline',
          handler: async () => {
            lista.arquivada = false;
            await this.listasService.guardarAlteracoes();
            this.mostrarToast(`Lista "${lista.nome}" restaurada com sucesso!`, 'success');
          }
        },
        {
          text: 'Excluir Permanentemente',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.confirmarExclusaoLista(lista.nome);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    await actionSheet.present();
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'bottom',
      cssClass: 'toast-acima-do-botao'
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