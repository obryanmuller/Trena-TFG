# Base para o relatório de desenvolvimento

Este documento oferece conteúdo técnico inicial para a redação do TFG. Não é uma monografia final nem um relato de pesquisa com participantes. O autor deve revisar a precisão, acrescentar referencial teórico com fontes conferidas e adaptar às normas da instituição.

## Problema e objetivo

A proposta identifica uma contratação de pequenos serviços de construção civil baseada em indicações informais, com dificuldade para encontrar profissionais, comparar informações e manter um histórico claro da negociação. A TRENA organiza anúncios, perfis, portfólios, mensagens, estados de execução e avaliações em uma aplicação web responsiva.

O objetivo do protótipo é demonstrar que esse fluxo pode ser implementado de forma integrada, conectando clientes e profissionais. Uma melhoria percebida em transparência, confiança ou eficiência deve ser avaliada empiricamente e não pode ser inferida somente da existência do software.

## Método de desenvolvimento

Os objetivos e o cronograma da proposta foram convertidos em requisitos verificáveis. O documento de descoberta apoiou a interpretação da marca e dos fluxos; hipóteses adicionais foram separadas do escopo formal. A modelagem usa entidades relacionais e um ciclo do serviço com quatro estados. A implementação divide interface React, API Express e persistência SQLite.

O desenvolvimento incluiu cadastro e sessão, publicação, filtros, perfis, contratação direta, chat, estados, avaliações e notificações internas. Testes de integração exercitam requisições HTTP reais contra uma base isolada. A inspeção em navegador complementa esses testes verificando controles e apresentação.

## Decisões e desafios

SQLite e Node.js 24 permitem executar localmente sem configurar infraestrutura externa. Imagens em data URLs simplificam o armazenamento no protótipo, ao custo de maior tamanho da base e das respostas. A atualização por polling atende à demonstração de comunicação com menor complexidade operacional, mas gera consultas periódicas e não substitui push.

As regras de autorização são aplicadas na API, pois ocultar um botão na interface não protege dados. Avaliações dependem de serviços concluídos e pertencentes ao cliente, impedindo comentários arbitrários sobre profissionais. A interface mantém em destaque orçamento e prazo, mas não processa pagamentos.

Durante a integração local, foi identificada uma colisão com um serviço existente na porta 3001. A API passou para 4311. O frontend de desenvolvimento recebeu uma origem explicitamente permitida para preservar a validação das requisições de escrita. O comando para Windows seleciona Node 24 porque o Node padrão encontrado na máquina era 20.11.1.

## Resultados técnicos disponíveis

O projeto contém funcionalidades integradas, persistência local, testes reproduzíveis e documentação de rastreabilidade. O arquivo de validação registra a execução efetiva dos testes. Esses resultados demonstram funcionamento nos cenários cobertos, não aprovação por usuários reais, certificação de acessibilidade, segurança de produção ou capacidade de atender grandes volumes.

## Análise empírica a realizar

Recrutar participantes que representem clientes e profissionais, apresentar o consentimento, aplicar as tarefas descritas no plano de validação e registrar sucesso, dificuldades, tempo e comentários. Não coletar dados pessoais desnecessários. Relacionar cada achado à tarefa e ao requisito correspondente. Informar tamanho da amostra, condições do teste, limitações e possíveis vieses.

## Evolução prevista

As evoluções da proposta são pagamento, geolocalização e planos premium. Antes da disponibilização pública, priorizar recuperação de conta, confirmação de e-mail, moderação, privacidade, cancelamento e encerramento bilateral do serviço. Melhorias técnicas incluem arquivos em armazenamento de objetos, paginação, filtros no servidor, transações para operações compostas, observabilidade e notificações via WebSocket ou SSE.

## Lista de conclusão acadêmica

- Revisar introdução e justificativa com o orientador.
- Conferir e desenvolver o referencial teórico, sem referências ou citações inventadas.
- Incluir os modelos e capturas da versão efetivamente avaliada.
- Executar a validação com usuários e apresentar resultados reais.
- Discutir limitações técnicas e metodológicas.
- Escrever conclusão, referências, anexos e roteiro de defesa.
