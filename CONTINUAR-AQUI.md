# Ponto de retomada — 1º de setembro de 2026 (caminhos e travas revistos em 21/09/2026)

Estado congelado do projeto, para retomar em outra sessão do Claude Code
nesta mesma máquina. O repositório é **`~/Thundirbird`** (branch `meu`). A pasta
antiga, `~/Thunderbolt`, não existe mais.

---

## Resumo em uma linha

**As fases 0 a 7 estão fechadas e verificadas com o Thunderbird real.** Falta
só conectar a 5ª conta (Microsoft 365) e criar o apelido `garb.digital` — as
duas dependem do André no teclado, não do agente.

---

## O que já está feito

**Todas as 8 fases do plano original** (`~/Downloads/prompt-thunderbird-cli-instalacao.md`).

| Item | Situação |
|---|---|
| Auditoria de segurança | ✅ `AUDITORIA.md`. Veredito: **seguro com ressalvas** |
| Fork pessoal | ✅ `github.com/DreatNU-oss/thunderbird-cli`, em `~/Thundirbird`, branch `meu` |
| Dependências | ✅ Do código-fonte, nunca global. **0 vulnerabilidades** |
| Testes | ✅ **129 passando** (59 CLI + 38 MCP + 15 ponte + 17 extensão), 0 falhas — contagem de 21/09 |
| Travas de segurança | ✅ Aplicadas **e verificadas contra o Thunderbird real** (ver abaixo) |
| Servidor MCP | ✅ Registrado em `~/.claude.json` → `~/Thundirbird/mcp/src/server.js` (caminho corrigido em 18/09), 12 ferramentas |
| Token da ponte | ✅ `~/.config/thunderbird-cli/config.json`, permissão 600 |
| **Extensão instalada** | ✅ **Permanente** (`app-profile`, não temporária), sobreviveu a reinício. Hoje na **2.0.3** (21/09) |
| **ThunderAI** | ✅ **Removida.** Decisão do André em 01/09 |
| Manual de manutenção | ✅ `COMO-ATUALIZAR.md` |

### As travas (Fase 4) — e a prova de que funcionam (Fase 7)

Ficam em `extension/src/background.js`, o último ponto antes do Thunderbird
agir. A auditoria mostrou que a ponte e o MCP podem ser contornados por outro
programa da máquina; a extensão, não.

1. ~~**Envio direto impossível.**~~ **REMOVIDA EM 03/09/2026, a pedido do André.**
   Até essa data tudo virava rascunho e `compose.send` estava fora do manifesto.
   Hoje o agente **envia**: a permissão `compose.send` foi devolvida e as três
   linhas `if (send) return ERRO_ENVIO_BLOQUEADO;` saíram de `/compose`,
   `/reply` e `/forward`. Extensão na **2.0.1**. Junto veio o suporte a
   `identityId` em `/reply` e `/forward`, para a mensagem sair da conta certa
   (`id4` = climedsch) em vez da padrão (Yahoo).
   Motivo: ele precisava que o agente enviasse quando pedisse, e o classificador
   do Claude Code bloqueava o caminho alternativo. O envio na prática é feito por
   `scripts/enviar-talita.mjs` — simulação por padrão, envia só com `--enviar`.
   Custo aceito conscientemente: era esta trava que tornava a exfiltração por
   e-mail impossível **por código**, e não apenas improvável (ver SEC-04 na
   `AUDITORIA.md`). Em 21/09/2026 a liberação foi commitada na `meu`
   (`924a64e`). Desfazer: `git revert 924a64e`, subir a versão em
   `extension/manifest.json`, `npm run build:xpi` e reinstalar.
2. **Exclusão permanente não existe.** Tudo vai para a Lixeira.
3. **Exclusão de pasta bloqueada.**
4. **Ponte protegida:** token exigido de verdade, CORS fechado, requisições de
   navegador recusadas, validação de Host, uma extensão por vez.
