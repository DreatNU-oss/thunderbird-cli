# Regras de triagem

Este arquivo manda no agente automático das 8h e das 14h. Ele é lido a cada
rodada. **É texto simples e é seu** — edite à vontade, sem pedir nada a ninguém.
Está no Git, então toda alteração fica registrada e dá para voltar atrás.

---

## Modo de operação

```
modo: real
```

- **`seco`** — ele só relata o que *faria*. Não move nada. É como começamos.
- **`real`** — ele executa de verdade.

Vire para `real` só quando o relatório estiver batendo com o que você faria.
Se algo cheirar mal depois, volte para `seco` você mesmo: é uma palavra.

---

## Precedência — a regra das regras

1. **"Nunca tocar" vence tudo.** Se um remetente aparece aqui e também numa lista
   de descarte, ele fica.
2. Depois valem as listas de Spam e Lixeira.
3. **O que não casar com nada não se move.** Vai para "o que faço com isto?" no
   relatório, e você decide.

Isso existe porque três remetentes seus mandam as duas coisas: Kolplast (pedido
faturado *e* propaganda), DocuSign (documento assinado *e* marketing) e Unimed
(pessoas *e* disparo em massa). Na dúvida entre guardar e descartar, guarda.

---

## Nunca tocar — transacionais

Verificados um a um por você durante a faxina. Nunca vão para spam nem lixeira.

| Remetente | Por quê |
|---|---|
| `xpi.com.br` | Notas de negociação |
| `b3.com.br` | Extratos |
| Kolplast | Pedidos faturados (a propaganda deles é outra coisa) |
| `copass-saude.com.br` | Pagamento de prestador |
| `brcondominio.com.br` | Boletos |
| `sign@d4sign.com.br` | Documentos assinados |
| `dse_na#@docusign.net` | Documentos assinados |
| Google, GitHub, Microsoft | Códigos de verificação e segurança da conta (exceção, decisão de 20/11/2026: `microsoftrewards.com` e `microsoftadvertising.com` são propaganda e vão para a Lixeira) |
| Apple | Releases de aplicativo |
| Murad, JF Gestta, Sercon | Contabilidade |
| Soma Contabilidade: `somacontabilidadetc.com.br` e `acessorias.com` | Contabilidade atual: guias de imposto, holerites, documentos do portal |
| `ssparisi.com` ("Banco On-Line") | Lançamentos da Soma com a Unicred Empresas, enviados a pedido do André |

**Decisão do André em 19/11/2026:** a Soma e o "Banco On-Line" entraram aqui.
O filtro do Thunderbird marca os dois como lixo eletrônico com frequência (em
18/11, as 8 cópias das guias de PIS/COFINS, ISS, CSLL e IRPJ). Os e-mails do
`ssparisi.com` tinham sido tratados como golpe imitando a Soma; o André
corrigiu: é a equipe da Soma que manda, por pedido dele. Os 2 que estavam na
Lixeira da clínica (16/11 e 18/11) voltaram para a Entrada no mesmo dia.
O `acessorias.com` é o portal que a Soma usa; outra contabilidade que use o
mesmo portal também fica protegida, o que só impede descarte, nunca move nada.

## Nunca tocar — preservados

| Remetente | Por quê |
|---|---|
| `portalmedico.org.br` | CFM — inclui renovação de registro |
| `crmmg.org.br` | Conselho Regional de Medicina |

### CRM-MG e CFM — informativo x específico

Regra do André, 03/09/2026. **Informativo geral** (fórum, evento, campanha,
convite) pode ir para a Lixeira. **Específico do médico ou da clínica**
(anuidade, renovação cadastral, certidão de regularidade, processo) é
importante e fica.

**O robô nunca move nada do CRM sozinho.** Motivo: `comunicacao@crmmg.org.br`
manda as duas coisas pelo mesmo endereço — os fóruns e também "como pagar a
anuidade de 2026" e "alerta para golpe com pagamento da anuidade". Separar
exigiria casar pelo texto do assunto, que é a armadilha 7 do `CAIXAS-ESTADO.md`.
E não adianta ler o corpo: o CRM dispara por plataforma de marketing e o e-mail
só contém "clique aqui para ver on-line".

