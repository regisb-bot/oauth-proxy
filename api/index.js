export default async function handler(req, res) {
  try {
    const clientId = process.env.PISTE_CLIENT_ID;
    const clientSecret = process.env.PISTE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        error: "PISTE_CLIENT_ID / PISTE_CLIENT_SECRET manquants dans Vercel"
      });
    }

    // 1) Token OAuth (client_credentials)
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResp = await fetch("https://oauth.piste.gouv.fr/api/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenText = await tokenResp.text();
    const tokenData = JSON.parse(tokenText);

    if (!tokenResp.ok || !tokenData.access_token) {
      return res.status(tokenResp.status).json({
        ok: false,
        where: "token",
        tokenData
      });
    }

    // 2) Appel Legifrance
    const url = "https://api.piste.gouv.fr/dila/legifrance/lf-engine-app/consult/getTexte";
    const payload = { textId: "LEGITEXT000006070719" };

    const apiResp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const apiText = await apiResp.text();
    let apiData;
    try { apiData = JSON.parse(apiText); } catch { apiData = { raw: apiText }; }

    return res.status(apiResp.status).json({
      ok: apiResp.ok,
      status: apiResp.status,
      data: apiData
    });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
