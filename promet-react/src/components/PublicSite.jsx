import { useEffect, useRef, useState } from "react";
import { defaultContent } from "../lib/defaults.js";
import { fetchContent, submitLead } from "../lib/api.js";
import { Phone, Check, Telegram, Instagram, Globe, Menu, Roof, serviceIcons, whyIcons } from "./icons.jsx";

function injectPixel(id) {
  if (!id) return;
  if (window.fbq) { window.fbq("track", "PageView"); return; }
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq("init", id);
  window.fbq("track", "PageView");
}
const trackContact = () => { if (window.fbq) window.fbq("track", "Contact"); };

function useReveal(dep) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal:not(.in)"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [dep]);
}

export default function PublicSite() {
  const [c, setC] = useState(defaultContent);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchContent().then((data) => { if (data) setC({ ...defaultContent, ...data }); }).catch(() => {});
  }, []);
  useEffect(() => { injectPixel(c.pixel_id); }, [c.pixel_id]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useReveal(c);

  const tel = `tel:${c.phone_tel}`;

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="wrap nav-inner">
          <a href="#top" className="brand" aria-label="PROMET">
            <img src="/logo-mark.png" alt="PROMET logotipi" />
            <span className="brand-text"><span className="brand-name">PROMET</span><span className="brand-sub">Tom markazi</span></span>
          </a>
          <nav className="nav-links" aria-label="Asosiy menyu">
            <a href="#xizmatlar">Xizmatlar</a><a href="#nega">Nega biz</a><a href="#ishlar">Ishlarimiz</a><a href="#aloqa">Aloqa</a>
          </nav>
          <div className="nav-cta">
            <a href={tel} className="nav-phone" onClick={trackContact}><Phone /> {c.phone_display}</a>
            <a href="#aloqa" className="btn btn-primary">Bepul o'lchov</a>
            <button className="nav-toggle" aria-label="Menyu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><Menu /></button>
          </div>
        </div>
        <div className={`mobile-menu${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
          <a href="#xizmatlar">Xizmatlar</a><a href="#nega">Nega biz</a><a href="#ishlar">Ishlarimiz</a><a href="#aloqa">Aloqa</a>
          <a href="#aloqa" className="btn btn-primary">Bepul o'lchovga yozilish</a>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-inner">
            <span className="eyebrow reveal in">{c.hero_eyebrow}</span>
            <h1 className="reveal in">{c.hero_title_1}<b>{c.hero_title_accent}</b>{c.hero_title_2}</h1>
            <p className="hero-sub reveal in">{c.hero_sub}</p>
            <div className="hero-actions reveal in">
              <a href="#aloqa" className="btn btn-primary btn-lg">Bepul o'lchovga yozilish</a>
              <a href={tel} className="btn btn-ghost btn-lg" onClick={trackContact}><Phone width="17" height="17" /> {c.phone_display}</a>
            </div>
            <div className="hero-trust reveal in">
              {c.hero_chips.map((chip, i) => (<span className="tchip" key={i}><Check />{chip}</span>))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="section--tight bg-navy-2">
          <div className="wrap">
            <div className="stats stagger">
              {c.stats.map((s, i) => (<div className="stat reveal" key={i}><div className="n">{s[0]}</div><div className="l">{s[1]}</div></div>))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section bg-light" id="xizmatlar">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow reveal">Xizmatlar</span>
              <h2 className="sec-title reveal">{c.services_title}</h2>
            </div>
            <div className="mat-strip reveal">{c.materials.map((m, i) => (<span key={i}>{m}</span>))}</div>
            <div className="grid-3 stagger">
              {c.services.map((sv, i) => (
                <article className="svc reveal" key={i}>
                  <div className="svc-ico">{serviceIcons[i % serviceIcons.length]}</div>
                  <h3>{sv[0]}</h3><p>{sv[1]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="section bg-navy" id="nega">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow reveal">Nega PROMET</span>
              <h2 className="sec-title reveal">{c.why_title}</h2>
            </div>
            <div className="why-grid stagger">
              {c.why.map((w, i) => (
                <div className="why reveal" key={i}>
                  <div className="why-ico">{whyIcons[i % whyIcons.length]}</div>
                  <div><h3>{w[0]}</h3><p>{w[1]}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="section bg-navy-2" id="ishlar">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow reveal">Ishlarimiz</span>
              <h2 className="sec-title reveal">{c.gallery_title}</h2>
            </div>
            <div className="gallery stagger">
              {c.gallery.map((g, i) => {
                const img = g[2];
                return (
                  <div className={`tile reveal${img ? " has-img" : ""}`} key={i}>
                    {img ? <img src={img} alt={g[1]} loading="lazy" /> : null}
                    <Roof className="tile-ico" />
                    <div className="cap"><em>{g[0]}</em>{g[1]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA / FORM */}
        <section className="section bg-navy" id="aloqa">
          <div className="wrap cta-grid">
            <div className="cta-copy">
              <span className="eyebrow reveal">Bepul o'lchov</span>
              <h2 className="reveal">{c.cta_title}</h2>
              <p className="sec-lead reveal">{c.cta_sub}</p>
              <ul className="cta-points reveal">
                <li><Check width="20" height="20" />O'lchov va maslahat — bepul</li>
                <li><Check width="20" height="20" />Pod kalit — materialdan montajgacha</li>
                <li><Check width="20" height="20" />Yopilgan tomga 10 yil kafolat</li>
              </ul>
              <div className="contact-mini reveal">
                <a href={tel} onClick={trackContact}><Phone width="20" height="20" />{c.phone_display}</a>
                <a href={c.telegram_url} target="_blank" rel="noopener noreferrer"><Telegram />Telegram orqali yozish</a>
                <div><Globe /><div>O'zbekiston bo'ylab xizmat<small>Barcha viloyatlarda ustalar mavjud</small></div></div>
              </div>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <img src="/logo-white.png" alt="PROMET — Tom markazi" />
              <p>{c.footer_about}</p>
              <div className="socials">
                <a href={c.telegram_url} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><Telegram width="19" height="19" /></a>
                <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram /></a>
                <a href={tel} aria-label="Telefon"><Phone width="19" height="19" /></a>
              </div>
            </div>
            <div className="foot-col">
              <h4>Xizmatlar</h4>
              {c.services.slice(0, 5).map((sv, i) => (<a href="#xizmatlar" key={i}>{sv[0]}</a>))}
            </div>
            <div className="foot-col">
              <h4>Aloqa</h4>
              <p>Tel: {c.phone_display}</p><p>O'zbekiston bo'ylab</p>
              <a href="#aloqa" className="btn btn-primary" style={{ marginTop: "12px" }}>Bepul o'lchov</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} PROMET — Tom markazi. Barcha huquqlar himoyalangan.</span>
            <span>Tunkafon xizmati</span>
          </div>
        </div>
      </footer>

      <div className="callbar">
        <a href={tel} className="btn btn-ghost" onClick={trackContact}><Phone />Qo'ng'iroq</a>
        <a href="#aloqa" className="btn btn-primary">Bepul o'lchov</a>
      </div>
    </>
  );
}

function LeadForm() {
  const [form, setForm] = useState({ name: "", phone: "", region: "", msg: "", website: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const phoneRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const regions = ["Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", "Farg'ona", "Jizzax", "Xorazm", "Namangan", "Navoiy", "Qashqadaryo", "Qoraqalpog'iston", "Samarqand", "Sirdaryo", "Surxondaryo"];

  async function onSubmit(e) {
    e.preventDefault();
    const digits = (form.phone || "").replace(/\D/g, "");
    if (digits.length < 7) { phoneRef.current && (phoneRef.current.style.borderColor = "#E0623A", phoneRef.current.focus()); return; }
    setBusy(true);
    try {
      const r = await submitLead(form);
      if (r && r.ok) { if (window.fbq) window.fbq("track", "Lead"); setSent(true); }
      else { alert((r && r.message) || "Xatolik. Qayta urinib ko'ring."); setBusy(false); }
    } catch (err) { alert(err.message || "Tarmoq xatosi."); setBusy(false); }
  }

  if (sent) {
    return (
      <div className="form-card reveal">
        <div className="form-success show">
          <div className="ok"><Check width="30" height="30" /></div>
          <h3>So'rovingiz qabul qilindi!</h3>
          <p>Tez orada siz bilan bog'lanamiz. Rahmat!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card reveal">
      <form onSubmit={onSubmit} noValidate>
        <h3>Bepul o'lchovga yozilish</h3>
        <p className="fc-sub">Ma'lumotlarni qoldiring, qolganini biz bajaramiz.</p>
        <div className="hp"><label>Bo'sh qoldiring<input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label></div>
        <div className="field"><label>Ismingiz</label><input type="text" placeholder="Masalan, Jasur" autoComplete="name" value={form.name} onChange={set("name")} /></div>
        <div className="field"><label>Telefon raqamingiz <span className="req">*</span></label><input ref={phoneRef} type="tel" placeholder="+998 __ ___-__-__" autoComplete="tel" required value={form.phone} onChange={(e) => { set("phone")(e); if (phoneRef.current) phoneRef.current.style.borderColor = ""; }} /></div>
        <div className="field"><label>Viloyat</label>
          <select value={form.region} onChange={set("region")}>
            <option value="">Tanlang</option>
            {regions.map((r) => (<option key={r}>{r}</option>))}
          </select>
        </div>
        <div className="field"><label>Qisqacha izoh</label><textarea placeholder="Yangi tommi yoki ta'mir, taxminiy maydon..." value={form.msg} onChange={set("msg")} /></div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>{busy ? "Yuborilmoqda..." : "So'rov yuborish"}</button>
        <p className="privacy">Yuborish orqali biz bilan bog'lanishga rozilik bildirasiz.</p>
      </form>
    </div>
  );
}