Então o robô **lista as mensagens do CRM no relatório**, dizendo qual é
informativo e qual é específico, e o André responde "lixeira" no número.

A renovação cadastral não corre risco: ela vem de
`naoresponda@portalmedico.org.br` e `naoresponda.crmmg.aps@portalmedico.org.br`,
protegidos pela linha do `portalmedico.org.br` acima.

## Nunca tocar — pessoas

Regra sua, registrada na faxina: **pessoa nunca se trata em bloco.**

Luciana, Daniele, Catia (Unimed) · Jonathan · Jenifer · Brunna ·
Osni Schlemper (família) · Crislaine · Tamires (Dell)

E, mais amplo: **qualquer mensagem que não seja claramente de um sistema
automático não se move**, esteja a pessoa nesta lista ou não. Ela vai para o
relatório.

---

## Vão para Spam

Reconstruída em 03/09/2026 lendo os remetentes que estavam de fato nas pastas
de Spam das contas — não de memória. Só entram domínios com 3+ mensagens e sem
conflito. Casar pelo **domínio raiz** (o Acordo Certo usa 16 subdomínios).

| Domínio | Volume no spam |
|---|---:|
| `maileffecti.com.br` | 154 |
| `dell.com` | 86 |
| `acordocerto.com.br` | 78 |
| `printi.com.br` | 63 |
| `bonifiq.com.br` | 55 |
| `elmeco.com.br` | 45 |
| `serasaexperian.com.br` | 41 |
| `takedaglobal.com` | 39 |
| `sebraemg.com.br` · `sebrae.com.br` | 39 |
| `linkedin.com` | 27 |
| `consumidorpositivo.com.br` | 26 |
| `clinrio.com.br` | 26 |
| `mkteffecti.com.br` | 23 |
| `medzone.com.br` | 17 |
| `xcom.com.br` | 12 |
| `brgenebra.com.br` | 11 |
| `oihelena.com` | 11 |
| `docusign.com` | 10 |
| `ciruvale.com.br` | 8 |
| `easeus.com` · `asus.com` | 12 |
| `rtpd.com.br` | 5 |
| `telediu.com.br` · `medpej.com.br` | 8 |
| `metamail.com` · `magazinemedica.com.br` | 6 |

**Decisões do André em 03/09:** Dell, DocuSign e LinkedIn entram no spam. No caso
do LinkedIn eu havia sugerido deixar de fora (mensagem de recrutador não é
propaganda) — ele decidiu incluir. Para reverter, basta apagar a linha.

Dell e DocuSign são seguros porque o que importa está protegido por outra via:
as mensagens da Tamires caem na regra de pessoas, e o documento assinado vem de
`docusign.**net**`, não `.com`.

### Excluídos de propósito — não transformar em regra

Apareceram nas pastas de spam, mas viraram regra seriam um estrago:

| Domínio | Por quê |
|---|---|
| `coop.br`, `ind.br`, `tec.br`, `log.br` | **Não são domínios**, são sufixos públicos (como `com.br`). `coop.br` pegaria a **Unimed Três Corações**, que manda o Demonstrativo de Repasse |
| `google.com`, `microsoft.com`, `apple.com`, `appleid.com` | Códigos de verificação e alertas de segurança da conta |
| `yahoo.com`, `hotmail.com` | Genéricos — arrastariam mensagens de pessoas |
| `portalmedico.org.br` | Está na lista de preservados (CFM) |
| `binance.com` | Manda código de segurança junto com a propaganda |

**Unimed fica fora do spam por inteiro.** `unimedtc.coop.br` manda tanto disparo
em massa quanto a Fatura e o Demonstrativo de Repasse da clínica. Não há regra
por domínio que separe os dois — então não se mexe, e vai para o relatório.

A cauda longa (50 domínios com 1 ou 2 mensagens) ficou de fora: pouco volume,
e o risco de acertar o alvo errado é maior que o ganho.

