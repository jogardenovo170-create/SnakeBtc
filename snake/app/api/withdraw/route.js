import { NextResponse } from "next/server";
import { sendLightningPayment } from "../../lib/lightning";

export const runtime = "nodejs";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request) {
  try {
    if (process.env.PAYOUTS_ENABLED !== "true") {
      return json({
        ok: false,
        error: "Backend Lightning ligado, mas pagamentos reais ainda estão desativados."
      }, 503);
    }

    const body = await request.json();
    const destination = String(body.destination || "").trim();
    const amount = Number(body.amount);

    if (!destination) return json({ ok:false, error:"Destino Lightning em falta." }, 400);
    if (!Number.isInteger(amount) || amount < 1) return json({ ok:false, error:"Valor inválido." }, 400);

    const maxPayout = Number(process.env.MAX_PAYOUT_SATS || "1");
    if (amount > maxPayout) {
      return json({ ok:false, error:`O máximo por pedido é ${maxPayout} sats.` }, 400);
    }

    const result = await sendLightningPayment({ destination, amount });

    return json({
      ok: true,
      message: "Pagamento enviado pelo backend Lightning.",
      result
    });
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:"Não foi possível processar o pagamento Lightning." }, 500);
  }
}
