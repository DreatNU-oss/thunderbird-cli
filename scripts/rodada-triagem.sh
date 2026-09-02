#!/bin/bash
# Sobe e desce a ponte para uma rodada de triagem automática.
#
#   scripts/rodada-triagem.sh iniciar  → confere o Thunderbird, sobe a ponte,
#                                        ESPERA a extensão responder, imprime o token
#   scripts/rodada-triagem.sh parar    → desliga a ponte
#
# Por que esperar: medido em 03/09/2026, a extensão pode levar minutos para
# começar a responder depois que a ponte sobe — o socket conecta antes de o
# script de fundo do Thunderbird estar de fato processando. Consultar cedo
# demais devolve erro e a rodada falha à toa.

set -uo pipefail
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG=/tmp/ponte-triagem.log
ESPERA_MAX=${ESPERA_MAX:-240}   # segundos
PASSO=5

case "${1:-}" in
  iniciar)
    if ! pgrep -x thunderbird >/dev/null; then
      echo "ERRO_THUNDERBIRD_FECHADO: o Thunderbird não está aberto. Rodada cancelada."
      exit 2
    fi

    TOKEN=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.env.HOME+'/.config/thunderbird-cli/config.json')).bridge.authToken)" 2>/dev/null)
    if [ -z "${TOKEN:-}" ]; then
      echo "ERRO_SEM_TOKEN: rode 'npm run token'."
      exit 3
    fi

    # Desanexa a ponte: subshell (duplo fork) + as tres saidas redirecionadas.
    # Sem isso ela vira filha deste script e segura os descritores, travando
    # quem estiver lendo a saida. NAO usar setsid: nao existe no macOS.
    if ! pgrep -f "bridge/bridge.js" >/dev/null; then
      ( cd "$RAIZ" && nohup node bridge/bridge.js </dev/null >"$LOG" 2>&1 & )
      sleep 3
    fi

    # Falhar rapido e alto se a ponte nem subiu, em vez de esperar em vao.
    if ! pgrep -f "bridge/bridge.js" >/dev/null; then
      echo "ERRO_PONTE_NAO_SUBIU: veja $LOG"
      sed -n '1,10p' "$LOG" 2>/dev/null
      exit 5
    fi

    INICIO=$(date +%s)
    while :; do
      AGORA=$(($(date +%s) - INICIO))
      [ "$AGORA" -ge "$ESPERA_MAX" ] && break
      # -m 5: falhar rápido. A extensão dormindo faz a requisição pendurar.
      R=$(curl -s -m 5 -H "Authorization: Bearer $TOKEN" http://127.0.0.1:7700/health 2>/dev/null)
      case "$R" in
        *'"status":"ok"'*)
          echo "PRONTO em ${AGORA}s"
          echo "TOKEN=$TOKEN"
          exit 0 ;;
      esac
      sleep "$PASSO"
    done

    echo "ERRO_EXTENSAO_NAO_RESPONDEU: a ponte subiu mas a extensão não respondeu em ${ESPERA_MAX}s."
    echo "Provável causa: o script de fundo da extensão está dormente. Reiniciar o Thunderbird resolve."
    exit 4
    ;;

  parar)
    pkill -f "bridge/bridge.js" 2>/dev/null && echo "ponte desligada" || echo "ponte já estava desligada"
    exit 0
    ;;

  *) echo "uso: $0 {iniciar|parar}"; exit 1 ;;
esac
