api/index.js
export default function handler(req, res) {
  res.status(200).json({ message: "Proxy OAuth actif" });
}
