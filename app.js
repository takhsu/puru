// ---------------------------------------------------------------------------
// Language: English by default; every translatable node carries its Chinese in data-zh (and data-zh-alt / -aria-label / -content).
// ---------------------------------------------------------------------------
const i18n = (() => {
  const ATTRS = ["alt", "aria-label", "content"];
  let lang = "en";
  function apply(next) {
    lang = next;
    document.documentElement.lang = lang === "zh" ? "zh-Hant-TW" : "en";
    document.querySelectorAll("[data-zh]").forEach((el) => {
      if (el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = lang === "zh" ? el.dataset.zh : el.dataset.en;
    });
    ATTRS.forEach((attr) => {
      document.querySelectorAll(`[data-zh-${attr}]`).forEach((el) => {
        if (!el.hasAttribute(`data-en-${attr}`)) el.setAttribute(`data-en-${attr}`, el.getAttribute(attr));
        el.setAttribute(attr, el.getAttribute(lang === "zh" ? `data-zh-${attr}` : `data-en-${attr}`));
      });
    });
    document.querySelectorAll("#lang [data-l]").forEach((el) => el.classList.toggle("on", el.dataset.l === lang));
  }
  return { apply, get lang() { return lang; } };
})();

// ---------------------------------------------------------------------------
// Site settings. Edit only this block when the GitHub release and the feedback address exist.
// ---------------------------------------------------------------------------
const SITE = {
  downloadUrl: "https://github.com/takhsu/puru/releases/download/v0.9.0/PURUCUT-0.9.0-portable-x64.zip",
  downloadMeta: "",  // leave empty to keep the default line in index.html
  feedbackUrl: "https://github.com/takhsu/puru/issues",
  sourceUrl: ""      // source code repository
};

(function wireLinks() {
  const ready = Boolean(SITE.downloadUrl);
  document.querySelectorAll("[data-download]").forEach((a) => {
    if (ready) { a.href = SITE.downloadUrl; return; }
    if (a.closest(".hero")) { a.href = "#download"; return; }
    a.textContent = "Coming soon"; a.dataset.zh = "即將開放";
    a.setAttribute("aria-disabled", "true");
    a.removeAttribute("href");
  });
  const meta = document.querySelector("[data-download-meta]");
  const soon = document.querySelector("[data-download-soon]");
  if (meta && SITE.downloadMeta) { meta.textContent = SITE.downloadMeta; meta.removeAttribute("data-zh"); }
  if (soon) soon.hidden = ready;

  const note = (text, zh) => { const e = document.createElement("span"); e.textContent = text; if (zh) e.dataset.zh = zh; return e; };
  const feedback = document.querySelector("[data-feedback]");
  if (feedback) {
    if (SITE.feedbackUrl) feedback.href = SITE.feedbackUrl;
    else feedback.replaceWith(note("(feedback address coming soon)", "（回饋信箱準備中）"));
  }
  const source = document.querySelector("[data-source]");
  if (source) {
    if (SITE.sourceUrl) source.href = SITE.sourceUrl;
    else source.replaceWith(note("Source code: coming soon."));
  }
})();

(function langSwitch() {
  const btn = document.getElementById("lang");
  let saved = "en";
  try { saved = localStorage.getItem("puru-lang") === "zh" ? "zh" : "en"; } catch {}
  i18n.apply(saved);
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = i18n.lang === "zh" ? "en" : "zh";
    i18n.apply(next);
    try { localStorage.setItem("puru-lang", next); } catch {}
    window.dispatchEvent(new Event("resize"));      // text lengths changed
  });
})();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------------------------------------------------------------------------
// Hero. The octopus winds its key, puffs a ring out of its snout, the ring bounces letter by letter
// along "Work happy.", then drops back into the snout and becomes the dot in the mouth again.
// The octopus keyframes are the app's intro; the puff-out moment launches the ring instead of letters.
// ---------------------------------------------------------------------------
(function hero() {
  const svg = document.getElementById("mascot-svg");
  const holder = document.getElementById("mascot");
  const stage = document.getElementById("stage");
  const title = document.getElementById("hero-title");
  if (!svg || !holder || !stage || !title) return;

  const FG = "#fff";
  const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const eob = (x) => { x = clamp(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  function key(t, k) {
    if (t <= k[0][0]) return k[0][1];
    for (let i = 0; i < k.length - 1; i++) {
      const [a, x] = k[i], [b, y] = k[i + 1];
      if (t <= b) return x + (y - x) * sm((t - a) / (b - a));
    }
    return k[k.length - 1][1];
  }
  function spring(t, imps, w = 2 * Math.PI * 3.4, a = 6.5) {
    let s = 0;
    for (const [t0, amp] of imps) { const u = t - t0; if (u > 0) s += amp * Math.exp(-a * u) * Math.sin(w * u); }
    return s;
  }

  const clicks = [1.35, 1.9, 2.45];
  const letterT = [3.55, 3.8, 4.05, 4.3], pillT = 4.75, hopT = 5.2;
  const X = (x) => 248 + 74 * x, Y = (y) => 282 - 80 * y;
  const seg = [[[-1.46,-.56],[-2.0,.5],[-1.45,1.77],[0,1.77]],[[0,1.77],[1.42,1.77],[2,.53],[1.46,-.56]],[[1.46,-.56],[1.2,-.93],[2,-.82],[1.68,-1.22]],[[1.68,-1.22],[1.48,-1.48],[1.13,-1.32],[.94,-1.1]],[[.94,-1.1],[1.12,-1.83],[.2,-1.8],[0,-1.37]],[[0,-1.37],[-.21,-1.82],[-1.12,-1.82],[-.94,-1.1]],[[-.94,-1.1],[-1.34,-1.55],[-1.89,-1.42],[-1.74,-1.1]],[[-1.74,-1.1],[-1.62,-.89],[-1.22,-.99],[-1.46,-.56]]]
    .map((s) => s.map((p) => [X(p[0]), Y(p[1])]));
  const PX = 250, PY = 425;

  function state(t) {
    const S = {};
    const breath = Math.sin(t * 2 * Math.PI / 2.7);
    const crouch = key(t, [[0,0],[.85,0],[1.3,1],[1.35,1],[1.5,0],[8,0]]);
    const inhale = key(t, [[0,0],[2.95,0],[3.4,1],[3.5,1],[3.7,0],[8,0]]);
    const hk = key(t, [[0,0],[hopT-.02,0],[hopT+.16,-1],[hopT+.36,1],[hopT+.64,0],[8,0]]);
    const air = key(t, [[0,0],[hopT+.16,0],[hopT+.36,1],[hopT+.56,0],[8,0]]);
    S.hop = 30 * air;
    const hsy = hk < 0 ? 0.09 * hk : 0.07 * hk;
    const pulse = spring(t, clicks.map((c) => [c, -.012]).concat(letterT.map((c) => [c, -.010])).concat([[pillT, -.006], [hopT + .6, -.014]]), 2 * Math.PI * 3.4, 6.5);
    S.sy = 1 + .016 * breath - .05 * crouch + .07 * inhale + hsy + pulse;
    S.sx = 1 / Math.sqrt(S.sy) * (1 + .02 * inhale);
    S.lean = 8 * spring(t, clicks.map((c) => [c, .5]).concat([[hopT + .6, .4]]), 2 * Math.PI * 2.6, 5.5) + 3 * crouch + 2.5 * Math.sin(t * 2 * Math.PI / 3.3);
    const shake = key(t, [[0,0],[2.9,0],[3.0,1],[3.4,1],[3.5,0],[8,0]]);
    S.lean += shake * 2.2 * Math.sin(t * 70);
    const ripImps = clicks.map((c) => [c, 1.2]).concat([[hopT + .6, 1.8]]).concat(letterT.map((c) => [c, .6]));
    S.rip = (x) => 6 * spring(t - (x - PX) * .0007, ripImps, 2 * Math.PI * 3, 5.2) + 2.2 * Math.sin(t * 2 * Math.PI / 1.9 + (x - PX) * .04);
    const look = key(t, [[0,0],[.9,0],[1.2,1],[3.0,1],[3.3,0],[3.5,0],[3.7,-1],[4.9,-1],[5.1,0],[8,0]]);
    S.gx = look > 0 ? 6 * look : 0; S.gy = look > 0 ? -5 * look : 4 * (-look);
    let eb = 1;
    for (const b of [.5, 3.05, 6.7]) { const u = (t - b) / .16; if (u > 0 && u < 1) eb = Math.min(eb, 1 - .92 * Math.sin(Math.PI * u)); }
    const squeeze = key(t, [[0,0],[2.9,0],[3.0,.45],[3.4,.45],[3.55,0],[8,0]]);
    const happy = key(t, [[0,0],[hopT-.05,0],[hopT+.08,1],[hopT+.9,1],[hopT+1.1,0],[8,0]]);
    S.eyeSY = Math.min(eb, 1 - squeeze) * (1 - .86 * happy);
    const puck = key(t, [[0,0],[3.0,0],[3.35,1],[3.5,1],[3.62,0],[8,0]]);
    S.mouthS = 1 - .3 * puck + spring(t, letterT.map((c) => [c, .12]), 2 * Math.PI * 5, 9);
    let ang = 0;
    for (const c of clicks) ang += Math.PI * 2 / 3 * eob((t - c) / .3);
    S.ang = ang;           // three clicks = one full turn; the long spin of the intro is dropped so the loop closes
    return S;
  }

  function D(x, y, S) {
    const h = clamp((y - 330) / 110); y += h * S.rip(x);
    const hw = Math.pow(clamp((430 - y) / 290), 1.4); x += S.lean * hw;
    x = PX + (x - PX) * S.sx; y = PY + (y - PY) * S.sy; y -= S.hop;
    return [x, y];
  }

  const f = (n) => n.toFixed(2);
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const stroke = { fill: "none", stroke: FG, "stroke-linejoin": "round", "stroke-linecap": "round" };
  const body = mk("path", { ...stroke, "stroke-width": 22 });
  const eyes = [0, 1].map(() => mk("ellipse", { fill: FG }));
  const mouth = mk("g", {});
  mk("ellipse", { rx: 44, ry: 31, ...stroke, "stroke-width": 19 }, mouth);
  const dotEl = mk("circle", { cx: 8, cy: -1, r: 9, ...stroke, "stroke-width": 7 }, mouth);
  const arm = mk("line", { stroke: FG, "stroke-width": 14, "stroke-linecap": "round" });
  const rings = [0, 1].map(() => { const g = mk("g", {}); return { g, e: mk("ellipse", { ...stroke, "stroke-width": 14 }, g) }; });
  let lastDot = { x: 0, y: 0 }, dotShown = true;

  // the screen position of the mouth dot; read before any write in the frame
  function readDot(S) {
    const m = D(284, 326, S), a = S.mouthS * S.sx, b = S.mouthS * S.sy, th = -17 * Math.PI / 180;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = m[0] + 8 * a * Math.cos(th) + b * Math.sin(th); pt.y = m[1] + 8 * a * Math.sin(th) - b * Math.cos(th);
    const c = pt.matrixTransform(ctm);
    lastDot = { x: c.x, y: c.y };
  }

  function render(t, showDot) {
    const S = state(t), P = (p) => D(p[0], p[1], S);
    let d = "";
    seg.forEach((sg, i) => {
      const q = sg.map(P);
      if (i === 0) d += `M${f(q[0][0])} ${f(q[0][1])}`;
      d += ` C${f(q[1][0])} ${f(q[1][1])} ${f(q[2][0])} ${f(q[2][1])} ${f(q[3][0])} ${f(q[3][1])}`;
    });
    body.setAttribute("d", d + "Z");
    [[203, 277], [329, 268]].forEach(([ex, ey], i) => {
      const p = D(ex + S.gx, ey + S.gy, S);
      eyes[i].setAttribute("cx", f(p[0])); eyes[i].setAttribute("cy", f(p[1]));
      eyes[i].setAttribute("rx", f(15 * S.sx)); eyes[i].setAttribute("ry", f(Math.max(1.6, 15 * S.sy * S.eyeSY)));
    });
    const m = D(284, 326, S);
    mouth.setAttribute("transform", `translate(${f(m[0])} ${f(m[1])}) rotate(-17) scale(${f(S.mouthS * S.sx)} ${f(S.mouthS * S.sy)})`);
    if (showDot !== dotShown) { dotShown = showDot; dotEl.style.display = showDot ? "" : "none"; }
    const A = D(344, 166, S), M0 = D(378, 133, S);
    const ma = Math.atan2(M0[1] - A[1], M0[0] - A[0]), L = Math.hypot(M0[0] - A[0], M0[1] - A[1]);
    const M = [A[0] + Math.cos(ma) * L, A[1] + Math.sin(ma) * L], pv = [-Math.sin(ma), Math.cos(ma)];
    arm.setAttribute("x1", f(A[0])); arm.setAttribute("y1", f(A[1])); arm.setAttribute("x2", f(M[0])); arm.setAttribute("y2", f(M[1]));
    const order = [-1, 1].map((sg) => ({ sg, z: Math.sin(S.ang) * sg, c: Math.cos(S.ang) })).sort((p, q) => p.z - q.z);
    order.forEach((r, i) => {
      const ctr = [M[0] + pv[0] * 28 * r.sg * r.c, M[1] + pv[1] * 28 * r.sg * r.c], sc = 1 + .10 * r.z;
      const ring = rings[i];
      ring.g.setAttribute("transform", `translate(${f(ctr[0])} ${f(ctr[1])}) rotate(${f(ma * 180 / Math.PI)})`);
      ring.e.setAttribute("rx", f(20 * sc)); ring.e.setAttribute("ry", f(Math.max(.01, 20 * sc * Math.abs(r.c))));
      svg.appendChild(ring.g);   // keeps the nearer ring on top
    });
  }

  // ----- headline letters (the first line is the ball's runway) -----
  const line1 = title.querySelector(".hero__line");
  title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());
  line1.innerHTML = [...line1.textContent].map((ch) => (ch === " " ? " " : `<span class="ltr" aria-hidden="true">${ch}</span>`)).join("");
  const letters = [...line1.querySelectorAll(".ltr")].filter((el) => /[A-Za-z]/.test(el.textContent));   // W o r k h a p p y

  // ----- the ball -----
  const ball = document.createElement("div");
  ball.className = "ball";
  ball.setAttribute("aria-hidden", "true");
  stage.appendChild(ball);

  const T0 = 3.55, LEG_FIRST = .55, LEG_HOP = .26, LEG_LAST = .62;
  const T_FIRST = T0 + LEG_FIRST;                                   // lands on the first letter
  const T_LAST = T_FIRST + (letters.length - 1) * LEG_HOP;          // leaves the last letter
  const TL = T_LAST + LEG_LAST;                                     // back in the mouth
  const END_T = 6.6, HOP_T = 5.14;
  const PERIOD = TL + (END_T - HOP_T);
  const K_MAX = 1.9;
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);

  function octopusTime(tau) {
    if (tau < T0) return tau;
    if (tau < TL) return 3.55 + (tau - T0) / (TL - T0) * (HOP_T - 3.55);
    return HOP_T + (tau - TL);
  }

  function resetLetters() { letters.forEach((el) => { if (el.style.transform) el.style.transform = ""; }); }

  // layout is measured only when it can have changed (resize, scroll, start of a loop), never in the middle of a bounce
  let M = null, dirty = true, premeasured = false;
  function measure() {
    const sr = stage.getBoundingClientRect(), svgR = svg.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(title).fontSize);
    const Rb = 12.5 * svgR.width / 512 * K_MAX;                       // the dot is 12.5 units wide on a 512-unit mascot
    ball.style.width = ball.style.height = (2 * Rb).toFixed(1) + "px";
    ball.style.borderWidth = (Rb * .56).toFixed(1) + "px";
    const L = letters.map((el) => {
      const r = el.getBoundingClientRect(), ch = el.textContent;
      const top = ch === "k" || ch === "h" ? .07 : ch === "W" ? .11 : .32;     // where the glyph top sits inside its box
      return { x: r.left + r.width / 2 - sr.left, y: r.top - sr.top + fs * top - Rb };
    });
    M = { sr, Rb, fs, L };
  }

  function updateBall(tau) {
    if (tau < T0 || tau >= TL) { ball.style.opacity = 0; resetLetters(); return; }
    const { sr, Rb, fs, L } = M;
    const mouth = { x: lastDot.x - sr.left, y: lastDot.y - sr.top };

    let from, to, u, H, k0, k1;
    if (tau < T_FIRST) { from = mouth; to = L[0]; u = (tau - T0) / LEG_FIRST; H = 1.25 * fs; k0 = 1; k1 = K_MAX; }
    else if (tau < T_LAST) {
      const idx = Math.min(L.length - 2, Math.floor((tau - T_FIRST) / LEG_HOP));
      from = L[idx]; to = L[idx + 1]; u = (tau - T_FIRST - idx * LEG_HOP) / LEG_HOP; H = .5 * fs; k0 = k1 = K_MAX;
    } else { from = L[L.length - 1]; to = mouth; u = (tau - T_LAST) / LEG_LAST; H = 1.5 * fs; k0 = K_MAX; k1 = 1; }

    u = clamp(u);
    const x = from.x + (to.x - from.x) * u;
    const y = from.y + (to.y - from.y) * u - H * 4 * u * (1 - u);
    const k = k0 === k1 ? k0 : k0 + (k1 - k0) * (k1 > k0 ? easeOut(u) : u * u);
    ball.style.opacity = 1;
    ball.style.transform = `translate(${(x - Rb).toFixed(1)}px, ${(y - Rb).toFixed(1)}px) scale(${(k / K_MAX).toFixed(3)})`;

    // each letter dips a little under the ball when it lands
    letters.forEach((el, i) => {
      const ti = T_FIRST + i * LEG_HOP, d = (tau - ti) / .2;
      el.style.transform = d >= 0 && d < 1 ? `translateY(${(Math.sin(Math.PI * d) * .06 * fs).toFixed(1)}px) scaleY(${(1 - .05 * Math.sin(Math.PI * d)).toFixed(3)})` : "";
    });
  }

  function frame(tau) {
    if (tau < T0) { if (!premeasured) { premeasured = true; dirty = true; } } else premeasured = false;
    if (dirty || !M) { measure(); dirty = false; }
    const t = octopusTime(tau), showDot = tau < T0 || tau >= TL;
    if (tau >= T0 && tau < TL) readDot(state(t));                       // read before writing, so the frame forces no extra layout
    render(t, showDot);
    updateBall(tau);
  }
  const markDirty = () => { dirty = true; };
  window.addEventListener("scroll", markDirty, { passive: true });
  window.addEventListener("resize", markDirty);

  if (reducedMotion) {
    frame(.6);
    return;
  }

  let raf = 0, visible = true, elapsed = 0, last = 0;
  function tick(now) {
    elapsed += Math.min(.05, (now - last) / 1000);   // a hidden tab must not skip ahead
    last = now;
    frame(elapsed % PERIOD);
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  frame(0);
  setTimeout(start, 250);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(holder);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  window.addEventListener("resize", () => frame(elapsed % PERIOD));
})();

