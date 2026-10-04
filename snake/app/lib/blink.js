const BLINK_URL = "https://api.blink.sv/graphql";

export async function blinkGraphQL(query, variables = {}) {
  const apiKey = process.env.BLINK_API_KEY;
  if (!apiKey) throw new Error("BLINK_API_KEY não está configurada.");

  const response = await fetch(BLINK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-API-KEY": apiKey
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store"
  });

  const body = await response.json();

  if (!response.ok) throw new Error(`Blink HTTP ${response.status}`);
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }

  return body.data;
}
