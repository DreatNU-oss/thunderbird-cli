#!/usr/bin/env node

/**
 * Gera o token de autenticação da ponte e grava na configuração.
 *
 * Uso: node scripts/gerar-token.mjs
 *
 * A ponte (bridge/bridge.js) se recusa a subir sem um token. O CLI e o
 * servidor MCP leem o mesmo arquivo, então depois de rodar isto uma vez
 * as três peças passam a se entender sozinhas.
 *
 * O arquivo é gravado com permissão 600 (só o dono lê). Ele fica fora do
 * repositório de propósito — token não se guarda no Git.
 */

import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";

const CAMINHO = join(homedir(), ".config", "thunderbird-cli", "config.json");
const forcar = process.argv.includes("--forcar");

let config = {};
if (existsSync(CAMINHO)) {
  try {
    config = JSON.parse(readFileSync(CAMINHO, "utf-8"));
  } catch {
    console.error(`✗ ${CAMINHO} existe mas não é um JSON válido. Corrija ou apague antes.`);
    process.exit(1);
  }
}

const tokenAtual = config.bridge?.authToken || config.authToken;
if (tokenAtual && !forcar) {
  console.log(`✓ Já existe um token configurado em ${CAMINHO}`);
  console.log(`  Nada foi alterado. Para trocar por um novo: node scripts/gerar-token.mjs --forcar`);
  console.log(`  (trocar o token exige reiniciar a ponte)`);
  process.exit(0);
}

const token = randomBytes(32).toString("hex");

config.bridge = {
  ...(config.bridge || {}),
  host: config.bridge?.host || "127.0.0.1",
  httpPort: config.bridge?.httpPort || 7700,
  authToken: token,
};

mkdirSync(dirname(CAMINHO), { recursive: true });
writeFileSync(CAMINHO, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
chmodSync(CAMINHO, 0o600);

console.log(`✓ Token gerado e gravado em ${CAMINHO}`);
console.log(`  Permissão do arquivo: 600 (só você consegue ler)`);
console.log(`  O token em si não é exibido aqui de propósito — a ponte, o`);
console.log(`  terminal e o servidor MCP leem este arquivo sozinhos.`);
console.log(``);
console.log(`Agora dá para subir a ponte:  npm run bridge`);