// ---------------------------------------------------------------------------
// Scroll: viewfinder frame, headlines that stretch into place, parallax, reveals.
// ---------------------------------------------------------------------------
(function scrollEngine() {
  const root = document.documentElement;
  const hud = document.getElementById("hud");
  const hudTc = document.getElementById("hud-tc");
  const hudSec = document.getElementById("hud-sec");
  const hudMark = document.getElementById("hud-mark");
  const hudPct = document.getElementById("hud-pct");
  const dotsBox = document.getElementById("hud-dots");
  const fields = [...document.querySelectorAll(".field[data-label]")];
  const hero = document.querySelector(".hero");
  const kin = [...document.querySelectorAll(".kin")];
  const parallax = [...document.querySelectorAll("[data-parallax]")];
  const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, "0");
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);

  if (dotsBox) dotsBox.innerHTML = fields.map(() => "<i></i>").join("");
  const dots = dotsBox ? [...dotsBox.children] : [];

  // reveals
  const revealed = [...document.querySelectorAll(".rv")];
  if (!("IntersectionObserver" in window) || reducedMotion) {
    revealed.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });
    revealed.forEach((el) => io.observe(el));
  }

  let lastLabel = "", ticking = false;
  function update() {
    ticking = false;
    const vh = window.innerHeight;
    const y = window.scrollY;
    const span = Math.max(1, root.scrollHeight - vh);
    const prog = clamp(y / span);

    if (hudMark) hudMark.style.left = (prog * 100).toFixed(2) + "%";
    if (hudPct) hudPct.textContent = pad(prog * 100, 3) + "%";
    if (hudTc) {
      const frames = Math.round(prog * 30 * 30);
      hudTc.textContent = `00:00:${pad(frames / 30)}:${pad(frames % 30)}`;
    }

    let active = 0;
    fields.forEach((fl, i) => { const r = fl.getBoundingClientRect(); if (r.top <= vh * .5 && r.bottom > vh * .5) active = i; });
    const label = fields[active]?.dataset.label || "";
    if (label !== lastLabel) { lastLabel = label; if (hudSec) hudSec.textContent = label; }
    dots.forEach((d, i) => d.classList.toggle("on", i === active));
    if (hudMark) hudMark.classList.toggle("hole", prog > .985);
    if (hud) hud.style.setProperty("--hud", fields[active]?.classList.contains("field--paper") ? "rgba(10, 10, 12, .72)" : "rgba(255, 255, 255, .86)");

    if (reducedMotion) return;

    if (hero) hero.style.setProperty("--hp", clamp(y / (vh * .9)).toFixed(3));
    kin.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--p", ease((vh * .96 - r.top) / (vh * .55)).toFixed(3));
    });
    parallax.forEach((el) => {
      const r = el.getBoundingClientRect();
      const k = clamp((r.top + r.height / 2) / (vh + r.height), 0, 1) - .5;     // -0.5 (above) .. 0.5 (below)
      el.style.transform = `translateY(${(k * parseFloat(el.dataset.parallax)).toFixed(1)}px)`;
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

// ---------------------------------------------------------------------------
// The pointer is the winding key: it turns as you move. Desktop only; touch and reduced-motion keep the system cursor.
// ---------------------------------------------------------------------------
(function keyCursor() {
  if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = document.createElement("div");
  el.className = "key-cursor";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<svg viewBox="0 0 56 56" width="56" height="56"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 48 26 30"/><g id="kc-head"><circle cx="19" cy="23" r="8"/><circle cx="33" cy="37" r="8"/></g></g></svg>`;
  document.body.appendChild(el);
  const head = el.querySelector("#kc-head");
  const bar = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar")) || 64;
  let px = -1, py = -1, target = 0, angle = 0, raf = 0, pressed = false;

  function spin() {
    angle += (target - angle) * .18;
    head.setAttribute("transform", `rotate(${angle.toFixed(1)} 26 30)`);
    raf = Math.abs(target - angle) > .2 ? requestAnimationFrame(spin) : 0;
  }
  window.addEventListener("pointermove", (e) => {
    if (px >= 0) target += Math.hypot(e.clientX - px, e.clientY - py) * 2.4;     // the key winds as the hand moves
    px = e.clientX; py = e.clientY;
    if (!el.classList.contains("on")) { el.classList.add("on"); document.documentElement.classList.add("keycur"); }
    el.style.transform = `translate(${px - 8}px, ${py - 48}px) scale(${pressed ? .86 : 1})`;
    const t = e.target.closest ? e.target : document.body;
    const light = py < bar() || !t.closest(".field--paper") || Boolean(t.closest(".block, .btn--red"));
    el.classList.toggle("light", light && !t.closest(".btn--paper, .pill, .demo__toast"));
    if (!raf) raf = requestAnimationFrame(spin);
  }, { passive: true });
  window.addEventListener("pointerdown", () => { pressed = true; target += 90; el.style.transform = el.style.transform.replace(/scale([^)]*)/, "scale(.86)"); if (!raf) raf = requestAnimationFrame(spin); });
  window.addEventListener("pointerup", () => { pressed = false; el.style.transform = el.style.transform.replace(/scale([^)]*)/, "scale(1)"); });
  document.addEventListener("pointerleave", () => el.classList.remove("on"));
})();
