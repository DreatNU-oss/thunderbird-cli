# Como mexer nisto depois

Manual de manutenção da minha versão pessoal do `thunderbird-cli`.
Escrito para eu conseguir seguir sozinho daqui a seis meses.

O repositório fica em **`~/Thundirbird`**. Até setembro de 2026 ele ficava em
`~/Thunderbolt`, pasta que não existe mais: se algum texto antigo citar esse
caminho, troque pelo novo. Tudo abaixo pressupõe que você abriu o terminal (ou
o Claude Code) nessa pasta.

---

## O básico: o que precisa estar ligado

Três peças, nesta ordem:

1. **O Thunderbird aberto.** É ele que tem as contas e as senhas. Fechou o
   Thunderbird, o agente para de enxergar e-mail.
2. **A ponte rodando.** Numa janela de terminal que fica aberta:

   ```bash
   cd ~/Thundirbird && npm run bridge
   ```

   Enquanto essa janela estiver aberta, a ponte está de pé. Fechou, acabou.
3. **O Claude Code**, que já está configurado para achar o servidor MCP.

Se algo não funcionar, quase sempre é uma dessas três coisas.

> **Por que a ponte não sobe sozinha no boot?** De propósito. Enquanto ela está
> no ar, qualquer programa desta máquina que tenha o token consegue conversar
> com suas caixas. Subindo só quando você vai usar, essa janela fica curta e
> sob seu controle. Se um dia quiser mudar isso, veja "Ligar a ponte sozinha"
> no fim deste arquivo.

---

## Editei a extensão. E agora?

A extensão é a parte que roda **dentro** do Thunderbird
(`extension/src/background.js` e `extension/manifest.json`). Ela não recarrega
sozinha: toda vez que você mexer nela, precisa reempacotar e reinstalar.

São três passos:

**1. Reempacotar**

Antes, suba a versão em `extension/manifest.json` (de 2.0.3 para 2.0.4, por
exemplo). O nome do pacote muda junto, e fica fácil conferir no Thunderbird
qual versão está instalada.

```bash
cd ~/Thundirbird && npm run build:xpi
```

Isso gera `dist/thunderbird-cli-<versão>.xpi` (em 21/09/2026, a 2.0.3). O `.xpi` é só um arquivo `.zip`
com o `manifest.json` **na raiz** — o script já cuida disso e confere no final.
(O erro clássico de quem faz na mão é zipar a *pasta*, criando um nível a mais.
O script não deixa isso acontecer.)

> ⚠️ **Empacote sempre a partir da `meu` atual**, com tudo commitado. Pacote
> feito da `main` sai sem as minhas travas. Pacote feito de uma `meu` anterior
> a 21/09/2026 volta a travar o envio que eu liberei em 03/09.

**2. Reinstalar no Thunderbird**

1. Thunderbird → menu **Ferramentas** (ou ☰) → **Complementos e temas**
2. Ícone de engrenagem ⚙ → **Instalar complemento de arquivo…**
3. Escolha `~/Thundirbird/dist/thunderbird-cli-<versão>.xpi`
4. Confirme a substituição da versão anterior

**3. Reiniciar a ponte**

Feche a janela do terminal onde a ponte está rodando (`Ctrl+C`) e rode
`npm run bridge` de novo. Depois confira:

```bash
node cli/src/cli.js health
```

Se responder, está tudo de pé.

> **Editei só o CLI, a ponte ou o servidor MCP (`cli/`, `bridge/`, `mcp/`)?**
> Aí não precisa reempacotar nada — só reiniciar a ponte. Reempacotar só é
> necessário quando você mexe na pasta `extension/`.

---

## Puxar melhorias do autor original sem perder as minhas

Minhas modificações vivem na branch **`meu`**. A branch `main` é um espelho
limpo do autor, que serve só para eu comparar. Os dois "controles remotos" são:

- `origin` → meu fork (github.com/DreatNU-oss/thunderbird-cli)
- `upstream` → repositório do autor (github.com/vitalio-sh/thunderbird-cli)

*(o `upstream` está configurado para não aceitar envio, então não tem risco de
eu empurrar minhas coisas para o repositório do autor por acidente.)*

**Passo a passo:**

```bash
cd ~/Thundirbird

# 1. Ver o que mudou lá, sem aplicar nada ainda
git fetch upstream
git log --oneline meu..upstream/main
```

Se a lista vier vazia, não há nada novo — acabou aqui.

```bash
# 2. Atualizar meu espelho da main
git checkout main
git merge --ff-only upstream/main
git push origin main

# 3. Trazer as novidades para a minha branch
git checkout meu
git merge upstream/main
```

**Se o Git reclamar de conflito**, é quase certo que seja num dos arquivos onde
eu travei alguma coisa. Nesses casos, **a minha versão é a que vale**:

| Arquivo | O que eu mudei e não pode voltar |
|---|---|
| `extension/manifest.json` | a versão (2.0.3 em 21/09/2026). A permissão `compose.send` saiu em 01/09 e **voltou em 03/09, por decisão minha**: não tire de novo |
| `extension/src/background.js` | exclusão permanente e exclusão de pasta bloqueadas; **o envio direto foi liberado em 03/09, por decisão minha** (não volte a travar `/compose`, `/reply` e `/forward`); `identityId` em `/reply` e `/forward`; a listagem com `sort` ordena a pasta inteira (no original, "mais novas primeiro" devolvia as mais antigas); o `tb recent` traz as mais novas de todas as pastas e respeita `--unread` e `--account` |
| `bridge/bridge.js` | token exigido, CORS fechado, Origin/Referer/Host barrados |
| `mcp/src/tools.js` | modo `send` e parâmetro `permanent` fora do catálogo |
| `cli/src/cli.js` | `--send`, `--permanent` e `folder-delete` bloqueados |
| `skills/thunderbird-cli/SKILL.md` | minhas regras em português |

