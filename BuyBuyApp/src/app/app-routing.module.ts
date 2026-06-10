import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    // Quando a app arranca (caminho vazio), vai direta para o Welcome
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registo',
    loadChildren: () => import('./registo/registo.module').then( m => m.RegistoPageModule)
  },
  {
    // AQUI ESTÁ A MAGIA QUE FALTAVA: A rota para as tabs!
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'lista-detalhes/:nome', // <-- Adiciona isto
    loadChildren: () => import('./lista-detalhes/lista-detalhes.module').then( m => m.ListaDetalhesPageModule)
  },
  {
    path: 'nova-lista',
    loadChildren: () => import('./nova-lista/nova-lista.module').then( m => m.NovaListaPageModule)
  },
  {
    path: 'loja-navegacao/:nome',
    loadChildren: () => import('./loja-navegacao/loja-navegacao.module').then( m => m.LojaNavegacaoPageModule)
  },
  {
  path: 'produto-detalhes/:id', // <-- O truque está neste /:id
  loadChildren: () => import('./produto-detalhes/produto-detalhes.module').then( m => m.ProdutoDetalhesPageModule)
  },
  {
    path: 'escolha-loja',
    loadChildren: () => import('./escolha-loja/escolha-loja.module').then( m => m.EscolhaLojaPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }