import { useEffect, useState } from "react";
import { fetchLeads, leadAction, fetchContent, getToken, setToken, login as apiLogin } from "../lib/api.js";
import ContentEditor from "./ContentEditor.jsx";

const IC = {
  dash: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>,
  leads: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92V21H2V3h6l2 3h12v10.92Z" /><path d="M16 21v-6m-4 6v-3m-4 3v-5" /></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4v16h16v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>,
  out: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>,
  ext: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14 21 3" /></svg>,
};

export default function AdminApp() {
  const [authed, setAuthed] = useState(!!getToken());
  const [page, setPage] = useState("dashboard");
  const [leads, setLeads] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [lv, cv] = await Promise.all([fetchLeads(), fetchContent()]);
      setLeads(Array.isArray(lv?.leads) ? lv.leads : []);
      setContent(cv || {});
    } catch (e) {
      if (/401|ruxsat|token/i.test(e.message)) { setToken(""); setAuthed(false); }
    } finally { setLoading(false); }
  }

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  function showFlash(text, err = false) { setFlash({ text, err }); setTimeout(() => setFlash(null), 3500); }

  async function onLeadAction(action, id) {
    try { await leadAction(action, id); await loadAll(); showFlash(action === "delete" ? "So'rov o'chirildi." : action === "clear_done" ? "Bajarilganlar tozalandi." : "Holat yangilandi."); }
    catch (e) { showFlash(e.message, true); }
  }

  if (!authed) return <div className="admin-root"><Login onLogin={() => setAuthed(true)} /></div>;

  const newCount = leads.filter((l) => l.status !== "done").length;

  return (
    <div className="admin-root">
      <div className="layout">
        <aside className="side">
          <div className="brand"><img src="/logo-mark.png" alt="" /><div><b>PROMET</b><small>Admin panel</small></div></div>
          <nav>
            <a className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")} style={{ cursor: "pointer" }}>{IC.dash}<span>Boshqaruv</span></a>
            <a className={page === "leads" ? "active" : ""} onClick={() => setPage("leads")} style={{ cursor: "pointer" }}>{IC.leads}<span>So'rovlar</span>{newCount > 0 && <span className="badge">{newCount}</span>}</a>
            <a className={page === "content" ? "active" : ""} onClick={() => setPage("content")} style={{ cursor: "pointer" }}>{IC.edit}<span>Sayt matni</span></a>
          </nav>
          <div className="bottom">
            <a href="/" target="_blank" rel="noopener noreferrer">{IC.ext}Saytni ochish</a>
            <a onClick={() => { setToken(""); setAuthed(false); }} style={{ cursor: "pointer" }}>{IC.out}Chiqish</a>
          </div>
        </aside>

        <main className="main">
          {flash && <div className={`flash${flash.err ? " err" : ""}`}>{!flash.err && <Check />}{flash.text}</div>}
          {loading ? <div className="empty">Yuklanmoqda...</div> :
            page === "dashboard" ? <Dashboard leads={leads} go={setPage} /> :
            page === "leads" ? <Leads leads={leads} onAction={onLeadAction} /> :
            <ContentEditor initial={content} onSaved={(msg) => showFlash(msg)} />}
        </main>
      </div>
    </div>
  );
}

const Check = (p) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}><path d="M20 6 9 17l-5-5" /></svg>);

function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await apiLogin(pw);
      if (r && r.ok && r.token) { setToken(r.token); onLogin(); }
      else { setErr(r?.message || "Parol noto'g'ri."); setBusy(false); }
    } catch (e) { setErr(e.message || "Xatolik."); setBusy(false); }
  }
  return (
    <div className="login-wrap"><div className="login-card">
      <div className="lg"><img src="/logo-mark.png" alt="" /><b>PROMET</b></div>
      <p>Admin panelga kirish</p>
      {err && <div className="err">{err}</div>}
      <form onSubmit={submit}>
        <label>Parol</label>
        <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Parolni kiriting" required />
        <button className="abtn abtn-green" style={{ width: "100%", marginTop: 16, justifyContent: "center" }} disabled={busy}>{busy ? "..." : "Kirish"}</button>
      </form>
    </div></div>
  );
}

