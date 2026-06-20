import crypto from "node:crypto";

// Admin tokeni: ADMIN_PASSWORD asosida HMAC. Parolning o'zi mijozga yuborilmaydi.
export function expectedToken() {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return null;
  return crypto.createHmac("sha256", pw).update("promet-admin-v1").digest("hex");
}

export function checkAuth(req) {
  const exp = expectedToken();
  if (!exp) return false;
  const tok = (req.headers["x-admin-token"] || "").toString();
  if (tok.length !== exp.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(tok), Buffer.from(exp));
  } catch {
    return false;
  }
}
