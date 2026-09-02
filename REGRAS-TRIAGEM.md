# Regras de triagem

Este arquivo manda no agente automático das 8h e das 14h. Ele é lido a cada
rodada. **É texto simples e é seu** — edite à vontade, sem pedir nada a ninguém.
Está no Git, então toda alteração fica registrada e dá para voltar atrás.

---

## Modo de operação

```
modo: seco
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
| Google, GitHub, Microsoft | Códigos de verificação e segurança da conta |
| Apple | Releases de aplicativo |
| Murad, JF Gestta, Sercon | Contabilidade |

## Nunca tocar — preservados

| Remetente | Por quê |
|---|---|
| `portalmedico.org.br` | CFM — inclui renovação de registro |
| `crmmg.org.br` | Conselho Regional de Medicina |

## Nunca tocar — pessoas

Regra sua, registrada na faxina: **pessoa nunca se trata em bloco.**

Luciana, Daniele, Catia (Unimed) · Jonathan · Jenifer · Brunna ·
Osni Schlemper (família) · Crislaine · Tamires (Dell)

E, mais amplo: **qualquer mensagem que não seja claramente de um sistema
automático não se move**, esteja a pessoa nesta lista ou não. Ela vai para o
relatório.

---

## Vão para Spam

Propaganda pura. No Gmail, mandar para Spam treina o filtro — por isso spam e
não lixeira.

- Acordo Certo — usa 16 subdomínios; casar pelo domínio raiz
- Takeda · Printi · Sebrae · Serasa · MedZone
- Kolplast/Bonifiq **apenas o marketing** (pedido faturado fica — ver precedência)

> ⚠️ **Lista incompleta de propósito.** Na faxina foram 38 domínios de envio em
> massa, mas o registro guardou o número, não a lista. Vou reconstruí-la lendo os
> remetentes que já estão hoje nas pastas de Spam — assim ela sai exata, e não
> de memória. Isso acontece na primeira rodada supervisionada.

> ⚠️ **O iCloud não tem pasta de lixo eletrônico.** Nessa conta, propaganda vai
> para a Lixeira: não treina filtro e some em ~30 dias.

## Vão para a Lixeira

Automático sem valor de arquivo.

- Faturas Claro e Vivo (10 endereços diferentes — casar pelo domínio raiz)
- Mercado Livre (10 endereços diferentes)
- Alertas de segurança e avisos de login genéricos
- Corine – 4Medic

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
