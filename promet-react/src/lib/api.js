// Frontend <-> serverless API o'rtasidagi yordamchi funksiyalar

const TOKEN_KEY = "promet_admin_token";

export function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
}
export function setToken(t) {
  try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch {}
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, opts);
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = (data && data.message) || `Xatolik (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ---- Ommaviy ----
export function fetchContent() {
  return jsonFetch("/api/content");
}
export function submitLead(payload) {
  return jsonFetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ---- Admin ----
export function login(password) {
  return jsonFetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}
function authHeaders() {
  return { "Content-Type": "application/json", "x-admin-token": getToken() };
}
export function fetchLeads() {
  return jsonFetch("/api/leads", { headers: authHeaders() });
}
export function leadAction(action, id) {
  return jsonFetch("/api/leads", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ action, id }),
  });
}
export function saveContent(content) {
  return jsonFetch("/api/content", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(content),
  });
}