5. **SEC-08 corrigido:** nome de anexo não escapa mais da pasta de destino.

**Verificação de 01/09 (Fase 7), com Thunderbird conectado** — antes de o envio
ser liberado em 03/09; a linha do `send:true` vale só como registro histórico.
Os testes foram feitos com `curl` **direto na ponte** — pulando CLI e MCP —, que
é exatamente o cenário do programa local malicioso descrito no SEC-02/SEC-03. Cada trava foi
testada **com um controle**, para provar que a recusa veio da trava e não de um
comando malformado:

| Requisição | Resultado |
|---|---|
| `/compose` sem `send` (controle) | `draft_saved` |
| `/compose` com `send:true` | `ENVIO_BLOQUEADO` — sem envio e **sem resíduo** em Rascunhos |
| `/messages/delete` sem `permanent` (controle) | `deleted:1, destino:"Lixeira"` |
| `/messages/delete` com `permanent:true` | `EXCLUSAO_PERMANENTE_BLOQUEADA` — mensagem **sobreviveu**, conferido depois |

A trava de exclusão de pasta **não** foi testada ao vivo de propósito: ela
impede apagar até a pasta de teste, o que deixaria lixo permanente na caixa.
Está coberta pelos testes automatizados.

---

## O que falta

### 1. A 5ª conta de e-mail (Microsoft 365)

Configuradas — **4 de 5**, todas IMAP: `dreatnu@yahoo.com`,
`andreschlemper@me.com` (iCloud), `noreply.garb@gmail.com`, `climedsch@gmail.com`.

⚠️ **Não se engane com o `stats`:** ele reporta `totalAccounts: 5`, mas a
quinta é "Pastas locais", que é uma pasta do Thunderbird, não uma caixa.

**Receita para a Microsoft:** preencher nome e e-mail, **deixar o campo de
senha vazio**, clicar em Continuar. O Thunderbird reconhece o provedor e abre a
janela de login da própria Microsoft; a senha é digitada lá. Escolher sempre
**IMAP**, nunca POP3.

### 2. O apelido `andreschlemper@garb.digital`

**Ainda não foi adicionado** (conferido no perfil: não existe nenhuma
identidade com esse endereço). **Não é uma conta separada** — é um *apelido* do
iCloud que entrega na mesma caixa do `andreschlemper@me.com`. Os MX apontam
para `mx01.mail.icloud.com`; o Cloudflare só hospeda o DNS. Tentar adicioná-lo
como conta separada **nunca vai funcionar**. O e-mail já está caindo na conta
iCloud; falta só poder *enviar* como ele:

1. Menu ☰ → **Configurações de contas**
2. Clicar na conta `andreschlemper@me.com`
3. **Gerenciar identidades…** → **Adicionar…**
4. Nome: André Schlemper · E-mail: `andreschlemper@garb.digital`

⚠️ **Não alterar o campo Usuário do servidor de envio (SMTP).** Precisa
continuar `andreschlemper@me.com`, senão o envio quebra.

---

## Coisas descobertas em 01/09 que valem saber

- **Partida a frio na `climedsch@gmail.com`.** É a maior caixa (31.815
  mensagens, 79 pastas). A **primeira** busca depois de abrir o Thunderbird
  estoura o timeout padrão de 30s; depois de aquecida leva ~3,7s. **É só
  repetir.** Não é defeito.
- **O MCP tem timeout fixo de 30s e não tem como aumentar** (`mcp/src/client.js:50`).
  O CLI tem `--timeout <ms>`. Se o agente falhar por timeout numa caixa grande,
  a causa é essa.
- **O servidor MCP lê o token uma única vez, ao subir** (`mcp/src/client.js:43`).
  Se o token for regenerado, as 12 ferramentas só voltam a funcionar depois de
  reiniciar o Claude Code. O CLI relê a cada execução.
