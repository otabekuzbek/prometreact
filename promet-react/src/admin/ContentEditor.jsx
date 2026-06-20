import { useState } from "react";
import { defaultContent } from "../lib/defaults.js";
import { saveContent } from "../lib/api.js";

export default function ContentEditor({ initial, onSaved }) {
  const [f, setF] = useState({ ...defaultContent, ...(initial || {}) });
  const [materials, setMaterials] = useState((f.materials || []).join(", "));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const sf = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const s2 = (k, i, j) => (e) => setF((s) => { const a = s[k].map((row) => [...row]); a[i][j] = e.target.value; return { ...s, [k]: a }; });
  const chip = (i) => (e) => setF((s) => { const a = [...s.hero_chips]; a[i] = e.target.value; return { ...s, hero_chips: a }; });

  async function save() {
    setBusy(true); setErr("");
    const payload = { ...f, materials: materials.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean) };
    try { await saveContent(payload); onSaved("Sayt matni saqlandi."); }
    catch (e) { setErr(e.message || "Saqlashda xatolik."); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="topbar"><div><h1>Sayt matni</h1><div className="sub">Saytdagi yozuvlarni shu yerdan o'zgartiring.</div></div>
        <a className="abtn abtn-line" href="/" target="_blank" rel="noopener noreferrer">Saytni ko'rish</a></div>

      {err && <div className="flash err">{err}</div>}

      <Panel title="Aloqa">
        <div className="grid2">
          <Field label="Telefon (ko'rinishi)"><input value={f.phone_display} onChange={sf("phone_display")} /></Field>
          <Field label="Telefon (bosilganda)" hint="Masalan: +998882606666"><input value={f.phone_tel} onChange={sf("phone_tel")} /></Field>
          <Field label="Telegram havola"><input value={f.telegram_url} onChange={sf("telegram_url")} placeholder="https://t.me/..." /></Field>
          <Field label="Instagram havola"><input value={f.instagram_url} onChange={sf("instagram_url")} placeholder="https://instagram.com/..." /></Field>
        </div>
      </Panel>

      <Panel title="Bosh ekran (Hero)">
        <Field label="Yuqori yozuv"><input value={f.hero_eyebrow} onChange={sf("hero_eyebrow")} /></Field>
        <div className="grid2">
          <Field label="Sarlavha — 1-qism"><input value={f.hero_title_1} onChange={sf("hero_title_1")} /></Field>
          <Field label="Sarlavha — yashil qism"><input value={f.hero_title_accent} onChange={sf("hero_title_accent")} /></Field>
        </div>
        <Field label="Sarlavha — oxirgi qism"><input value={f.hero_title_2} onChange={sf("hero_title_2")} /></Field>
        <Field label="Tavsif"><textarea value={f.hero_sub} onChange={sf("hero_sub")} /></Field>
        <Field label="3 ta belgi (chip)">
          <div className="grid2">{[0, 1, 2].map((i) => (<input key={i} value={f.hero_chips[i] || ""} onChange={chip(i)} />))}</div>
        </Field>
      </Panel>

      <Panel title="Statistika (4 ta)">
        {f.stats.map((st, i) => (
          <div className="grid2" key={i}>
            <Field label={`Raqam/so'z ${i + 1}`}><input value={st[0]} onChange={s2("stats", i, 0)} /></Field>
            <Field label={`Izoh ${i + 1}`}><input value={st[1]} onChange={s2("stats", i, 1)} /></Field>
          </div>
        ))}
      </Panel>

      <Panel title="Xizmatlar">
        <Field label="Bo'lim sarlavhasi"><input value={f.services_title} onChange={sf("services_title")} /></Field>
        <Field label="Materiallar (vergul bilan ajrating)"><textarea value={materials} onChange={(e) => setMaterials(e.target.value)} /></Field>
        {f.services.map((sv, i) => (
          <div className="subcard" key={i}><h4>Xizmat {i + 1}</h4>
            <Field label="Nomi"><input value={sv[0]} onChange={s2("services", i, 0)} /></Field>
            <Field label="Tavsif"><textarea value={sv[1]} onChange={s2("services", i, 1)} /></Field>
          </div>
        ))}
      </Panel>

      <Panel title="Nega biz">
        <Field label="Bo'lim sarlavhasi"><input value={f.why_title} onChange={sf("why_title")} /></Field>
        {f.why.map((w, i) => (
          <div className="subcard" key={i}><h4>Sabab {i + 1}</h4>
            <div className="grid2">
              <Field label="Nomi"><input value={w[0]} onChange={s2("why", i, 0)} /></Field>
              <Field label="Tavsif"><input value={w[1]} onChange={s2("why", i, 1)} /></Field>
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="Ishlarimiz (galereya)">
        <Field label="Bo'lim sarlavhasi"><input value={f.gallery_title} onChange={sf("gallery_title")} /></Field>
        <p className="hint" style={{ marginBottom: 12 }}>Rasm uchun internetdagi rasm havolasini (URL) qo'ying. Bo'sh qolsa chizma ko'rinadi.</p>
        {f.gallery.map((g, i) => (
          <div className="subcard" key={i}><h4>Rasm {i + 1}</h4>
            <div className="grid2">
              <Field label="Hudud/viloyat"><input value={g[0]} onChange={s2("gallery", i, 0)} /></Field>
              <Field label="Izoh"><input value={g[1]} onChange={s2("gallery", i, 1)} /></Field>
            </div>
            <Field label="Rasm havolasi (URL)"><input value={g[2] || ""} onChange={s2("gallery", i, 2)} placeholder="https://..." /></Field>
          </div>
        ))}
      </Panel>

      <Panel title="Pastki qism">
        <Field label="Bepul o'lchov — sarlavha"><input value={f.cta_title} onChange={sf("cta_title")} /></Field>
        <Field label="Bepul o'lchov — tavsif"><textarea value={f.cta_sub} onChange={sf("cta_sub")} /></Field>
        <Field label="Footer matni"><textarea value={f.footer_about} onChange={sf("footer_about")} /></Field>
      </Panel>

      <Panel title="Facebook Pixel">
        <Field label="Pixel ID" hint="Bu raqamni kiritsangiz, Pixel avtomatik ulanadi (PageView, Lead, Contact)."><input value={f.pixel_id} onChange={sf("pixel_id")} placeholder="Masalan: 1234567890123456" /></Field>
      </Panel>

      <div className="savebar"><button className="abtn abtn-green" onClick={save} disabled={busy}>{busy ? "Saqlanmoqda..." : "💾 Saqlash"}</button><span className="hint">O'zgarishlar darhol saytda ko'rinadi.</span></div>
    </>
  );
}

function Panel({ title, children }) {
  return (<div className="panel"><div className="panel-head"><h2>{title}</h2></div><div className="panel-body">{children}</div></div>);
}
function Field({ label, hint, children }) {
  return (<div className="fgroup"><label>{label}</label>{children}{hint && <div className="hint">{hint}</div>}</div>);
}
