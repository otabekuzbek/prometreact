import { expectedToken } from "./_lib/auth.js";
import { readBody } from "./_lib/util.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });
  const exp = expectedToken();
  if (!exp) {
    return res.status(200).json({ ok: false, message: "Server'da ADMIN_PASSWORD o'rnatilmagan." });
  }
  const { password } = readBody(req);
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ ok: true, token: exp });
  }
  return res.status(200).json({ ok: false, message: "Parol noto'g'ri." });
}
