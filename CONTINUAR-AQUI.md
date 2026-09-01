# Ponto de retomada — 1º de setembro de 2026

Estado congelado do projeto, para retomar em outra sessão do Claude Code
nesta mesma máquina. O repositório é **`~/Thunderbolt`** (branch `meu`).

---

## Resumo em uma linha

A parte técnica está **pronta e testada**; falta conectar a última conta de
e-mail, instalar a extensão no Thunderbird e fazer a verificação final.

---

## O que já está feito

**Fases 0, 1, 2, 3, 4 e 6 do plano original** (`~/Downloads/prompt-thunderbird-cli-instalacao.md`).

| Item | Situação |
|---|---|
| Auditoria de segurança | ✅ Feita. Veredito: **seguro com ressalvas**. Está em `AUDITORIA.md` |
| Fork pessoal | ✅ `github.com/DreatNU-oss/thunderbird-cli`, clonado em `~/Thunderbolt`, branch `meu`, tudo enviado |
| Dependências | ✅ Instaladas do código-fonte (nunca global). **0 vulnerabilidades** |
| Testes | ✅ **109 passando** (57 CLI + 37 MCP + 15 ponte), 0 falhas |
| Travas de segurança | ✅ Aplicadas e testadas (detalhe abaixo) |
| Servidor MCP | ✅ Registrado apontando para `~/Thunderbolt/mcp/src/server.js`, conecta, 12 ferramentas |
| Token da ponte | ✅ Gerado em `~/.config/thunderbird-cli/config.json` (permissão 600) |
| Extensão empacotada | ✅ `dist/thunderbird-cli-2.0.0.xpi`, já sem a permissão de envio |
| Manual de manutenção | ✅ `COMO-ATUALIZAR.md` |

### As travas (Fase 4)

Ficam em `extension/src/background.js`, que é o último ponto antes do
Thunderbird agir — a auditoria mostrou que a ponte e o MCP podem ser
contornados por outro programa da máquina, mas a extensão não.

1. **Envio direto impossível.** Tudo vira rascunho. A permissão `compose.send`
   foi removida do manifesto, então o próprio Thunderbird recusa enviar.
2. **Exclusão permanente não existe.** Tudo vai para a Lixeira; pedir exclusão
   permanente falha visivelmente.
3. **Exclusão de pasta bloqueada** (acréscimo, além do pedido original).
4. **Ponte protegida:** token exigido de verdade, CORS fechado, requisições de
   navegador recusadas, validação de Host, uma extensão por vez.
5. **Corrigida uma falha séria** achada na revisão final (SEC-08): o nome de um
   anexo, escolhido por quem envia o e-mail, permitia gravar arquivos fora da
   pasta de destino.

---

## O que falta

### 1. A 5ª conta de e-mail (Microsoft 365)

Já configuradas — **4 de 5**, todas em IMAP:

- `dreatnu@yahoo.com`
- `andreschlemper@me.com` (iCloud)
- `noreply.garb@gmail.com`
- `climedsch@gmail.com`

**Receita para a Microsoft:** preencher nome e e-mail, **deixar o campo de
senha vazio**, clicar em Continuar. O Thunderbird reconhece o provedor e abre a
janela de login da própria Microsoft, e a senha é digitada lá. Escolher sempre
**IMAP**, nunca POP3.

### 2. O apelido `andreschlemper@garb.digital`

**Ainda não foi adicionado.** Descoberta importante: esse endereço **não é uma
conta separada** — é um *apelido* do iCloud que entrega na mesma caixa do
`andreschlemper@me.com`. O domínio está no iCloud+ (os registros MX apontam
para `mx01.mail.icloud.com`); o Cloudflare só hospeda o DNS, não guarda e-mail.
Tentar adicioná-lo como conta separada **nunca vai funcionar**.

O e-mail que chega nele **já está caindo** na conta iCloud. Falta só poder
enviar como ele:

1. Menu ☰ → **Configurações de contas**
2. Clicar na conta `andreschlemper@me.com`
3. **Gerenciar identidades…** → **Adicionar…**
4. Nome: André Schlemper · E-mail: `andreschlemper@garb.digital`

⚠️ **Não alterar o campo Usuário do servidor de envio (SMTP).** Ele precisa
continuar `andreschlemper@me.com`, senão o envio quebra.

### 3. Fase 5 — instalar a extensão permanentemente

O `.xpi` já está construído e verificado.

1. Subir a ponte: `cd ~/Thunderbolt && npm run bridge` (deixar a janela aberta)
2. Thunderbird → **Ferramentas** → **Complementos e temas** → engrenagem ⚙ →
   **Instalar complemento de arquivo…** → `~/Thunderbolt/dist/thunderbird-cli-2.0.0.xpi`
3. Confirmar que sobrevive a um reinício do Thunderbird
4. Testar: `node cli/src/cli.js health`

### 4. Fase 7 — verificação final (só leitura)

Nesta ordem: `health` → `stats` (conferir se bate com o que aparece no
Thunderbird) → uma busca simples entre contas → **e então testar as travas com
o Thunderbird conectado**: tentar enviar direto e tentar apagar
permanentemente. **As duas têm que falhar.** Se qualquer uma funcionar, avisar
imediatamente e não entregar como pronto.

Não enviar e-mail de teste para ninguém e não apagar nada. Para testar, usar um
rascunho criado na hora.

### 5. Decisão pendente: a extensão ThunderAI

O André instalou, por conta própria, a extensão **ThunderAI**
(`thunderai@micz.it`, versão 4.1.1) buscando "claude" na loja do Thunderbird.
**Ela não faz parte deste projeto** e não é necessária para nada aqui — nosso
caminho não usa chave de API.

Ela pede uma **chave de API paga** (a assinatura do Claude não inclui créditos
de API) e pediu permissão para **ler, escrever e modificar todas as mensagens,
ver as contas e baixar arquivos** — acesso total às 5 caixas, sem ter passado
por auditoria nenhuma.

Três caminhos foram oferecidos e **o André ainda não escolheu**:

1. Deixar de lado por enquanto (foi a recomendação)
2. Auditar a ThunderAI antes de colar a chave
3. Desinstalar

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

## Comandos úteis

```bash
cd ~/Thunderbolt
npm run bridge      # sobe a ponte (deixar a janela aberta)
npm run test:tudo   # 109 testes, incluindo os das travas
npm run build:xpi   # reempacota a extensão depois de editá-la
npm run token       # gera/regenera o token da ponte
```

Documentos: `AUDITORIA.md` (por que cada trava existe) ·
`COMO-ATUALIZAR.md` (manutenção e como puxar melhorias do autor) ·
`skills/thunderbird-cli/SKILL.md` (como o agente deve se comportar —
inclui o bloco **"Regras de triagem"**, ainda vazio, para o André preencher
com as pastas de cada empresa).
