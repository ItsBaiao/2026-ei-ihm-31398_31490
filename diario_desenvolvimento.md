# DIÁRIO DE DESENVOLVIMENTO


FASE 1: INÍCIO DO PROJETO E SETUP LOCAL (01/06 a 02/06)
Duração: 4h
- Nota: O desenvolvimento inicial foi realizado em ambiente local para testes de arquitetura. O rastreamento no repositório Git (primeiros commits) foi iniciado a 03/06, após a estabilização da estrutura base.
- Tarefas Realizadas: Setup inicial do projeto Ionic com template 'tabs'. Criação da estrutura base de pastas e ficheiros. Implementação da interface das páginas de Boas-vindas e Login com base no protótipo do Figma.
- Dificuldades Encontradas: Ajustar o CSS para que a aplicação ficasse com o visual exato do protótipo desenhado no Figma.
- Solução Aplicada: Utilização de variáveis globais no ficheiro 'variables.scss' para manter a paleta de cores (verde) consistente em toda a aplicação.

---

FASE 2: DESENVOLVIMENTO INTERMÉDIO (03/06)
Duração: 5h
- Tarefas Realizadas: Início do versionamento no Git. Implementação da leitura do catálogo em JSON. Criação do formulário dinâmico. Configuração do routing com passagem de parâmetros entre a página principal e os detalhes da lista de compras.
- Dificuldades Encontradas: Passar os dados dinâmicos da lista clicada para a página de detalhes sem perder a informação no processo.
- Solução Aplicada: Utilização da classe 'ActivatedRoute' do Angular para capturar o parâmetro (nome da lista) diretamente no URL e ir buscar os dados correspondentes ao serviço centralizado.

---

FASE 3: CONTINUAÇÃO E REFINAMENTO VISUAL (03/06 a 04/06)
Duração: 3h
- Tarefas Realizadas: Implementação do bloqueio de orientação de ecrã nativo. Criação do design das listas de produtos separadas por categorias dinâmicas.
- Dificuldades Encontradas: Garantir que a app não rodava o ecrã horizontalmente, o que desformatava o design estipulado.
- Solução Aplicada: Utilização de plugins nativos (Capacitor Screen Orientation) para forçar e bloquear a aplicação no 'portrait mode'.

---

FASE 4: RETA FINAL (04/06 a 05/06)
Duração: 5h
- Tarefas Realizadas: 
  1. Tarefa M3: Implementação do comportamento Swipe ('ion-item-sliding') para riscar produtos da lista. 
  2. Requisito Nativo: Integração do plugin '@capacitor/network' para deteção contínua do modo Offline. 
  3. Tarefa M2: Criação do Modo Loja (GPS/Navegação), modal com mapa ilustrativo da loja, e sincronização de estado. 
  4. Finalização: Substituição do ícone genérico do Android pelo logótipo oficial da app e geração da build final (.APK).
- Dificuldades Encontradas: 
  1. O emulador não estava a assumir a quebra de ligação à internet simulada via browser.
  2. Falta de sincronização visual entre os produtos riscados no ecrã da Lista e no ecrã do Modo Loja ao retroceder.
- Soluções Aplicadas: 
  1. Implementação híbrida do detetor nativo do Capacitor em conjunto com os eventos web convencionais ('window.addEventListener'), garantindo que o aviso offline dispara em qualquer cenário.
  2. Utilização do lifecycle hook 'ionViewWillEnter' do Ionic para forçar o recarregamento dos dados da memória local sempre que as páginas ficam ativas, mantendo o estado 100% sincronizado.

---

FASE 5: IMPLEMENTAÇÃO DE REQUISITOS ADICIONAIS (05/07)
Duração: 1.5h
- Tarefas Realizadas:
  1. Refatoração completa dos formulários de Login e Registo de Template-driven Forms para Reactive Forms (`FormGroup`/`FormBuilder`), implementando validações estruturadas e em tempo real para cumprimento do Requisito Adicional 6.
  2. Isolamento de strings de interface (Requisito Adicional 2) através de `StringsService` centralizado que consome dinamicamente um dicionário a partir do ficheiro `strings.json` para as páginas de boas-vindas, login e registo.
- Dificuldades Encontradas: Garantir que os módulos de rotas e declarações Angular reconhecessem a nova diretiva de formulários reativos e gerir as quebras de linha (<br>) no HTML ao carregar dados dinâmicos das strings.
- Solução Aplicada: Integração do `ReactiveFormsModule` nos imports globais em `LoginPageModule` e `RegistoPageModule` e uso do binding `[innerHTML]` para renderizar tags de formatação nativas no Angular.

---

FASE 6: SUPORTE A QUANTIDADES E REDE SOCIAL COM CHAT (06/07)
Duração: 2.5h
- Tarefas Realizadas:
  1. Implementação de suporte a quantidades acumuladas no catálogo e carrinho, exibindo "2x" e permitindo aumentar/diminuir quantidades diretamente na lista.
  2. Implementação de preço total dinâmico por linha (multiplicando preço unitário pela quantidade) e alerta de confirmação de eliminação quando a quantidade é reduzida a zero.
  3. Criação da Tab 4 (Amigos & Mensagens) permitindo adicionar amigos de forma recíproca através de emails registados, e chat interativo com simulação de respostas inteligentes de bot.
  4. Integração da funcionalidade de partilha direta de listas de compras inteiras dentro das mensagens de chat com importador automático de um clique.
  5. Refatoração do sistema de partilha geral de listas por link codificado em Base64 com tratamento de fallback robusto para contextos inseguros (insecure contexts em conexões HTTP locais).
- Dificuldades Encontradas:
  1. O bloqueio do `navigator.clipboard` em conexões HTTP locais de desenvolvimento (como emulação Capacitor com live reload em rede externa) impedia o funcionamento da cópia.
  2. Gerir mensagens e amigos de forma a que, quando dois utilizadores locais conversam, ambos tenham acesso à mesma base de dados de chat de forma bidirecional.
- Soluções Aplicadas:
  1. Criação de um método de fallback que utiliza um elemento `textarea` oculto no DOM para forçar a cópia, além de um modal de cópia manual de segurança.
  2. Desenho de chaves de storage compostas e ordenadas alfabeticamente para as conversas (ex: `chat_email1_email2`), permitindo que a troca de conta revele o histórico de chat idêntico para ambos os participantes.
