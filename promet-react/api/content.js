import { getContent, setContent } from "./_lib/redis.js";
import { checkAuth } from "./_lib/auth.js";
import { readBody } from "./_lib/util.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const content = await getContent();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(content);
    }
    if (req.method === "POST") {
      if (!checkAuth(req)) return res.status(401).json({ ok: false, message: "Ruxsat yo'q" });
      const body = readBody(req);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ ok: false, message: "Noto'g'ri ma'lumot" });
      }
      await setContent(body);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message || "Server xatosi" });
  }
}
