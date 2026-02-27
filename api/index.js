export default async function handler(req, res) {
  try {
    const clientId = process.env.ID_CLIENT_PISTE;
    const clientSecret = process.env.SECRET_DU_CLIENT_DE_LA_PISTE;
    const tokenUrl = process.env.BASE_OAUTH_PISTE;

    if (!clientId || !clientSecret || !tokenUrl) {
      return res.status(500).json({
        ok: false,
        error: "Variables d’environnement manquantes (ID_CLIENT_PISTE / SECRET_DU_CLIENT_DE_LA_PISTE / BASE_OAUTH_PISTE)"
      });
    }

    // =========================
    // 1️⃣ Récupération du token OAuth PISTE
    // =========================
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenText = await tokenResponse.text();
    let tokenData;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      tokenData = { raw: tokenText };
    }

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(tokenResponse.status).json({
        ok: false,
        step: "token",
        status: tokenResponse.status,
        tokenData
      });
    }

    // =========================
    // 2️⃣ Appel API Légifrance
    // =========================
    const legifranceUrl = "https://api.piste.gouv.fr/dila/legifrance/lf-engine-app/consult/getTexte";

    const payload = {
      textId: "LEGITEXT000006070719"
    };

    const apiResponse = await fetch(legifranceUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const apiText = await apiResponse.text();
    let apiData;

    try {
      apiData = JSON.parse(apiText);
    } catch {
      apiData = { raw: apiText };
    }

    return res.status(apiResponse.status).json({
      ok: apiResponse.ok,
      status: apiResponse.status,
      data: apiData
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || String(error)
    });
  }
}