function Dashboard({ leads, go }) {
  const total = leads.length;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * 864e5;
  const newCount = leads.filter((l) => l.status !== "done").length;
  const today = leads.filter((l) => l.created * 1000 >= todayStart.getTime()).length;
  const week = leads.filter((l) => l.created * 1000 >= weekAgo).length;
  const recent = leads.slice(0, 6);
  return (
    <>
      <div className="topbar"><div><h1>Boshqaruv</h1><div className="sub">So'rovlar va sayt holati shu yerda.</div></div>
        <a className="abtn abtn-green" onClick={() => go("leads")} style={{ cursor: "pointer" }}>So'rovlarni ko'rish</a></div>
      <div className="cards">
        <div className="card"><div className="lbl">Jami so'rovlar</div><div className="num">{total}</div></div>
        <div className="card amber"><div className="lbl">Yangi (ko'rilmagan)</div><div className="num">{newCount}</div></div>
        <div className="card green"><div className="lbl">Bugun</div><div className="num">{today}</div></div>
        <div className="card"><div className="lbl">7 kun ichida</div><div className="num">{week}</div></div>
      </div>
      <div className="panel">
        <div className="panel-head"><h2>So'nggi so'rovlar</h2><a className="abtn abtn-line abtn-sm" onClick={() => go("leads")} style={{ cursor: "pointer" }}>Hammasi</a></div>
        {recent.length === 0 ? (
          <div className="empty">Hali so'rovlar yo'q. Saytdagi forma to'ldirilsa, shu yerda ko'rinadi.</div>
        ) : (
          <table className="tbl"><thead><tr><th>Sana</th><th>Ism</th><th>Telefon</th><th>Viloyat</th><th>Holat</th></tr></thead>
            <tbody>{recent.map((l) => (
              <tr key={l.id}>
                <td className="muted">{fmt(l.created, true)}</td>
                <td>{l.name || "—"}</td>
                <td className="phone"><a href={`tel:${l.phone}`}>{l.phone}</a></td>
                <td className="muted">{l.region || "—"}</td>
                <td><span className={`tag ${l.status === "done" ? "done" : "new"}`}>{l.status === "done" ? "Bajarildi" : "Yangi"}</span></td>
              </tr>))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Leads({ leads, onAction }) {
  const newCount = leads.filter((l) => l.status !== "done").length;
  function exportCsv() {
    const rows = [["Sana", "Ism", "Telefon", "Viloyat", "Izoh", "Holat"]];
    leads.forEach((l) => rows.push([fmt(l.created), l.name, l.phone, l.region, l.message, l.status === "done" ? "Bajarildi" : "Yangi"]));
    const csv = "\uFEFF" + rows.map((r) => r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `promet-leadlar-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="topbar"><div><h1>So'rovlar (leadlar)</h1><div className="sub">Jami {leads.length} ta · Yangi {newCount} ta</div></div>
        <div className="row-actions">
          <button className="abtn abtn-line" onClick={exportCsv}>⬇ Excel/CSV</button>
          <button className="abtn abtn-line" onClick={() => { if (confirm("Bajarilgan so'rovlar o'chirilsinmi?")) onAction("clear_done"); }}>Bajarilganlarni tozalash</button>
        </div>
      </div>
      <div className="panel">
        {leads.length === 0 ? <div className="empty">Hali so'rovlar yo'q.</div> : (
          <table className="tbl"><thead><tr><th>Sana</th><th>Ism</th><th>Telefon</th><th>Viloyat</th><th>Izoh</th><th>Holat</th><th></th></tr></thead>
            <tbody>{leads.map((l) => (
              <tr key={l.id}>
                <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmt(l.created)}</td>
                <td>{l.name || "—"}</td>
                <td className="phone" style={{ whiteSpace: "nowrap" }}><a href={`tel:${l.phone}`}>{l.phone}</a></td>
                <td className="muted">{l.region || "—"}</td>
                <td style={{ maxWidth: 240 }}>{l.message || "—"}</td>
                <td><span className={`tag ${l.status === "done" ? "done" : "new"}`}>{l.status === "done" ? "Bajarildi" : "Yangi"}</span></td>
                <td><div className="row-actions">
                  <button className="abtn abtn-line abtn-sm" onClick={() => onAction("status", l.id)}>{l.status === "done" ? "↩ Yangi" : "✓ Bajarildi"}</button>
                  <button className="abtn abtn-danger abtn-sm" onClick={() => { if (confirm("O'chirilsinmi?")) onAction("delete", l.id); }}>🗑</button>
                </div></td>
              </tr>))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function fmt(ts, short = false) {
  const d = new Date((ts || 0) * 1000);
  const p = (n) => String(n).padStart(2, "0");
  const date = `${p(d.getDate())}.${p(d.getMonth() + 1)}${short ? "" : "." + d.getFullYear()}`;
  const time = `${p(d.getHours())}:${p(d.getMinutes())}`;
  return short ? `${date} ${time}` : `${date} ${time}`;
}
