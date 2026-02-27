export const config = {
  runtime: 'nodejs',
};

async function getAccessToken() {
  const response = await fetch(`${process.env.PISTE_OAUTH_BASE}/api/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.PISTE_CLIENT_ID,
      client_secret: process.env.PISTE_CLIENT_SECRET,
      scope: "openid",
    }),
  });

  if (!response.ok) {
    throw new Error("Erreur récupération token");
  }

  return response.json();
}

export default async function handler(req, res) {
  try {
    const tokenData = await getAccessToken();

    return res.status(200).json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
