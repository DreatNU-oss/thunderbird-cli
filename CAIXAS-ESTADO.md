# Estado das caixas de e-mail — 2 de setembro de 2026

Registro da organização das 4 caixas do André feita com este fork do
`thunderbird-cli`. Para o estado da **instalação**, ver `CONTINUAR-AQUI.md`.
Para as travas e a auditoria, ver `AUDITORIA.md`.

---

## Resumo em uma linha

As Entradas saíram de **12.844 para 3.406** mensagens (178 não lidas). Nada foi
apagado em definitivo: tudo está em pasta de arquivo, na Lixeira ou no Spam.

---

## As contas

| Conta | ID interno | Entrada | Não lidas |
|---|---|---:|---:|
| `climedsch@gmail.com` (clínica) | `account5` | 1.054 | 159 |
| `andreschlemper@me.com` (iCloud) | `account3` | 1.450 | 10 |
| `dreatnu@yahoo.com` | `account1` | 894 | 3 |
| `noreply.garb@gmail.com` | `account4` | 8 | 6 |

⚠️ **Falta a 5ª conta (Microsoft 365)** e o apelido `andreschlemper@garb.digital`.
Receita no `CONTINUAR-AQUI.md`. As duas exigem o André digitando senha.

⚠️ **O `stats` reporta uma conta a mais**: "Pastas locais" não é caixa de e-mail.

---

## Estruturas criadas

### `Notas Fiscais Recebidas` — 705 notas fiscais automáticas

Existe em climedsch, iCloud e Yahoo. Subpastas por ano + `Terceiros`.

| Conta | Anos | Total |
|---|---|---:|
| climedsch | 2020–2026 + Terceiros(145) | 430 |
| iCloud | 2022–2026 + Terceiros(3) | 241 |
| Yahoo | 2024–2026 + Terceiros(1) | 34 |

Remetentes recolhidos: `noreply-nfse@el.com.br`, `noreply@nfe-cidades.com.br`,
`invoicy@migrate.info`, `nfe@marketingcartuchos.com.br`, `nfe@basariveiculos.com.br`,
`nfe@cirurgicaestilo.com.br`, `envio_nfe@carrefour.com`, `nao-responder@spedy.com.br`.

**Etiquetas** (sobreviveram a reinício e desligamento, verificado):
- `nfpj` — 241, tomador **CLINICA MEDICA SCHLEMPER LTDA** (CNPJ)
- `nfpf` — 253, tomador **ANDRE LUIS SCHLEMPER** (CPF)
- `nfcristina` — 59, tomador **CRISTINA SOUSA ARAUJO SCHLEMPER**
- Sem etiqueta, em `Terceiros` — 152 de outras pessoas/empresas

Como o tomador é identificado: o corpo traz `Nome do tomador: X (CPF/CNPJ: N)`.
14 dígitos = PJ, 11 = PF. Cancelamentos trazem o nome **sem** o documento. O
Invoicy nomeia o tomador na 1ª linha do HTML. O `nfe-cidades` só identifica pelo
nome do anexo XML (`doc<14 dígitos>_...`).

**As pastas `/NF`, `/NF ESA`, `/Prefeitura NF`, `/NF Unimed`, `/NF PM`,
`/Murad contab` que o André já tinha NÃO foram tocadas.** Elas guardam a
*conversa sobre* emitir nota (ele, a contabilidade, clientes), não o e-mail
automático do sistema — categorias diferentes, mantidas separadas de propósito.

### `Arquivo` — 8.092 mensagens de 2024 e anteriores

| Conta | Anos | Total |
|---|---|---:|
| climedsch | 2018(310) 2019(610) 2020(730) 2021(825) 2022(767) 2023(903) 2024(811) | 4.956 |
| iCloud | 2018(280) 2019(628) 2020(565) 2021(342) 2022(353) 2023(378) 2024(474) | 3.020 |
| Yahoo | 2024(116) | 116 |

Corte puramente por data. **Zero mensagens ≤2024 restaram nas Entradas.**

---

## O que foi para Spam e Lixeira

| Destino | Qtd | O quê |
|---|---:|---|
| Spam | 193 | Propaganda (Acordo Certo 89, Kolplast/Bonifiq, Takeda, Printi, Sebrae, Serasa, MedZone) |
| Spam | 954 | 38 domínios de envio em massa (Nível 1: 726 · Nível 2: 230) |
| Lixeira | 703 | Mercado Livre (10 endereços diferentes) |
| Lixeira | 397 | Faturas Claro e Vivo (10 endereços) |
| Lixeira | 236 | Alertas de segurança e avisos de login |
| Lixeira | 19 | Corine – 4Medic |

⚠️ **O iCloud não tem pasta de lixo eletrônico** (só INBOX, Drafts, Trash e as
criadas). Propaganda dessa conta vai para a Lixeira: **não treina filtro** e
some em ~30 dias.

⚠️ **A "Lixeira" da climedsch é `[Gmail]/Lixeira`**, não `/Trash`. O Thunderbird
criou uma `/Trash` própria que o Gmail trata como etiqueta comum — o que vai
para lá **não** é apagado automaticamente.

