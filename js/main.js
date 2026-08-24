/* Portfolio v5 — career map, markers, detail card, status bar, reveals */
(function () {
  "use strict";

  /* ── year ── */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── ?static — render fully revealed (debug/QA) ── */
  if (location.search.indexOf("static") !== -1) document.documentElement.classList.add("static");

  /* ── status bar: scroll progress + live section ── */
  var sbBlocks = document.getElementById("sbBlocks");
  var sbPct = document.getElementById("sbPct");
  var sbSection = document.getElementById("sbSection");
  var BLOCKS = 14;

  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? Math.min(1, (h.scrollTop || document.body.scrollTop) / max) : 0;
    var filled = Math.round(p * BLOCKS);
    if (sbBlocks) {
      var s = "";
      for (var i = 0; i < BLOCKS; i++) s += i < filled ? "█" : "░";
      sbBlocks.textContent = s;
    }
    if (sbPct) sbPct.textContent = Math.round(p * 100) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  (function trackSection() {
    var zones = document.querySelectorAll("[data-section]");
    if (!("IntersectionObserver" in window) || !zones.length || !sbSection) return;
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) sbSection.textContent = e.target.getAttribute("data-section");
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    zones.forEach(function (z) { sio.observe(z); });
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

      g.appendChild(ring); g.appendChild(circ); g.appendChild(num);
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
      });
    }, { threshold: 0.25 });
    pio.observe(plate);
  }

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