- **Token exposto em transcrição.** Em 01/09 um comando de verificação imprimiu
  o token da ponte na tela de uma sessão. O André foi informado e **decidiu não
  trocá-lo**: só serve para a porta local, só enquanto a ponte estiver no ar, e
  as travas seguram mesmo quem o tenha. Para trocar: `npm run token` (+ reiniciar
  o Claude Code).
- **Cuidado com worktrees.** A sessão de 01/09 abriu numa worktree em
  `.claude/worktrees/`, que estava no código **original do autor**, sem nenhuma
  trava (`test:tudo` inexistente). Trabalhar de lá teria produzido uma extensão
  sem as travas de exclusão. Em 21/09, um pacote gerado a partir da `meu` de
  antes do commit `924a64e` voltaria a travar o envio, porque as mudanças de
  03/09 ainda estavam sem commit; ele foi apagado antes de ser instalado.
  **Antes de editar ou empacotar, confira que a branch parte da `meu` atual**
  (`git merge-base --is-ancestor meu HEAD` não pode dar erro) **e que não há
  mudança sem commit.**

---

## Regras que valem para quem retomar

- **Nunca digitar senha, chave de API ou token do André.** Ele cola; o agente só
  orienta e verifica.
- **Nunca rodar `npm install -g`.** Tudo roda a partir do fork.
- **Parar e perguntar** antes de qualquer passo irreversível ou que toque numa
  conta de e-mail real.
- **Falar português simples**, explicando cada decisão antes de executá-la. O
  André não escreve código.
- **Confiar no repositório, não na documentação do autor.** O `SECURITY.md`
  original descreve 8 defesas que **não existem no código** — está tudo em
  `AUDITORIA.md`.
- Se as travas forem tocadas, `npm run test:tudo` **tem que continuar verde**.

---

## Risco residual conhecido (não maquiar)

- **Prompt injection continua sem defesa de código** (SEC-04). O conteúdo de
  e-mail entra cru no contexto. O que protege é o julgamento do agente e as
  regras do `SKILL.md` — não uma trava.
- **A porta 7701 (WebSocket) não exige token.** Mitigação: uma extensão
  conectada por vez. Se algo tomar a vaga antes do Thunderbird, a extensão real
  é recusada e o erro aparece — falha visível, não silenciosa.
- **`SECURITY.md` do autor segue no repositório descrevendo defesas
  inexistentes.** Não confiar nele.

---

---

## Organização das caixas (02/09/2026)

A ferramenta já está em uso de verdade. O estado das 4 caixas — estruturas de
pastas criadas, etiquetas, o que foi para Spam/Lixeira, as decisões do André
sobre o que preservar e **12 armadilhas da ferramenta descobertas na prática** —
está em **`CAIXAS-ESTADO.md`**. Ler antes de mexer em qualquer caixa.

Resumo: Entradas de 12.844 → 3.406 mensagens. 705 notas fiscais organizadas em
`Notas Fiscais Recebidas` com etiquetas PJ/PF, 8.092 mensagens de ≤2024 em
`Arquivo` por ano, 1.147 em Spam e 1.355 na Lixeira. Nada apagado em definitivo.

⚠️ **A mais importante das armadilhas:** `POST /sync` não sincroniza nada e
marcar como lida não chega ao servidor de forma confiável — o cache local
confirma a si mesmo. Mover e criar pasta, sim, são confiáveis.

## Comandos úteis

```bash
cd ~/Thundirbird
npm run bridge      # sobe a ponte (deixar a janela aberta)
npm run test:tudo   # 129 testes, incluindo os das travas
npm run build:xpi   # reempacota a extensão depois de editá-la
npm run token       # gera/regenera o token da ponte
```

Documentos: `AUDITORIA.md` (por que cada trava existe) ·
`COMO-ATUALIZAR.md` (manutenção e como puxar melhorias do autor) ·
`skills/thunderbird-cli/SKILL.md` (como o agente deve se comportar —
inclui o bloco **"Regras de triagem"**, ainda vazio, para o André preencher
com as pastas de cada empresa).