---

## Decisões do André — respeitar

**Nunca marcar como spam** (transacionais, verificados um a um):
`xpi.com.br` (notas de negociação) · Kolplast (pedidos faturados) ·
`copass-saude.com.br` (pagamento prestador) · `brcondominio.com.br` (boletos) ·
`b3.com.br` (extratos) · Google/GitHub/Microsoft (códigos de verificação) ·
Apple (releases de app) · **`sign@d4sign.com.br` e `dse_na#@docusign.net`
(documentos assinados)** · contabilidade (Murad, JF Gestta, Sercon).

**Preservados por decisão explícita:** `portalmedico.org.br` (78, CFM — inclui
renovação de registro) e `crmmg.org.br` (24, Conselho Regional).

**Pessoas — nunca tratar em bloco:** Luciana/Daniele/Catia (Unimed), Jonathan,
Jenifer, Brunna, Osni Schlemper (família), Crislaine, Tamires (Dell).

**O André mandou para Spam, contra minha recomendação:** Veedha (26, tem
convites de reunião com o nome dele), Helena (19, tem "ação necessária" de
rodada) e Banco do Brasil (9, inclui aviso FATCA/CRS). Se ele sentir falta,
estão no Spam, recuperáveis.

---

## Armadilhas da ferramenta — ler antes de agir

1. **`POST /sync` NÃO sincroniza.** `background.js:680` só chama
   `messenger.folders.getSubFolders()` — lista subpastas e nada mais. Não busca
   mensagem, não envia bandeira. Toda leitura de estado volta do **cache local**.
2. **Marcar como lida não é confiável.** `messenger.messages.update()` responde
   `success` em milissegundos porque grava só no banco local; a bandeira `\Seen`
   muitas vezes não chega ao IMAP, e o iPhone continua mostrando não lida. **Não
   há como verificar pela ferramenta** — o cache confirma a si mesmo. Caminho que
   funciona: o André marcar pelo Gmail web (`is:unread before:2025/01/01` →
   selecionar tudo → "Selecionar todas as conversas" → Marcar como lida) ou pela
   interface do Thunderbird.
3. **Mover e criar pasta SÃO confiáveis** — vão ao servidor na hora e propagam
   para o iPhone. Etiqueta também gruda (verificado após desligamento).
4. **Contadores mentem.** `stats --folders` fica desatualizado nessa conta Gmail;
   a verdade é `list --unread` com paginação de 200 em 200.
5. **Sempre levantar TODAS as variações de endereço antes de agir em lote.**
   Mercado Livre usa 10 endereços (a lista por volume mostrava 551; o real era
   703). Acordo Certo usa 16 subdomínios. Claro+Vivo, 10. **Agrupar por domínio
   raiz, nunca por endereço.**
6. **Contar únicos pela pasta `[Gmail]/Todos os e-mails`.** INBOX + Todos +
   Importante triplicam a mesma mensagem no Gmail.
7. **Nunca casar por texto de assunto.** Em 02/09 isso pegou 6 faturas Claro de
   2025 fora do escopo (devolvidas) e deixou passar a do Itaú, por causa do
   acento. **Casar por id de mensagem.**
8. **O id muda ao mudar de pasta e ao reiniciar o Thunderbird.** Para reencontrar
   mensagens entre sessões, casar por `headerMessageId`, que é estável.
9. **`move` no Gmail: lotes de 40.** Rende ~0,03s/mensagem; em lotes de 3 rende
   ~8s/mensagem. 8.092 mensagens levaram 4min36s.
10. **`bulk move` do CLI é traiçoeiro:** não filtra por não-lidas e para no
    `--limit` (padrão 100). Não usar.
11. **Conexão IMAP travada** faz todo `move` do Gmail dar timeout — resolve
    reiniciando o Thunderbird.
12. **Busca com múltiplos filtros trunca:** varre conta por conta e para no
    limite. Usar `--account` + limite folgado, ou paginar `list`.

---

## Como retomar

```bash
cd ~/Thunderbolt && npm run bridge     # subir a ponte (deixar aberta)
node cli/src/cli.js health             # confirmar: thunderbird: true
```

Falar direto com a ponte é muito mais rápido que abrir o Node a cada chamada
(553 etiquetas em <1s por HTTP direto, contra minutos pelo CLI). O token está em
`~/.config/thunderbird-cli/config.json`, campo `bridge.authToken`.

**Desligar a ponte ao terminar** — a auditoria recomenda mantê-la no ar só
durante o uso (SEC-02).

---

## Pendências

1. **5ª conta Microsoft 365** e apelido `andreschlemper@garb.digital` — exigem o
   André no teclado.
2. **Marcar como lidas** as antigas, se ele quiser: só pelo Gmail web.
3. **Cauda longa:** 729 remetentes com 1 mensagem cada. Quase todos foram junto
   no arquivamento; o que sobrou não compensa tratar em bloco.
