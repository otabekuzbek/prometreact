import { getLeads, setLeads } from "./_lib/redis.js";
import { checkAuth } from "./_lib/auth.js";
import { readBody } from "./_lib/util.js";

export default async function handler(req, res) {
  if (!checkAuth(req)) return res.status(401).json({ ok: false, message: "Ruxsat yo'q" });
  try {
    if (req.method === "GET") {
      const leads = await getLeads();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ ok: true, leads });
    }
    if (req.method === "POST") {
      const { action, id } = readBody(req);
      let leads = await getLeads();
      if (action === "delete") {
        leads = leads.filter((l) => l.id !== id);
      } else if (action === "status") {
        leads = leads.map((l) => (l.id === id ? { ...l, status: l.status === "done" ? "new" : "done" } : l));
      } else if (action === "clear_done") {
        leads = leads.filter((l) => l.status !== "done");
      } else {
        return res.status(400).json({ ok: false, message: "Noma'lum amal" });
      }
      await setLeads(leads);
      return res.status(200).json({ ok: true, leads });
    }
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message || "Server xatosi" });
  }
}
