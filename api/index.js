export const config = { runtime: "nodejs" };

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const base = (process.env.PISTE_OAUTH_BASE || "").replace(/\/+$/, "");
    const clientId = process.env.PISTE_CLIENT_ID || "";
    const clientSecret = process.env.PISTE_CLIENT_SECRET || "";

    if (!base || !clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        error: "Variables manquantes (PISTE_OAUTH_BASE / PISTE_CLIENT_ID / PISTE_CLIENT_SECRET)",
      });
    }

    const tokenUrl = ${base}/api/oauth/token;

    // Basic Auth (recommandé pour client_credentials)
    const basic = Buffer.from(${clientId}:${clientSecret}, "utf8").toString("base64");

    // Body minimal (évite les variantes qui cassent l’auth)
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      // scope: "openid", // Décommente seulement si PISTE l’exige dans TON cas
    });

    const r = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": Basic ${basic},
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body,
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok) {
      // On renvoie un debug lisible sans fuite de secret
      return res.status(r.status).json({
        ok: false,
        url: tokenUrl,
        status: r.status,
        statusText: r.statusText,
        error: data,
        hint:
          r.status === 401
            ? "401=invalid_client : soit le secret/ID est faux, soit le client n’est pas autorisé sur cet environnement PISTE."
            : "Erreur PISTE (voir error).",
      });
    }

    // OK
    return res.status(200).json({
      ok: true,
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      scope: data.scope || null,
      // raw: data, // décommente si tu veux tout voir
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
