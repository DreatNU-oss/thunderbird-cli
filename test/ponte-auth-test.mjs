#!/usr/bin/env node

/**
 * Testes da autenticação da ponte (acréscimo pessoal — Fase 4).
 *
 * As outras duas suítes usam uma ponte SIMULADA e nunca executam
 * bridge/bridge.js. Esta suíte sobe a ponte de verdade e confere que:
 *
 *   - ela se recusa a subir sem token configurado;
 *   - recusa requisição sem token, com token errado ou de tamanho errado;
 *   - recusa requisição vinda de navegador (cabeçalho Origin/Referer);
 *   - recusa Host de outro domínio (defesa contra DNS rebinding);
 *   - deixa passar quem apresenta o token correto.
 *
 * Uso: npm run test:ponte
 */

import { spawn } from "child_process";
import { connect } from "net";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = 19710;
const PORTA_WS = 19711;
const TOKEN = "token-de-teste-nao-use-em-producao";

let passou = 0, falhou = 0;

function teste(nome, condicao, detalhe = "") {
  if (condicao) {
    console.log(`  \x1b[32m✓\x1b[0m ${nome}`);
    passou++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
    falhou++;
  }
}

function subirPonte(env) {
  return spawn("node", [
    join(RAIZ, "bridge", "bridge.js"),
    "--port", String(PORTA),
    "--ws-port", String(PORTA_WS),
  ], { env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
}

async function esperarPorta(ms = 4000) {
  const limite = Date.now() + ms;
  while (Date.now() < limite) {
    try {
      await fetch(`http://127.0.0.1:${PORTA}/bridge/status`);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return false;
}

async function chamar(cabecalhos = {}) {
  return await fetch(`http://127.0.0.1:${PORTA}/bridge/status`, { headers: cabecalhos });
}

// Requisição HTTP montada na mão, para conseguir forjar o cabeçalho Host
// (o fetch do Node não permite — ele reescreve o Host a partir da URL).
function requisicaoCrua(host, token) {
  return new Promise((resolve, reject) => {
    const socket = connect(PORTA, "127.0.0.1", () => {
      socket.write(
        `GET /bridge/status HTTP/1.1\r\n` +
        `Host: ${host}\r\n` +
        `Authorization: Bearer ${token}\r\n` +
        `Connection: close\r\n\r\n`
      );
    });
    let resposta = "";
    socket.on("data", (d) => (resposta += d.toString()));
    socket.on("end", () => resolve(resposta));
    socket.on("error", reject);
  });
}

// ─── 1. Recusa subir sem token ──────────────────────────────────────

console.log("\n\x1b[1mPonte sem token configurado\x1b[0m");
{
  const homeVazio = mkdtempSync(join(tmpdir(), "tb-sem-token-"));
  const proc = subirPonte({ HOME: homeVazio, TB_AUTH_TOKEN: "" });
  let saida = "";
  proc.stderr.on("data", (d) => (saida += d.toString()));
  const codigo = await new Promise((resolve) => proc.on("exit", resolve));

  teste("a ponte se recusa a subir", codigo === 1, `saiu com código ${codigo}`);
  teste("explica o motivo em português", saida.includes("RECUSANDO SUBIR"));
  teste("ensina como gerar o token", saida.includes("gerar-token.mjs"));
}

// ─── 2. Com token, exige o token ────────────────────────────────────

console.log("\n\x1b[1mPonte com token — exigindo autenticação\x1b[0m");
const ponte = subirPonte({ TB_AUTH_TOKEN: TOKEN });
ponte.stderr.on("data", () => {});
ponte.stdout.on("data", () => {});

if (!(await esperarPorta())) {
  console.error("✗ a ponte não subiu a tempo — abortando");
  ponte.kill();
  process.exit(1);
}

{
  const semToken = await chamar();
  teste("sem token → 401", semToken.status === 401, `veio ${semToken.status}`);
  const corpo = await semToken.json();
  teste("o erro diz o que fazer", corpo.code === "NAO_AUTORIZADO" && corpo.error.includes("gerar-token"));

  const errado = await chamar({ Authorization: "Bearer token-errado" });
  teste("token errado (tamanho diferente) → 401", errado.status === 401);

  const mesmoTamanho = await chamar({ Authorization: `Bearer ${"x".repeat(TOKEN.length)}` });
  teste("token errado (mesmo tamanho) → 401", mesmoTamanho.status === 401);

  const semBearer = await chamar({ Authorization: TOKEN });
  teste("token sem o prefixo Bearer → 401", semBearer.status === 401);

  const certo = await chamar({ Authorization: `Bearer ${TOKEN}` });
  teste("token correto → passa", certo.status === 200, `veio ${certo.status}`);
}

// ─── 3. Recusa navegador e Host estranho ────────────────────────────

console.log("\n\x1b[1mPonte — bloqueio de navegador e DNS rebinding\x1b[0m");
{
  const comOrigin = await chamar({
    Authorization: `Bearer ${TOKEN}`,
    Origin: "https://site-malicioso.example",
  });
  teste("requisição com Origin → 403", comOrigin.status === 403);
  teste("...e é recusada mesmo com o token certo", (await comOrigin.json()).code === "ORIGEM_RECUSADA");

  const comReferer = await chamar({
    Authorization: `Bearer ${TOKEN}`,
    Referer: "https://site-malicioso.example/pagina",
  });
  teste("requisição com Referer → 403", comReferer.status === 403);

  // Host forjado: simula um domínio externo que resolve para 127.0.0.1.
  // Precisa ser por conexão crua — o fetch do Node reescreve o Host a
  // partir da URL e não deixa forjá-lo.
  const hostFalso = await requisicaoCrua("site-malicioso.example", TOKEN);
  teste("Host de outro domínio → 403", hostFalso.includes(" 403 "), hostFalso.split("\r\n")[0]);
  teste("Host correto por conexão crua → passa", (await requisicaoCrua(`127.0.0.1:${PORTA}`, TOKEN)).includes(" 200 "));
}

// ─── 4. CORS desligado ──────────────────────────────────────────────

console.log("\n\x1b[1mPonte — CORS\x1b[0m");
{
  const r = await chamar({ Authorization: `Bearer ${TOKEN}` });
  teste(
    "não responde mais Access-Control-Allow-Origin: *",
    r.headers.get("access-control-allow-origin") === null
  );
}

ponte.kill();

console.log(`\n\x1b[1m${"─".repeat(40)}\x1b[0m`);
console.log(`\x1b[1m${passou} passaram, ${falhou} falharam, ${passou + falhou} no total\x1b[0m`);
process.exit(falhou > 0 ? 1 : 0);
