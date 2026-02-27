export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  try {
    return res.status(200).json({
      PISTE_CLIENT_ID: process.env.PISTE_CLIENT_ID || null,
      PISTE_CLIENT_SECRET: process.env.PISTE_CLIENT_SECRET ? "OK" : null,
      PISTE_OAUTH_BASE: process.env.PISTE_OAUTH_BASE || null
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
