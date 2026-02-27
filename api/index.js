export const config = { runtime: "nodejs" };

function b64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

async function fetchToken() {
  const base = process.env.PISTE_OAUTH_BASE; // ex: https://oauth.piste.gouv.fr
  const clientId = process.env.PISTE_CLIENT_ID;
  const clientSecret = process.env.PISTE_CLIENT_SECRET;

  if (!base || !clientId || !clientSecret) {
    return {
      ok: false,
      error: "Missing env",
      env: {
        PISTE_OAUTH_BASE: !!base,
        PISTE_CLIENT_ID: !!clientId,
        PISTE_CLIENT_SECRET: !!clientSecret,
      },
    };
  }

  const url = `${base}/api/oauth/token`;

  // --- Méthode 1 (recommandée) : Basic Auth ---
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${b64(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      // scope: "openid", // tu peux laisser commenté au début
    }),
  });

  const raw = await resp.text();

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {}

  return {
    ok: resp.ok,
    url,
    status: resp.status,
    statusText: resp.statusText,
    raw,
    parsed,
    used: "basic_auth",
  };
}

export default async function handler(req, res) {
  try {
    const out = await fetchToken();
    return res.status(out.ok ? 200 : 500).json(out);
  } catch (e) {
    return res.status(500).json({ fatal: String(e?.message || e) });
  }
}
