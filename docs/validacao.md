# Plano de validação e demonstração

## Verificações técnicas executadas

Em 22/09/2026, foram executados testes de integração com Node.js 24 e SQLite em memória. O relatório abaixo descreve cenários realmente exercitados; não representa avaliação com usuários reais.

| Verificação | Evidência |
| --- | --- |
| Cadastro, sessão, senha e logout | Teste automatizado de clientes e profissionais, senha armazenada com hash, duplicidade de e-mail e credenciais inválidas |
| Fluxo por anúncio | Teste HTTP de publicação com imagem, interesse, texto e imagem no chat, contratação, conclusão e avaliação |
| Contratação direta | Serviço restrito aos participantes e ausente do catálogo público |
| Controle de acesso | Profissional não publica serviço; terceiros não acessam chat nem alteram serviço |
| Validação de entradas | Valores negativos/inválidos, datas passadas/impossíveis, categoria, descrição e imagens inválidas rejeitados |
| Perfil e notificações | Portfólio persistido, aviso direcionado ao destinatário e marcação de leitura |
| Sessão e origem | Sessão expirada bloqueada e origem externa recusada |
| Estados e avaliações | Não há contratação sem negociação, salto de etapa, reabertura ou avaliação duplicada |
| Origem do frontend local | Login com origem explicitamente autorizada; JSON de formato inválido recusado |
| Build | Geração da aplicação de produção com Vite |

Reproduzir com `npm test` e `npm run build`, ou `./iniciar.ps1 test` e `./iniciar.ps1 build` no PowerShell com o runtime alternativo.

## Inspeção no navegador

Foram verificados login como cliente e profissional, publicação pela interface, busca combinada por Pintura e “itajuba”, criação de negociação, envio de mensagem pelo profissional, recebimento na conta do cliente e confirmação da contratação. O serviço criado nessa inspeção está identificado como “Demonstração · Pintura do escritório” e permanece na base local para demonstração. O serviço e a mensagem são fictícios.

Foram inspecionadas a página inicial em viewport 1440 × 1000 e a listagem e o chat em 390 × 844. A listagem no celular não apresentou rolagem horizontal. Essas verificações não substituem testes em dispositivos reais, Safari, Firefox, leitor de tela ou auditoria completa de acessibilidade. As funcionalidades de conclusão e avaliação também são cobertas pelos testes HTTP.

## Roteiro de demonstração para a banca

1. Iniciar o projeto e apresentar a página inicial e as especialidades.
2. Entrar como cliente ou criar uma conta. Publicar um serviço com título, cidade, descrição, orçamento, prazo e foto menor que 500 KB.
3. Em outro navegador/perfil, entrar como profissional. Editar descrição e portfólio com fotos autorizadas.
4. Buscar o serviço por cidade e especialidade. Demonstrar o estado vazio usando um termo que não exista.
5. Abrir os detalhes, demonstrar interesse e enviar uma mensagem e uma imagem.
6. Voltar ao cliente, abrir notificações e a conversa. Responder e confirmar a contratação.
7. Em Meus serviços, conferir “Em execução”, concluir e publicar nota e comentário.
8. Consultar o perfil público para ver a avaliação e a média atualizada.
9. Demonstrar solicitação direta em outro perfil, sem anúncio público.
10. Recarregar o navegador para mostrar persistência e apresentar a versão mobile.

Não enviar fotos ou informações reais sem autorização. Não avaliar o profissional fictício como se houvesse uma obra real; deixe claro que todo o cenário é demonstrativo.

## Validação de usabilidade a realizar

Recrutar participantes que representem os dois papéis e registrar as condições de participação. Definir previamente a amostra e os critérios de análise com o orientador. Não há resultados de usuários coletados nesta implementação.

| Tarefa | Papel | Sucesso observado |
| --- | --- | --- |
| Criar conta e completar perfil | Ambos | Cadastro concluído sem ajuda |
| Publicar necessidade de reforma | Cliente | Todos os detalhes essenciais corretamente cadastrados |
| Encontrar serviço compatível | Profissional | Localizar anúncio usando especialidade e cidade |
| Escolher profissional pelo perfil | Cliente | Explicar escolha com descrição, portfólio ou avaliação |
| Combinar escopo pelo chat | Ambos | Enviar, receber e localizar mensagens |
| Contratar e concluir | Cliente | Entender a mudança de estado e registrar entrega |
| Avaliar o serviço | Cliente | Encontrar avaliação e publicar nota e comentário |

Registrar por tarefa: tempo, conclusão total/parcial/não concluída, erros, pedidos de ajuda, dispositivo, comentários e dificuldade de 1 a 5. Não inventar resultados ou completar campos sem observação.

Modelo de registro:

| Participante anonimizado | Papel | Tarefa | Dispositivo | Tempo | Resultado | Dificuldade | Observações |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A preencher após coleta | | | | | | | |

## Acessibilidade e responsividade pendentes

Verificar navegação por Tab e Shift+Tab, fechamento de diálogos por Escape e retorno de foco, uso com leitor de tela, contraste WCAG, zoom de 200%, orientação horizontal e funcionamento em larguras de 320 e 768 pixels. Registrar problemas encontrados e correções antes de afirmar conformidade.

## Desempenho a medir

Executar medições com ambiente descrito e base representativa: tempo de carregamento, tamanho dos recursos, latência de listagem e mensagens, crescimento do banco com imagens e comportamento com várias sessões. Não usar o tempo de build como medida de desempenho do usuário. A implementação usa polling e consultas síncronas; não há ensaio de carga nesta entrega.

## Revisão visual para marketplace

A página inicial passou a priorizar descoberta: navegação superior, busca por serviço e cidade, categorias, vitrine de profissionais e oportunidades de trabalho. Os cards usam a primeira foto real do portfólio quando disponível; na ausência de foto, mostram uma ilustração de categoria explicitamente identificada. Não foram adicionadas avaliações ou certificações fictícias.

Na revisão, a busca principal por “pintura” e “itajuba” retornou o perfil esperado. A interface foi inspecionada em 1440 × 1000 e 390 × 844, sem rolagem horizontal da página no celular e sem erros de console observados. As regras da API não foram alteradas.