Sobre o envio, desde 03/09: a extensão envia, o CLI e o MCP continuam recusando
(`ENVIO_BLOQUEADO`), e o envio de verdade passa pelo `scripts/enviar-talita.mjs`,
que fala direto com a ponte e só envia com `--enviar`. A decisão e o custo
aceito estão na `AUDITORIA.md`.

Peça ao Claude Code: *"resolva o conflito mantendo minhas travas de segurança e
me mostre o que o autor mudou"*.

```bash
# 4. Conferir que nada quebrou (isto é obrigatório)
npm install
npm run test:tudo
```

Os testes das travas (`Travas pessoais`, `Ponte com token`) **têm que passar**.
Se algum falhar, a atualização apagou uma proteção — não siga adiante.

```bash
# 5. Se a pasta extension/ mudou, reempacotar e reinstalar (ver seção acima)
npm run build:xpi

# 6. Salvar
git push origin meu
```

---

## Conferir que as travas continuam de pé

A qualquer momento:

```bash
cd ~/Thundirbird && npm run test:tudo
```

São 129 testes (59 do CLI, 38 do MCP, 15 da ponte e 17 da extensão, contagem
de 21/09/2026). Os que importam para a segurança:

- **`Travas pessoais (Fase 4)`** — o CLI recusa `--send` em compose, reply e
  forward, e nenhum envio chega à ponte (um controle prova que o CLI alcança a
  ponte); exclusão permanente bloqueada, exclusão de pasta bloqueada, delete
  indo para a Lixeira. No `test:mcp`, o mesmo para o MCP: `mode: "send"`
  recusado e nenhum envio chegando à ponte. As pontes simuladas enviam, como a
  extensão real desde 03/09, então esses testes só passam se a recusa do CLI e
  do MCP estiver lá de verdade.
- **`Ponte com token`** e **`bloqueio de navegador e DNS rebinding`** — a ponte
  recusa quem não tem token e recusa navegador.

Se algum desses ficar vermelho, **pare e investigue** antes de usar com as
contas reais.

---

## Problemas comuns

| O que aparece | O que é | Solução |
|---|---|---|
| `BRIDGE_UNREACHABLE` | A ponte não está rodando | `npm run bridge` |
| `NAO_AUTORIZADO` | Falta o token | `npm run token` e reinicie a ponte |
| `RECUSANDO SUBIR: nenhum token` | A ponte não sobe sem token | `npm run token` |
| `EXTENSION_DISCONNECTED` | Thunderbird fechado, ou extensão não instalada | Abra o Thunderbird; se persistir, reinstale o `.xpi` |
| `ENVIO_BLOQUEADO` | **Funcionando como deveria** | É a trava do CLI ou do MCP, que continuam sem enviar. Use o rascunho. O envio que eu liberei em 03/09 passa pelo `scripts/enviar-talita.mjs` |
| `EXCLUSAO_PERMANENTE_BLOQUEADA` | **Funcionando como deveria** | É a trava. Vá pela Lixeira. |
| O agente não enxerga as ferramentas | O caminho do fork mudou | O servidor MCP aponta para `~/Thundirbird/mcp/src/server.js` por caminho absoluto (confira com `claude mcp get thunderbird`). Se a pasta mudar de lugar, rode `claude mcp remove thunderbird --scope user`, registre de novo com `claude mcp add-json -s user thunderbird '{"type":"stdio","command":"node","args":["<pasta nova>/mcp/src/server.js"],"env":{}}'` e reinicie o Claude Code |

---

## Trocar o token da ponte

```bash
npm run token -- --forcar
```

Depois reinicie a ponte. O token fica em
`~/.config/thunderbird-cli/config.json`, com permissão 600 (só você lê), fora
do repositório de propósito — token não se guarda no Git.

---

## Ligar a ponte sozinha no boot (não recomendado)

Se um dia o vaivém de abrir o terminal incomodar mais do que o risco preocupar,
dá para criar um serviço do macOS (`launchd`) que sobe a ponte no login. Peça
ao Claude Code: *"cria um LaunchAgent para subir a ponte do Thundirbird no
login"*.

Antes de fazer isso, entenda o que muda: hoje a ponte só existe quando você a
liga. Com o serviço, ela fica de pé o tempo todo, e a superfície de ataque
descrita em `AUDITORIA.md` (item SEC-02) fica exposta o dia inteiro em vez de
alguns minutos. O token protege, mas a janela aumenta muito.

---

## Onde está cada coisa

| Arquivo | O que é |
|---|---|
| `AUDITORIA.md` | A revisão de segurança feita antes de instalar. Leia se quiser entender **por que** cada trava existe |
| `COMO-ATUALIZAR.md` | Este arquivo |
| `skills/thunderbird-cli/SKILL.md` | Onde o agente aprende a se comportar. **É o arquivo que eu mais vou editar** — inclusive o bloco "Regras de triagem" |
| `extension/` | O que roda dentro do Thunderbird. Mexeu aqui → reempacotar |
| `bridge/bridge.js` | A ponte |
| `mcp/src/tools.js` | As 12 ferramentas que o agente enxerga |
| `cli/src/cli.js` | Os comandos de terminal |
| `test/` | Os testes, incluindo os das travas |
