# Cobra Lightning V2 ⚡

Nova versão completa com:
- jogo da cobra;
- conversão 100 pontos = 1 sat;
- frontend que chama `/api/withdraw`;
- backend Blink;
- variáveis para Vercel.

## Variáveis na Vercel
- BLINK_API_KEY
- BLINK_WALLET_ID
- PAYOUTS_ENABLED=false
- MAX_PAYOUT_SATS=10

Depois do deploy, testa primeiro com `PAYOUTS_ENABLED=false`.
Não coloques a API key no GitHub.

Nota: o saldo do jogo continua no browser. Antes de abrir pagamentos reais ao público, move saldo/autenticação para o servidor.
