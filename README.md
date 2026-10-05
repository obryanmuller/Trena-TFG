# TRENA

Protótipo funcional do TFG de Bryan Muller da Silva — UNIFEI. Plataforma web para conectar clientes e profissionais de pequenos reparos e reformas residenciais. Implementação baseada em `TFG - Proposta Bryan Muller.docx`; o documento de descoberta complementa a identidade e o contexto do produto.

## Executar neste computador

As dependências já foram instaladas. Na pasta do projeto, abra o PowerShell e execute:

```powershell
.\iniciar.ps1
```

O script procura Node.js 24 ou superior e, neste computador, pode usar o runtime disponível no Codex. Não altera a instalação global. Se a política do PowerShell impedir o script, use um terminal com Node.js 24 e os comandos npm abaixo, sem alterar a política da máquina.

Abra http://127.0.0.1:5173. A API usa http://127.0.0.1:4311. Mantenha o terminal aberto; Ctrl+C encerra os processos. A porta 3001 foi evitada porque já estava ocupada neste computador.

## Executar em outro computador

Requer Node.js 24 ou superior, npm e navegador moderno.

```sh
npm ci
npm run dev
```

O comando de desenvolvimento cria a base de demonstração se o banco estiver vazio. Nenhum serviço externo ou chave é necessário. As fontes do Google Fonts são opcionais; sem internet, a interface usa a fonte de fallback.

## Contas de demonstração

| Papel | E-mail | Senha |
| --- | --- | --- |
| Cliente | cliente@trena.demo | Trena@2026 |
| Profissional | profissional@trena.demo | Trena@2026 |

Também é possível criar contas pela interface. Os perfis e anúncios iniciais são fictícios. Não há avaliações, certificações ou fotos de obras inventadas na base inicial. O portfólio pode ser preenchido pelo profissional.

Para demonstrar os dois papéis simultaneamente, use navegadores ou perfis separados. Abas do mesmo navegador compartilham a sessão. Nunca use essas contas públicas de demonstração para dados reais.

## O que está implementado

- Cadastro e login de clientes e profissionais, sessão persistente e edição do perfil.
- Portfólio com até seis imagens por profissional.
- Publicação de serviços com descrição, especialidade, cidade, orçamento, prazo e fotos.
- Busca textual e filtros de especialidade e região em serviços e profissionais.
- Solicitação direta a um profissional, sem anúncio público.
- Chat entre participantes de um serviço com texto e imagem.
- Contratação, acompanhamento e conclusão do serviço pelo cliente.
- Avaliação única, com nota e comentário, permitida após a conclusão.
- Notificações internas de interesse, mensagens, contratação, conclusão e avaliação.
- Layout responsivo, controles rotulados, foco visível e diálogos nativos.

Chat é atualizado por polling a cada 3 segundos. Notificações e conversas são atualizadas a cada 4 segundos com a página aberta. Não são notificações push do sistema operacional.

## Build e testes

```sh
npm test
npm run build
npm start
```

No Windows com o runtime alternativo:

```powershell
.\iniciar.ps1 test
.\iniciar.ps1 build
.\iniciar.ps1 start
```

Após o build, `npm start` serve a interface e a API em http://127.0.0.1:4311. Para criar dados fictícios nessa execução, configure `DEMO_SEED=1` em `.env` antes de iniciar um banco vazio. Consulte `.env.example`. Para uma base separada, configure `DB_PATH`; o comando de desenvolvimento semeia somente bancos vazios.

O banco fica em `data/trena.sqlite`, ignorado pelo Git. Os testes usam SQLite em memória e não alteram os dados de demonstração. A biblioteca SQLite é nativa do Node 24. Em publicação com HTTPS, configure `NODE_ENV=production`; isso ativa cookies Secure. Em desenvolvimento HTTP, não use essa variável.

## Estrutura

```text
src/main.jsx          Interface React, páginas e componentes
src/styles.css        Identidade visual e regras responsivas
server/app.mjs        API, validações e regras de autorização
server/db.mjs         Schema SQLite, senhas e dados fictícios
server/index.mjs      Inicialização do servidor
scripts/dev.mjs       Inicialização conjunta de Vite e API
iniciar.ps1           Inicialização com Node 24 no Windows
public/favicon.svg    Símbolo da aplicação
tests/api.test.mjs   Testes de integração HTTP
docs/               Requisitos, modelagem, validação e apoio ao relatório
```

## Documentação acadêmica

- [Rastreabilidade da proposta](docs/requisitos.md)
- [Arquitetura, modelo de dados e fluxos](docs/arquitetura.md)
- [Plano de validação e roteiro de demonstração](docs/validacao.md)
- [Base para o relatório de desenvolvimento](docs/relatorio.md)

O protótipo implementa os fluxos de software previstos. A conclusão do TFG ainda depende da validação com usuários, análise dos resultados e redação/revisão da monografia com o orientador. Não há evidência empírica suficiente para afirmar melhoria de eficiência ou confiança apenas por ter implementado o sistema.

Pagamentos, geolocalização e plano premium são evoluções futuras da proposta. PWA instalável e verificação documental aparecem no documento de descoberta como hipóteses adicionais e não foram implementados. Não há selo de profissional verificado sem um processo real de verificação.

