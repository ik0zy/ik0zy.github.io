/* Portfolio v5 — career map, markers, detail card, tmux bar, ASCII name, reveals */
(function () {
  "use strict";

  /* ── year ── */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── ?static — render fully revealed (debug/QA) ── */
  if (location.search.indexOf("static") !== -1) document.documentElement.classList.add("static");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── bottom tmux bar: scroll meter, live section, clock ── */
  var sbMeter = document.getElementById("sbMeter");
  var sbPct = document.getElementById("sbPct");
  var sbSect = document.getElementById("sbSect");
  var sbClock = document.getElementById("sbClock");
  var METER = 8;

  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? Math.min(1, (h.scrollTop || document.body.scrollTop) / max) : 0;
    var on = Math.round(p * METER);
    if (sbMeter) sbMeter.textContent = "\u2593".repeat(on) + "\u2591".repeat(METER - on);
    if (sbPct) sbPct.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
  }
  window.addEventListener("scroll", function () {
    if (updateProgress.t) return;
    updateProgress.t = true;
    requestAnimationFrame(function () { updateProgress(); updateProgress.t = false; });
  }, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  (function trackSection() {
    var zones = document.querySelectorAll("[data-section]");
    if (!("IntersectionObserver" in window) || !zones.length || !sbSect) return;
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) sbSect.textContent = "\u25B8 " + e.target.getAttribute("data-section");
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    zones.forEach(function (z) { sio.observe(z); });
  })();

  (function clock() {
    if (!sbClock) return;
    function tick() {
      var d = new Date();
      sbClock.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
    tick();
    setInterval(tick, 20000);
  })();

  /* ── sbar buttons: host = back to top · section = cycle next ── */
  (function sbarButtons() {
    var home = document.getElementById("sbHome");
    var zones = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
    if (home) home.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    if (!sbSect || !zones.length) return;
    sbSect.addEventListener("click", function () {
      var current = (sbSect.textContent || "").replace("\u25B8 ", "").trim();
      var idx = -1;
      for (var i = 0; i < zones.length; i++) {
        if (zones[i].getAttribute("data-section") === current) { idx = i; break; }
      }
      var next = zones[(idx + 1) % zones.length];
      next.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  })();

  /* ── typed prompt ── */
  (function typedPrompt() {
    var t = document.getElementById("plTyped");
    if (!t) return;
    var s = "./portfolio";
    if (reduced) { t.textContent = s; return; }
    var i = 0;
    (function step() { t.textContent = s.slice(0, ++i); if (i <= s.length) setTimeout(step, 54); })();
  })();

  /* ── ASCII name: 3 art styles × 6 palettes, click the name to re-roll ── */
  var GLYPHS = {
    M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
    O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
    H: ["█   █", "█   █", "█████", "█   █", "█   █"],
    A: [" ███ ", "█   █", "█████", "█   █", "█   █"],
    D: ["████ ", "█   █", "█   █", "█   █", "████ "],
    S: [" ███ ", "█    ", " ███ ", "    █", "███  "],
    I: ["███", " █ ", " █ ", " █ ", "███"],
    U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
    L: ["█    ", "█    ", "█    ", "█    ", "█████"]
  };
  var ARTS = [
    { name: "SOLID",  ch: function () { return "█"; } },
    { name: "SHADE",  ch: function (r) { return ["█", "█", "▓", "▒", "▒"][r]; } },
    { name: "DITHER", ch: function (r, c) { return (r + c) % 2 ? "▓" : "█"; } }
  ];
  var PALETTES = [
    { name: "TERRA",  ac: "#B4552D", g: "linear-gradient(180deg,#D98B5F 0%,#B4552D 45%,#7E3A1E 100%)" },
    { name: "INDIGO", ac: "#4A5A9A", g: "linear-gradient(180deg,#8B9BD0 0%,#4A5A9A 45%,#2E3A66 100%)" },
    { name: "OLIVE",  ac: "#6E7C35", g: "linear-gradient(180deg,#A3B45C 0%,#6E7C35 45%,#454E1F 100%)" },
    { name: "PLUM",   ac: "#8A4A7A", g: "linear-gradient(180deg,#B57AA8 0%,#8A4A7A 45%,#5A2E4E 100%)" },
    { name: "TEAL",   ac: "#2E7A72", g: "linear-gradient(180deg,#5FA89E 0%,#2E7A72 45%,#1D4E48 100%)" },
    { name: "GOLD",   ac: "#A8862A", g: "linear-gradient(180deg,#D6B258 0%,#A8862A 45%,#6E571C 100%)" }
  ];

  (function asciiName() {
    var nb = document.getElementById("nameblock");
    if (!nb) return;
    var pres = [document.getElementById("art1"), document.getElementById("art2")];
    var WORDS = ["SAIDUL", "ISLAM"];

    function renderWord(word, art) {
      var rows = ["", "", "", "", ""];
      for (var r = 0; r < 5; r++) {
        var line = "";
        for (var i = 0; i < word.length; i++) {
          var row = GLYPHS[word[i]][r];
          for (var c = 0; c < row.length; c++) {
            line += row[c] === "█" ? art.ch(r, c) : " ";
          }
          line += " ";
        }
        rows[r] = line;
      }
      return rows.join("\n");
    }

    var cur = null, busy = false;
    function apply(art, pal) {
      cur = { art: art, pal: pal };
      document.documentElement.style.setProperty("--terra", pal.ac);
      /* favicon follows the rolled palette */
      (function syncFavicon() {
        var cv = document.createElement("canvas");
        cv.width = 64; cv.height = 64;
        var cx = cv.getContext("2d");
        cx.fillStyle = "#17160f";
        cx.fillRect(0, 0, 64, 64);
        cx.fillStyle = pal.ac;
        cx.fillRect(14, 34, 8, 16);
        cx.fillRect(28, 24, 8, 26);
        cx.fillRect(42, 14, 8, 36);
        var link = document.querySelector('link[rel="icon"]');
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = cv.toDataURL("image/png");
      })();
      var maxLen = 0;
      for (var i = 0; i < WORDS.length; i++) {
        var txt = renderWord(WORDS[i], art);
        pres[i].textContent = txt;
        pres[i].style.background = pal.g;
        pres[i].style.webkitBackgroundClip = "text";
        pres[i].style.backgroundClip = "text";
        var rows = txt.split("\n");
        for (var j = 0; j < rows.length; j++) if (rows[j].length > maxLen) maxLen = rows[j].length;
      }
      var fs = Math.max(9, Math.min(26, nb.clientWidth / (maxLen * 0.62)));
      pres.forEach(function (el) { el.style.fontSize = fs + "px"; });
    }

    function reroll() {
      if (busy) return;
      var na, np;
      do {
        na = ARTS[(Math.random() * ARTS.length) | 0];
        np = PALETTES[(Math.random() * PALETTES.length) | 0];
      } while (cur && na === cur.art && np === cur.pal);
      if (reduced) { apply(na, np); return; }
      busy = true;
      var n = 0;
      var iv = setInterval(function () {
        pres.forEach(function (el) {
          el.textContent = el.textContent.replace(/[^\n]/g, function (ch) {
            return ch === " " ? " " : "░▒▓█"[(Math.random() * 4) | 0];
          });
        });
        if (++n >= 4) { clearInterval(iv); apply(na, np); busy = false; }
      }, 46);
    }

    apply(ARTS[(Math.random() * ARTS.length) | 0], PALETTES[(Math.random() * PALETTES.length) | 0]);
    nb.addEventListener("click", reroll);
    window.addEventListener("resize", function () { if (cur) apply(cur.art, cur.pal); });
  })();

  /* ── scroll reveals ── */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ── section headers decode from terminal static ── */
  (function decodeHeaders() {
    var CHS = "░▒▓#*+=:\u00B7";
    var heads = document.querySelectorAll(".sec-t");
    if (!heads.length) return;
    heads.forEach(function (h) { h.dataset.fin = h.textContent; });
    if (!("IntersectionObserver" in window) || reduced) return;
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || e.target.dataset.done) return;
        dio.unobserve(e.target);
        e.target.dataset.done = "1";
        var fin = e.target.dataset.fin, f = 0, n = fin.length;
        var iv = setInterval(function () {
          f++;
          e.target.textContent = fin.split("").map(function (ch, i) {
            return i < f ? ch : (ch === " " ? " " : CHS[(Math.random() * CHS.length) | 0]);
          }).join("");
          if (f >= n) { e.target.textContent = fin; clearInterval(iv); }
        }, 26);
      });
    }, { threshold: 0.4 });
    heads.forEach(function (h) { dio.observe(h); });
  })();

  /* ── marker data (all facts from the résumé) ── */
  var MARKERS = [
    {
      n: 1, x: 905, y: 300,
      ref: "MARKER 01 · RANK 40 / 1,564 · TOP 3%",
      title: "Kaggle Competitions Expert",
      kind: "COMPETITION — RecodAI: LUC Scientific Image Forgery Detection",
      body: "40th of 1,564 teams worldwide — top 3% — using transfer learning, ensembling and test-time augmentation.",
      fact: "EXPERT TIER AWARDED WHEN THE LEADERBOARD FROZE."
    },
    {
      n: 2, x: 620, y: 415,
      ref: "MARKER 02 · IEEE XPLORE",
      title: "IEEE ICCIT 2025 Publication",
      kind: "PUBLICATION — BnSFD",
      body: "BnSFD: YOLOv12-Based Detection of Bangladeshi Street Foods for Cultural Heritage. Real-time detection, indexed on IEEE Xplore.",
      fact: "PEER-REVIEWED AND PUBLICLY ACCESSIBLE.",
      link: { href: "https://ieeexplore.ieee.org/document/11490261", text: "Read on IEEE Xplore ↗" }
    },
    {
      n: 3, x: 430, y: 250,
      ref: "MARKER 03 · TWO FIRST PLACES",
      title: "Breakthrough I & II — 1st Place × 2",
      kind: "AWARD — UIU Intra-Kaggle Series",
      body: "Customer Decode Challenge, then Good Food, Good Gut!. Two consecutive first places built on EDA, feature engineering and ensemble models.",
      fact: "39 TEAMS AHEAD OF NOBODY — 1,524 BEHIND, TWICE OVER."
    },
    {
      n: 4, x: 300, y: 560,
      ref: "MARKER 04 · OPEN SOURCE",
      title: "UIU-Calendar",
      kind: "PROJECT — Open-source application, 2024–present",
      body: "Scrapes the university's academic-calendar PDF into clean CSVs that import directly into Google Calendar. Built for every student on campus.",
      fact: "USED ACROSS CAMPUS EVERY TRIMESTER.",
      link: { href: "https://github.com/ik0zy/UIU-Calendar", text: "View project ↗" }
    },
    {
      n: 5, x: 760, y: 590,
      ref: "MARKER 05 · LEADERSHIP",
      title: "Co-Head of Competitions",
      kind: "LEADERSHIP — UIU Data Science Club, 2026–present",
      body: "Leads planning and execution of the club's Kaggle competitions, including the Breakthrough series.",
      fact: "PROBLEM SELECTION · EVALUATION · OPERATIONS."
    },
    {
      n: 6, x: 170, y: 380,
      ref: "MARKER 06 · EDUCATION",
      title: "BSc Data Science, UIU",
      kind: "EDUCATION — 09/2023 to present",
      body: "United International University, Dhaka.",
      fact: "PERFECT 5.00 GPAs AT BOTH PRIOR SCHOOLS (SSC & HSC)."
    }
  ];

  var SVGNS = "http://www.w3.org/2000/svg";

  /* ── graticule + grid refs ── */
  var grat = document.getElementById("graticule");
  if (grat) {
    var cols = 6, rows = 6;
    for (var c = 1; c < cols; c++) {
      var v = document.createElementNS(SVGNS, "line");
      v.setAttribute("x1", 1200 / cols * c); v.setAttribute("x2", 1200 / cols * c);
      v.setAttribute("y1", 0); v.setAttribute("y2", 760);
      v.setAttribute("stroke", "#22303e"); v.setAttribute("stroke-opacity", ".14");
      v.setAttribute("stroke-dasharray", "3 6");
      grat.appendChild(v);
    }
    for (var r = 1; r < rows; r++) {
      var h = document.createElementNS(SVGNS, "line");
      h.setAttribute("y1", 760 / rows * r); h.setAttribute("y2", 760 / rows * r);
      h.setAttribute("x1", 0); h.setAttribute("x2", 1200);
      h.setAttribute("stroke", "#22303e"); h.setAttribute("stroke-opacity", ".14");
      h.setAttribute("stroke-dasharray", "3 6");
      grat.appendChild(h);
    }
  }

  /* ── markers ── */
  var layer = document.getElementById("markers");
  var status = document.getElementById("plateStatus");
  var card = document.getElementById("detailCard");
  var dcRef = document.getElementById("dcRef");
  var dcTitle = document.getElementById("dcTitle");
  var dcKind = document.getElementById("dcKind");
  var dcBody = document.getElementById("dcBody");
  var activeBtn = null;

  function closeCard() {
    card.hidden = true;
    if (activeBtn) activeBtn.classList.remove("active");
    activeBtn = null;
    if (status) status.textContent = "SELECT A MARKER FOR DETAILS";
  }

  function openMarker(m, btn) {
    if (activeBtn === btn) { closeCard(); return; }
    if (activeBtn) activeBtn.classList.remove("active");
    activeBtn = btn;
    btn.classList.add("active");

    dcRef.textContent = m.ref;
    dcTitle.textContent = m.title;
    dcKind.textContent = m.kind;
    dcBody.innerHTML = "";
    var p = document.createElement("p");
    p.textContent = m.body;
    dcBody.appendChild(p);
    if (m.link) {
      var a = document.createElement("a");
      a.href = m.link.href; a.target = "_blank"; a.rel = "noopener";
      a.className = "mono"; a.style.cssText =
        "display:inline-block;margin-top:8px;font-size:11px;letter-spacing:.08em";
      a.textContent = m.link.text.toUpperCase();
      dcBody.appendChild(a);
    }
    var f = document.createElement("p");
    f.className = "dc-fact";
    f.textContent = "◆ " + m.fact;
    dcBody.appendChild(f);

    card.hidden = false;
    if (status) status.textContent = m.ref + " — " + m.title.toUpperCase();
  }

  if (layer) {
    MARKERS.forEach(function (m) {
      var g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "marker pulse");
      g.setAttribute("role", "button");
      g.setAttribute("tabindex", "0");
      g.setAttribute("aria-label", m.title);

      /* generous invisible tap target */
      var hit = document.createElementNS(SVGNS, "circle");
      hit.setAttribute("class", "mk-hit");
      hit.setAttribute("cx", m.x); hit.setAttribute("cy", m.y); hit.setAttribute("r", 30);
      hit.setAttribute("fill", "transparent");

      var ring = document.createElementNS(SVGNS, "circle");
      ring.setAttribute("class", "mk-pulse");
      ring.setAttribute("cx", m.x); ring.setAttribute("cy", m.y); ring.setAttribute("r", 14);

      var circ = document.createElementNS(SVGNS, "circle");
      circ.setAttribute("class", "mk-ring");
      circ.setAttribute("cx", m.x); circ.setAttribute("cy", m.y); circ.setAttribute("r", 16);

      var num = document.createElementNS(SVGNS, "text");
      num.setAttribute("class", "mk-num");
      num.setAttribute("x", m.x); num.setAttribute("y", m.y + 5);
      num.setAttribute("text-anchor", "middle");
      num.textContent = m.n;

      /* label with leader line */
      var leader = document.createElementNS(SVGNS, "line");
      leader.setAttribute("class", "mk-leader");
      var above = m.n === 3 || m.n === 6 || m.n === 2;
      var ly = above ? m.y - 26 : m.y + 34;
      leader.setAttribute("x1", m.x); leader.setAttribute("y1", above ? m.y - 17 : m.y + 17);
      leader.setAttribute("x2", m.x); leader.setAttribute("y2", ly - (above ? 12 : -4));

      var lab = document.createElementNS(SVGNS, "text");
      lab.setAttribute("class", "mk-lab");
      lab.setAttribute("x", m.x); lab.setAttribute("y", ly);
      lab.setAttribute("text-anchor", "middle");
      lab.textContent = m.title.split(/[—:(]/)[0].trim().toUpperCase();

      g.appendChild(hit); g.appendChild(ring); g.appendChild(circ); g.appendChild(num);
      g.appendChild(leader); g.appendChild(lab);

      g.addEventListener("click", function () { openMarker(m, g); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMarker(m, g); }
      });
      layer.appendChild(g);
    });
  }

  var closeBtn = card ? card.querySelector(".dc-close") : null;
  if (closeBtn) closeBtn.addEventListener("click", closeCard);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && card && !card.hidden) closeCard();
  });

  /* staggered marker drop-in when plate scrolls into view */
  var plate = document.getElementById("plate");
  if (plate && "IntersectionObserver" in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        pio.unobserve(plate);
        var gs = layer.querySelectorAll(".marker");
        gs.forEach(function (g, i) {
          setTimeout(function () { g.classList.add("in"); }, 180 * i);
        });
        /* desktop: open marker 01 so the map reads as interactive immediately */
        var first = layer.querySelector(".marker");
        if (first && window.innerWidth >= 640 && !activeBtn) {
          setTimeout(function () { openMarker(MARKERS[0], first); }, 180 * MARKERS.length + 250);
        }
      });
    }, { threshold: 0.25 });
    pio.observe(plate);
  }

  /* mobile: scale markers up so taps land and numbers read */
  function sizeMarkers() {
    if (!layer) return;
    var small = window.innerWidth < 640;
    layer.querySelectorAll(".marker").forEach(function (g) {
      g.style.transformBox = "fill-box";
      g.style.transformOrigin = "center";
      g.style.transform = small ? "scale(2.1)" : "";
    });
  }
  sizeMarkers();
  window.addEventListener("resize", sizeMarkers);

  /* legend bar — highlight section in view */
  var lgLinks = document.querySelectorAll(".legendbar a");
  var sections = [];
  lgLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var s = document.getElementById(id);
    if (s) sections.push({ link: a, sec: s });
  });
  if ("IntersectionObserver" in window && sections.length) {
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        lgLinks.forEach(function (a) { a.style.color = ""; });
        var hit = sections.find(function (s) { return s.sec === e.target; });
        if (hit) hit.link.style.color = "var(--terra)";
      });
    }, { rootMargin: "-30% 0px -55% 0px" });
    sections.forEach(function (s) { lio.observe(s.sec); });
  }
})();