> ⚠️ **O iCloud não tem pasta de lixo eletrônico.** Nessa conta, propaganda vai
> para a Lixeira: não treina filtro e some em ~30 dias.

## Vão para a Lixeira

Automático sem valor de arquivo.

- Faturas Claro e Vivo (10 endereços diferentes — casar pelo domínio raiz)
- Alertas de segurança e avisos de login genéricos
- Corine – 4Medic
- `crm.f1saopaulo.com.br` (F1 São Paulo — venda de ingressos)
- `global.avenue.us` (Avenue — promoção de pontos)
- `adiumpharma.com` (Adium Pharma — cursos e convites)
- `mc.lilly.com` (Eli Lilly — webinars e convites)
- `secad.com.br` (Secad Artmed — vouchers e cursos)
- `auvp.com.br` (AUVP — curso de negócios)
- `psplillymelhorparavoce.com.br` (programa "Lilly Melhor Para Você" — promoção)
- `emkt.bluetree.com.br` (Blue Tree Hotels — promoções)
- `heygen.com` (HeyGen — novidades do produto)
- `microsoftrewards.com` (Microsoft Rewards — pontos e prêmios)
- `microsoftadvertising.com` (Microsoft Advertising — webinars e anúncios)

**Decisão do André em 16/11/2026:** as duas últimas linhas entraram depois da
primeira rodada do vigia, em que ele respondeu "lixeira o 13 e o 14". São
disparo de marketing por domínio próprio, sem conflito com o "nunca tocar".

**Decisão do André em 17/11/2026, rodada das 6h:**

- **Entraram** `adiumpharma.com` e `mc.lilly.com`. Ele mandou "lixeira o 9, o 10
  e o 13"; são convite e curso por domínio próprio, sem conflito com o "nunca
  tocar".
- **Não entraram**, de propósito: Afya/Whitebook (`pebmed.com.br`) e Amazon
  (`store-news@amazon.com.br`). Ele jogou as duas na Lixeira nesta rodada, mas
  quis decidir caso a caso. No caso da Amazon isso é também segurança: por
  domínio raiz, `amazon.com.br` levaria confirmação de pedido e aviso de entrega.
- **SAIU o Mercado Livre.** Estava aqui desde a faxina; na primeira rodada em
  modo real a regra mandou para a Lixeira, junto da propaganda, a confirmação de
  uma compra e o aviso de que a NF-e estava disponível. Separar as duas coisas
  exigiria casar pelo texto do assunto, que é a armadilha 7 do
  `CAIXAS-ESTADO.md`. Então **nada do Mercado Livre se move sozinho**: vai
  numerado para o relatório e ele responde pelo número.

**Decisão do André em 18/11/2026, depois da rodada das 6h:** ele mandou apagar
toda a seção "O que faço com isto?" (itens 5 a 12) e escolheu, na pergunta com
opções, que **só os de propaganda** viram regra: Secad, AUVP, o programa "Lilly
Melhor Para Você", Blue Tree e HeyGen. **Ficaram fora de propósito** a Unimed
Paraná (`secretaria@unimedpr.coop.br`), porque o sistema Unimed não se trata em
bloco, e a Amazon Music (`msg.amazonmusic.com`), porque Amazon ele decide caso
a caso. O CFM também não entra: a regra dele para CRM e CFM continua valendo.

**Decisão do André em 20/11/2026, depois da rodada das 6h ("regra o 8"):**
entraram `microsoftrewards.com` e `microsoftadvertising.com`. São domínios só de
propaganda, e não conflitam com o "nunca tocar" da Microsoft, que protege os
códigos de verificação e os alertas de segurança: esses chegam de
`microsoft.com` e dos subdomínios dele (`accountprotection.microsoft.com`), que
continuam intocáveis. Casar por estes dois domínios, nunca pelo nome "Microsoft".

