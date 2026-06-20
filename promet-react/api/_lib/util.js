export function readBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === "string") {
    try { return JSON.parse(b); } catch { return {}; }
  }
  return b;
}

export function clip(s, n) {
  s = (s ?? "").toString();
  return s.length > n ? s.slice(0, n) : s;
}
