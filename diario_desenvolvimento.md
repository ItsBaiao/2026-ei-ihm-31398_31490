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
