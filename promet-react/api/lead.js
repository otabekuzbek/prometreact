import { getLeads, setLeads, redisReady } from "./_lib/redis.js";
import { readBody, clip } from "./_lib/util.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });
  try {
    const b = readBody(req);

    // Spam himoyasi (honeypot)
    if (b.website) return res.status(200).json({ ok: true });

    const phoneDigits = (b.phone || "").toString().replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      return res.status(200).json({ ok: false, message: "Iltimos, to'g'ri telefon raqam kiriting." });
    }
    if (!redisReady) {
      return res.status(200).json({ ok: false, message: "Server bazasi sozlanmagan (Upstash ulang)." });
    }

    const lead = {
      id: "ld_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      created: Math.floor(Date.now() / 1000),
      name: clip(b.name, 80),
      phone: clip(b.phone, 40),
      region: clip(b.region, 60),
      message: clip(b.msg, 800),
      status: "new",
    };

    const leads = await getLeads();
    leads.unshift(lead);
    await setLeads(leads.slice(0, 2000));

    await notifyTelegram(lead);

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message || "Server xatosi" });
  }
}

function fmtDate(ts) {
  const d = new Date(ts * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const text =
    `🆕 Yangi so'rov — PROMET\n\n` +
    `👤 Ism: ${lead.name || "—"}\n` +
    `📞 Tel: ${lead.phone}\n` +
    `📍 Viloyat: ${lead.region || "—"}\n` +
    (lead.message ? `📝 Izoh: ${lead.message}\n` : "") +
    `🕒 ${fmtDate(lead.created)}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
  } catch {
    /* bildirishnoma yuborilmasa ham so'rov saqlanadi */
  }
}
