import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StringsService {

  private http = inject(HttpClient);

  // Objeto de tradução/mensagens com os valores padrão de fallback (sincronizados)
  public t: any = {
    welcome: {
      subtitulo: 'Faça as suas compras de forma<br>rápida, fresca e inteligente.',
      iniciarSessao: 'Iniciar Sessão',
      criarConta: 'Criar uma nova conta'
    },
    login: {
      titulo: 'Bem-vindo de volta',
      subtitulo: 'Inicie sessão para continuar a poupar',
      emailPlaceholder: 'seu@email.com',
      senhaPlaceholder: 'Palavra-passe',
      esqueceuSenha: 'Esqueceu a palavra-passe?',
      entrar: 'ENTRAR',
      naoTemConta: 'Não tem conta?',
      criarConta: 'Criar conta'
    },
    registo: {
      titulo: 'Criar Conta',
      subtitulo: 'Junte-se à BuyBuy e comece a poupar',
      nomePlaceholder: 'O seu Nome',
      emailPlaceholder: 'seu@email.com',
      senhaPlaceholder: 'Palavra-passe',
      criarConta: 'CRIAR CONTA',
      jaTemConta: 'Já tem conta?',
      iniciarSessao: 'Iniciar Sessão'
    }
  };

  constructor() {
    this.carregarStrings();
  }

  // Carrega dinamicamente a partir do ficheiro JSON
  carregarStrings() {
    this.http.get('assets/data/strings.json').subscribe({
      next: (dados: any) => {
        if (dados) {
          // Faz merge dos dados dinâmicos carregados com o fallback estático
          this.t = {
            ...this.t,
            ...dados
          };
          console.log('Strings da app carregadas com sucesso a partir do JSON.');
        }
      },
      error: (err) => {
        console.error('Erro a carregar strings externas. A usar o dicionário interno de fallback:', err);
      }
    });
  }
}
