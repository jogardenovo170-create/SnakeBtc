import { NextResponse } from "next/server";
import { blinkGraphQL } from "../../lib/blink";

export const runtime = "nodejs";

const ADDRESS_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request) {
  try {
    if (process.env.PAYOUTS_ENABLED !== "true") {
      return json({
        ok: false,
        error: "Backend ligado, mas pagamentos reais ainda estão desativados. Define PAYOUTS_ENABLED=true na Vercel depois dos testes."
      }, 503);
    }

    const walletId = process.env.BLINK_WALLET_ID;
    if (!walletId) {
      return json({ ok:false, error:"BLINK_WALLET_ID não está configurado." }, 500);
    }

    const body = await request.json();
    const lnAddress = String(body.lnAddress || "").trim();
    const amount = Number(body.amount);

    if (!ADDRESS_RE.test(lnAddress)) {
      return json({ ok:false, error:"Lightning Address inválido." }, 400);
    }

    if (!Number.isInteger(amount) || amount < 1) {
      return json({ ok:false, error:"O valor deve ser um número inteiro de sats." }, 400);
    }

    const maxPayout = Number(process.env.MAX_PAYOUT_SATS || "10");
    if (amount > maxPayout) {
      return json({ ok:false, error:`O máximo por pedido é ${maxPayout} sats.` }, 400);
    }

    const query = `
      mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
        lnAddressPaymentSend(input: $input) {
          status
          errors { code message path }
        }
      }
    `;

    const data = await blinkGraphQL(query, {
      input: { walletId, lnAddress, amount }
    });

    const result = data?.lnAddressPaymentSend;
    const errors = result?.errors || [];
    if (errors.length) {
      return json({ ok:false, error:errors.map((e)=>e.message).join("; ") }, 400);
    }

    return json({
      ok:true,
      status:result?.status || "SUCCESS",
      message:"Pagamento enviado para a Blink."
    });
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:"Não foi possível processar o pagamento." }, 500);
  }
}
