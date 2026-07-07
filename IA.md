USO DE INTELIGÊNCIA ARTIFICIAL

Ao longo do desenvolvimento deste projeto, recorri a ferramentas de Inteligência Artificial (LLM) estritamente como assistentes de codificação e otimização de tempo, garantindo que a lógica e a arquitetura da aplicação refletem a minha própria visão do design (desenhado no Figma). A ajuda incidiu nos seguintes pontos:

1. Otimização de Interface (IHM): Auxílio na transcrição do design estático para código CSS/SCSS (ex: cartões de navegação, modal de cores e botões dinâmicos).
2. Funcionalidade M3 (Swipe Offline): Consulta da documentação do Ionic via IA para a implementação rápida do `<ion-item-sliding>` e gestão de estado assíncrono com o LocalStorage.
3. Integração Nativa (Requisito 12): Ajuda na configuração do plugin `@capacitor/network` para deteção de falhas de rede diretamente no hardware do dispositivo, de forma a acionar o modo offline.
4. Sincronização de Estado: Utilização do ciclo de vida do Ionic (`ionViewWillEnter` e `ionViewDidEnter`) sugerido pela IA para garantir a atualização em tempo real entre a lista de compras e o Modo Loja (M2).
5. Formulários Reativos (Requisito Adicional 6): Refatoração dos ecrãs de Login e Registo utilizando `FormBuilder` e `FormGroup` com validações estruturadas do Angular.
6. Isolamento de Strings (Requisito Adicional 2): Criação de `StringsService` e do ficheiro `strings.json` para desacoplar as strings da interface das páginas `welcome`, `login` e `registo`.
7. Controlo de Quantidades e Preços Dinâmicos: Ajuda na criação da fórmula de cálculo de preços baseada no parsing de strings monetárias e na lógica de confirmação ao atingir quantidade zero.
8. Rede Social e Chat Interativo: Apoio no desenho de chaves de armazenamento compostas no LocalStorage para garantir conversas bidirecionais entre utilizadores locais e na lógica de codificação Base64 para partilha rápida de dados via URL.

Todas as sugestões de código foram analisadas, adaptadas e integradas manualmente por mim para garantir a coesão da aplicação.