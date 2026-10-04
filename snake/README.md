# Cobra Lightning - backend genérico ⚡

Esta versão não depende da Blink.

Na Vercel cria:
- LIGHTNING_API_URL
- LIGHTNING_API_KEY
- PAYOUTS_ENABLED=false
- MAX_PAYOUT_SATS=1

A Lightning Network não tem uma API única. Cada carteira/node tem o seu formato.
O ficheiro app/lib/lightning.js é um adaptador genérico e precisa de ser ajustado ao fornecedor que escolheres.

Mantém PAYOUTS_ENABLED=false até configurares e testares a API real.
