export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  try {
    return res.status(200).json({
      ID_CLIENT_PISTE: process.env.ID_CLIENT_PISTE || null,
      SECRET_DU_CLIENT_DE_LA_PISTE: process.env.SECRET_DU_CLIENT_DE_LA_PISTE ? "OK" : null,
      BASE_OAUTH_PISTE: process.env.BASE_OAUTH_PISTE || null
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
