# Requisitos e rastreabilidade da TRENA

A proposta formal de TFG é a fonte principal do escopo. As hipóteses de produto do documento de descoberta orientam a experiência, mas não substituem os objetivos acadêmicos. O trecho sobre Business Intelligence e PMEs presente na descoberta diverge do restante do documento e não foi usado como requisito.

## Requisitos funcionais

| ID | Compromisso da proposta | Implementação | Critério de aceite |
| --- | --- | --- | --- |
| RF01 | Cadastro de clientes e profissionais | Login e cadastro com nome, e-mail, senha, cidade e papel; especialidade e descrição profissional | Usuário cadastra, entra, sai e recupera sessão após recarregar |
| RF02 | Descrição e portfólio profissional | Edição do perfil e envio de imagens; perfil público | Fotos e descrição persistem no SQLite e aparecem para clientes |
| RF03 | Publicar serviços com descrição, orçamento, prazo e imagens | Formulário com validação no navegador e na API | Anúncio válido aparece na busca e em Meus serviços |
| RF04 | Busca por especialidade e região | Busca textual sem distinção de acentos, categoria e cidade | Filtros combinados retornam apenas itens correspondentes |
| RF05 | Contratação direta sem anúncio | Solicitação pelo perfil cria serviço privado e conversa | Profissional recebe solicitação; serviço não aparece no catálogo público |
| RF06 | Avaliação com nota e comentário | Notas de 1 a 5, uma por serviço concluído; média no perfil | Apenas cliente proprietário avalia após a conclusão |
| RF07 | Chat integrado | Conversas por serviço e profissional, texto e imagem, polling de 3 segundos | Participantes trocam mensagens; terceiros recebem 404 |
| RF08 | Notificações internas | Avisos de interesse, mensagens, contratação, conclusão e avaliação | Destinatário visualiza e marca avisos como lidos |
| RF09 | Acompanhamento do serviço | Aberto, negociação, execução e concluído | Apenas cliente proprietário contrata e conclui; não há salto de etapas |

RF08 consta na metodologia e no cronograma da proposta. RF09 dá suporte às regras de contratação e avaliação e também aparece na descoberta.

## Requisitos não funcionais

| ID | Requisito | Evidência e limite |
| --- | --- | --- |
| RNF01 | Responsividade | CSS com breakpoints em 1200, 1000, 760 e 480 pixels; validação visual indicada no plano de testes |
| RNF02 | Acessibilidade | HTML semântico, labels, foco visível, link para conteúdo, diálogo modal nativo, alertas; ainda requer auditoria assistiva e contraste |
| RNF03 | Controle de acesso | Sessões HTTP-only, SameSite Strict, expiração de 7 dias; API valida papel e propriedade |
| RNF04 | Persistência | Banco SQLite em arquivo, chaves estrangeiras e índices; imagens em data URLs com limites |
| RNF05 | Qualidade | Testes HTTP com banco isolado e build de produção |
| RNF06 | Documentação | README, rastreabilidade, arquitetura, diagramas e roteiro de validação |

## Regras de negócio

1. Somente clientes publicam serviços. Profissionais demonstram interesse e iniciam negociações.
2. Um anúncio pode ter conversas com vários profissionais. A confirmação escolhe um único profissional.
3. Uma solicitação direta fica restrita ao cliente e ao profissional solicitado.
4. Somente participantes acessam uma conversa. E-mails e hashes de senha não são retornados nos perfis públicos.
5. O cliente confirma a contratação somente após haver conversa com o profissional.
6. Somente serviços em execução podem ser concluídos. Não há reabertura nesta versão.
7. A avaliação é única por serviço e só pode ser feita pelo cliente que o contratou após a conclusão.
8. Orçamento deve ser positivo, prazo não pode ser anterior à data corrente em UTC, especialidade precisa pertencer à lista disponível.
9. Imagens aceitas: PNG, JPEG ou WebP, até 500 KB cada; até seis no serviço ou portfólio, uma por mensagem.
10. Valores exibidos são estimativas; confirmação no protótipo registra a escolha e o status, não processa pagamento nem assina contrato digital.

## Fora do escopo desta versão

Pagamentos, geolocalização e plano premium são recomendações de evolução na proposta. Verificação documental, PWA, moderação, recuperação de senha, cancelamento, exclusão de conta, aceite bilateral formal, anexos além de imagens e distribuição em nuvem não estão implementados.

## Entregas acadêmicas pendentes

Os arquivos de apoio não substituem a monografia. É necessário coletar evidências com usuários, registrar dificuldades e feedback, analisar resultados, revisar bibliografia e texto com o orientador e preparar a defesa. Não apresentar métricas hipotéticas do documento de descoberta como resultados medidos.
