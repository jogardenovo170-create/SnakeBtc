export async function sendLightningPayment({ destination, amount }) {
  const apiUrl = process.env.LIGHTNING_API_URL;
  const apiKey = process.env.LIGHTNING_API_KEY;

  if (!apiUrl) throw new Error("LIGHTNING_API_URL não está configurado.");
  if (!apiKey) throw new Error("LIGHTNING_API_KEY não está configurada.");

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/pay`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ destination, amount }),
    cache: "no-store"
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || `Lightning API HTTP ${response.status}`);
  return body;
}
