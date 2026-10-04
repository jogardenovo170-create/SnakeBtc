# Cobra Lightning — BTCPay Server com variáveis LIGHTNING_* ⚡

Variáveis Vercel:
- LIGHTNING_API_URL=https://mainnet.demo.btcpayserver.org
- LIGHTNING_API_KEY=<nova API key BTCPay>
- LIGHTNING_STORE_ID=<Store ID>
- PAYOUTS_ENABLED=false
- MAX_PAYOUT_SATS=1

O backend usa o endpoint oficial BTCPay:
POST /api/v1/stores/{storeId}/lightning/BTC/invoices/pay

Autenticação:
Authorization: token <API_KEY>

Esta versão paga invoices BOLT11 (lnbc...), não Lightning Address do tipo nome@dominio.
Mantenha PAYOUTS_ENABLED=false até validar URL, key, Store ID e node Lightning.