> ⚠️ **Na conta da clínica, a lixeira é `[Gmail]/Lixeira`**, não `/Trash`. A
> `/Trash` que o Thunderbird criou é tratada pelo Gmail como etiqueta comum, e o
> que vai para lá **não** é apagado sozinho.

---

## Arquivar por ano

Mensagens de sistemas automáticos com mais de um ano vão para
`Arquivo/<ano>`, na conta de origem. Corte por data de chegada.

Não se arquiva por aqui: nada da lista "nunca tocar", nada escrito por pessoa.

## Notas fiscais

Notas automáticas vão para `Notas Fiscais Recebidas/<ano>` com etiqueta pelo
tomador:

| Etiqueta | Tomador |
|---|---|
| `nfpj` | CLINICA MEDICA SCHLEMPER LTDA (CNPJ, 14 dígitos) |
| `nfpf` | ANDRE LUIS SCHLEMPER (CPF, 11 dígitos) |
| `nfcristina` | CRISTINA SOUSA ARAUJO SCHLEMPER |
| *(sem etiqueta)* → `Terceiros` | Qualquer outro tomador |

Remetentes: `noreply-nfse@el.com.br` · `noreply@nfe-cidades.com.br` ·
`invoicy@migrate.info` · `nfe@marketingcartuchos.com.br` ·
`nfe@basariveiculos.com.br` · `nfe@cirurgicaestilo.com.br` ·
`envio_nfe@carrefour.com` · `nao-responder@spedy.com.br`

> As pastas `/NF`, `/NF ESA`, `/Prefeitura NF`, `/NF Unimed`, `/NF PM` e
> `/Murad contab` **não se tocam**. Elas guardam a *conversa sobre* emitir nota,
> não a nota automática — categorias diferentes, separadas de propósito.

---

## Resgate de spam — procurar o que NÃO é spam

Acrescentado em 16/11/2026, a pedido do André. Antes disso o vigia só
*descartava* o que já estava numa pasta de spam, por considerar que já tinha
sido tratado. Isso estava errado: a medição da sua caixa mostrou que **36% do
que está nas pastas de spam é legítimo** — na semana de 14/09/2026 o Thunderbird
marcou 52 de 92 mensagens, inclusive Unimed, XP e Claro.

Pastas a olhar, a cada rodada: `/Bulk` (Yahoo), `[Gmail]/Spam` (clínica e garb).
O iCloud não tem pasta de lixo eletrônico; nessa conta, olhe os últimos 7 dias
da `/Trash`.

**Quem decide continua sendo o remetente.** O corpo da mensagem serve só para
escrever o relatório, nunca para resgatar.

1. **Resgate automático** (volta para a Entrada da própria conta): somente
   remetentes das listas **"nunca tocar"** — transacionais, preservados e
   pessoas. Isso é a precedência nº 1 deste arquivo aplicada ao contrário: se
   "nunca tocar" vence uma lista de descarte, vence também o filtro de spam.
2. **Fica onde está, mas entra no relatório** numerado, na seção
   `🟢 PODE NÃO SER SPAM`: todo remetente que **não** está na lista de Spam
   deste arquivo. Você responde "resgata o 4" e o vigia move.
3. **Não entra no relatório**: remetente que está na lista de Spam. Esse é spam
   por decisão sua e fica quieto.

Em `modo: seco` nada se move, nem o resgate automático: o relatório diz o que
teria sido resgatado.

Mensagem de pessoa que caiu no spam é o caso mais importante desta seção.
Qualquer remetente que não pareça sistema automático vai para o relatório mesmo
que não esteja em lista nenhuma.

---

## Limite de segurança

```
limite por rodada: 200
```

Se as regras casarem com mais de 200 mensagens numa única rodada, ele **para
tudo e pergunta** em vez de executar. Serve contra regra mal escrita: o pior
caso vira "ele parou e perguntou", não "sumiram 3.000 mensagens".

---

## O que ele nunca consegue fazer

Não é regra deste arquivo, é trava de código, e vale também para o agente
automático: **enviar e-mail** e **apagar em definitivo** são impossíveis.
Apagar pasta também. Ver `AUDITORIA.md`.
