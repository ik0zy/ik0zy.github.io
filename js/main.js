/* v6 TRAINING RUN — loss canvas, rank sim, detector, terminal, palette, sbar */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── boot ── */
  (function boot() {
    var b = document.getElementById("boot"), f = document.getElementById("bootFill");
    if (!b) return;
    if (reduced || sessionStorage.getItem("v6boot")) { b.classList.add("done"); setTimeout(function(){ b.remove(); }, 500); return; }
    var p = 0;
    var iv = setInterval(function () {
      p = Math.min(100, p + 8 + Math.random() * 14);
      if (f) f.style.width = p + "%";
      if (p >= 100) { clearInterval(iv); b.classList.add("done"); sessionStorage.setItem("v6boot", "1"); setTimeout(function(){ b.remove(); }, 550); }
    }, 90);
    setTimeout(function(){ if (document.body.contains(b)) { b.classList.add("done"); setTimeout(function(){ b.remove(); }, 550); } }, 2200);
  })();

  /* ── loss canvas ── */
  (function loss() {
    var cv = document.getElementById("lossCanvas");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var lossEl = document.getElementById("statLoss"), accEl = document.getElementById("statAcc"),
        rankEl = document.getElementById("statRank"), epEl = document.getElementById("statEpoch"),
        bigRank = document.getElementById("bigRank"), fill = document.getElementById("rankFill"),
        dot = document.getElementById("rankDot"), note = document.getElementById("rankNote"),
        stamp = document.getElementById("expertStamp"), log = document.getElementById("conLog");
    var logs = ["$ python train.py --backbone convnext --tta --ensemble", "epoch 12 · loss 0.41 · acc 88.3% · rank 612 ▲", "epoch 26 · loss 0.27 · acc 93.1% · rank 128 ▲▲", "epoch 40 · loss 0.21 · acc 94.7% · rank 40 ★ EXPERT", "checkpoint saved · best_model.pt"];
    function curve(t) { return 0.21 + 0.79 * Math.exp(-3.2 * t) + 0.05 * Math.exp(-9 * t) * Math.sin(t * 22); }
    function draw(prog) {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#ffffff14"; ctx.lineWidth = 1;
      for (var g = 1; g < 5; g++) { ctx.beginPath(); ctx.moveTo(0, H / 5 * g); ctx.lineTo(W, H / 5 * g); ctx.stroke(); }
      // glow area
      ctx.beginPath();
      var n = 90, pts = [];
      for (var i = 0; i <= n; i++) {
        var t = (i / n) * prog;
        var x = 24 + (W - 48) * (i / n);
        var v = curve(t);
        var y = 24 + ((1.05 - v) / 1.05) * (H - 70);
        pts.push([x, y]);
      }
      ctx.moveTo(pts[0][0], H - 8);
      pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); });
      ctx.lineTo(pts[pts.length - 1][0], H - 8); ctx.closePath();
      var gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, "#cdff3f2e"); gr.addColorStop(1, "#cdff3f00");
      ctx.fillStyle = gr; ctx.fill();
      // line
      ctx.beginPath();
      pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = "#cdff3f"; ctx.lineWidth = 2.6; ctx.lineJoin = "round"; ctx.stroke();
      // head
      var h = pts[pts.length - 1];
      ctx.beginPath(); ctx.arc(h[0], h[1], 5, 0, 7); ctx.fillStyle = "#cdff3f"; ctx.fill();
      ctx.beginPath(); ctx.arc(h[0], h[1], 10, 0, 7); ctx.strokeStyle = "#cdff3f66"; ctx.stroke();
      // baseline ghost
      ctx.setLineDash([5, 6]); ctx.strokeStyle = "#ff5d2a88"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(24, 24 + ((1.05 - 0.55) / 1.05) * (H - 70)); ctx.lineTo(W - 24, 24 + ((1.05 - 0.55) / 1.05) * (H - 70)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8d9ab0"; ctx.font = "11px 'IBM Plex Mono',monospace";
      ctx.fillText("BASELINE 0.55", W - 130, 24 + ((1.05 - 0.55) / 1.05) * (H - 70) - 8);
      ctx.fillText("LOSS", 10, 18);
    }
    function fmt(n) { return n.toLocaleString("en-US"); }
    function render(prog) {
      var v = curve(prog);
      var acc = 51.2 + (94.7 - 51.2) * Math.pow(prog, 0.65);
      var rank = Math.round(1564 - (1564 - 40) * Math.pow(prog, 1.6));
      var ep = Math.round(prog * 40);
      if (lossEl) lossEl.textContent = v.toFixed(3);
      if (accEl) accEl.textContent = acc.toFixed(1) + "%";
      if (rankEl) rankEl.textContent = fmt(rank);
      if (epEl) epEl.textContent = String(ep).padStart(2, "0") + "/40";
      if (bigRank) bigRank.textContent = fmt(rank);
      var pct = (1564 - rank) / (1564 - 40) * 100;
      if (fill) fill.style.width = Math.max(2, pct) + "%";
      if (dot) dot.style.left = Math.max(2, pct) + "%";
      if (note) note.textContent = prog >= 1 ? "★ top 3% — expert tier when the board froze." : prog > .6 ? "ensemble kicking in — climbing hundreds…" : prog > .25 ? "tta on — leaving the middle of the pack…" : "starting from the back of the pack…";
      if (log) log.textContent = logs[Math.min(logs.length - 1, Math.floor(prog * logs.length))];
      if (prog >= 0.985 && stamp) stamp.classList.add("show");
      draw(prog);
    }
    if (reduced) { render(1); return; }
    var start = null, DUR = 2600;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / DUR);
      var e = 1 - Math.pow(1 - p, 3);
      render(e);
      if (p < 1) requestAnimationFrame(frame);
    }
    var seen = false;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !seen) { seen = true; requestAnimationFrame(frame); io.disconnect(); } });
      }, { threshold: 0.2 });
      io.observe(cv);
    } else requestAnimationFrame(frame);
  })();

  /* ── leaderboard lab ── */
  (function lab() {
    var swT = document.getElementById("swTta"), swE = document.getElementById("swEns"), swL = document.getElementById("swTl");
    var labRank = document.getElementById("labRank"), lbPos = document.getElementById("lbPos"), lbScore = document.getElementById("lbScore");
    var bellFill = document.getElementById("bellFill"), bellCurve = document.getElementById("bellCurve"), bellDot = document.getElementById("bellDot");
    if (!labRank) return;
    // bell curve geometry (shared)
    function bellY(x) { var m = 300, s = 130; return 26 + 92 * Math.exp(-Math.pow(x - m, 2) / (2 * s * s)); }
    function xForRank(r) { var t = 1 - (r - 1) / 1563; return 8 + t * 584; } // rank1→right
    function buildCurve() {
      var d = "", f = "";
      for (var x = 0; x <= 600; x += 6) { var y = 128 - (bellY(x) - 26) * 0.95; d += (x ? " L" : "M") + x + "," + y.toFixed(1); }
      f = d + " L600,128 L0,128 Z";
      if (bellCurve) bellCurve.setAttribute("d", d);
      if (bellFill) bellFill.setAttribute("d", f);
    }
    buildCurve();
    function state() {
      var r = 1564, s = 0.7104;
      if (swT && swT.checked) { r -= 38; s += 0.021; }
      if (swE && swE.checked) { r -= 612; s += 0.118; }
      if (swL && swL.checked) { r -= 874; s += 0.126; }
      return { r: Math.max(40, r), s: Math.min(0.9754, s) };
    }
    function paint() {
      var st = state();
      labRank.textContent = "RANK " + st.r.toLocaleString("en-US") + " / 1,564";
      if (lbPos) lbPos.textContent = st.r;
      if (lbScore) lbScore.textContent = st.s.toFixed(4);
      if (bellDot) {
        var x = xForRank(st.r), y = 128 - (bellY(x) - 26) * 0.95;
        bellDot.setAttribute("cx", x); bellDot.setAttribute("cy", y);
      }
      var you = document.getElementById("lbYou");
      if (you) you.style.order = st.r < 3 ? "-1" : "";
    }
    [swT, swE, swL].forEach(function (s) { if (s) s.addEventListener("change", paint); });
    paint();
    // auto-demo once: turn all on sequentially so visitors see it move
    if (!reduced) {
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io2.disconnect();
          var seq = [swT, swE, swL], i = 0;
          var iv = setInterval(function () {
            if (i >= seq.length || !seq[i]) { clearInterval(iv); return; }
            seq[i].checked = true; paint(); i++;
          }, 700);
        });
      }, { threshold: 0.35 });
      var lab = document.getElementById("runs");
      if (lab) io2.observe(lab);
    }
  })();

  /* ── detector demo ── */
  (function det() {
    var b = document.getElementById("detBtn"), s = document.getElementById("detStage");
    if (!b || !s) return;
    b.addEventListener("click", function () {
      s.classList.remove("fired"); void s.offsetWidth; s.classList.add("fired");
      b.textContent = "↻ run again";
    });
    if ("IntersectionObserver" in window && !reduced) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { s.classList.add("fired"); io.disconnect(); } });
      }, { threshold: 0.4 });
      io.observe(s);
    } else s.classList.add("fired");
  })();

  /* ── terminal typing ── */
  (function term() {
    var el = document.getElementById("termBody");
    if (!el) return;
    var lines = [
      ["$ pip install uiu-calendar", "g"],
      ["Collecting uiu-calendar … done ✓", "d"],
      ["$ python scrape.py --trimester spring26", "g"],
      ["→ fetching academic-calendar.pdf …", "c"],
      ["→ parsing 14 pages · 62 events …", "c"],
      ["✓ wrote calendar.csv (62 rows, 0 conflicts)", "g"],
      ["→ import to Google Calendar: 1 click", "d"],
      ["$ # used across campus every trimester_", "d"]
    ];
    if (reduced) {
      el.innerHTML = lines.map(function (l) { return '<span class="' + l[1] + '">' + l[0].replace(/</g, "&lt;") + "</span>"; }).join("\n");
      return;
    }
    var li = 0, ci = 0, out = "";
    function tick() {
      if (li >= lines.length) return;
      var txt = lines[li][0], cls = lines[li][1];
      ci++;
      var cur = txt.slice(0, ci).replace(/</g, "&lt;");
      el.innerHTML = out + '<span class="' + cls + '">' + cur + "</span><span class=\"g\">▌</span>";
      if (ci >= txt.length) { out += '<span class="' + cls + '">' + txt.replace(/</g, "&lt;") + "</span>\n"; li++; ci = 0; setTimeout(tick, 320); }
      else setTimeout(tick, 16 + Math.random() * 26);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); tick(); } });
    }, { threshold: 0.3 });
    io.observe(el);
  })();

  /* ── reveals ── */
  (function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduced) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ── sbar: progress, section, clock, jump ── */
  (function sbar() {
    var meter = document.getElementById("sbMeter"), pct = document.getElementById("sbPct"),
        sect = document.getElementById("sbSect"), clock = document.getElementById("sbClock"),
        home = document.getElementById("sbHome");
    function prog() {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? Math.min(1, (h.scrollTop || document.body.scrollTop) / max) : 0;
      var on = Math.round(p * 8);
      if (meter) meter.textContent = "▓".repeat(on) + "░".repeat(8 - on);
      if (pct) pct.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
    }
    window.addEventListener("scroll", function () {
      if (prog.t) return; prog.t = true;
      requestAnimationFrame(function () { prog(); prog.t = false; });
    }, { passive: true });
    window.addEventListener("resize", prog); prog();
    var zones = document.querySelectorAll("[data-section]");
    if ("IntersectionObserver" in window && sect) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) sect.textContent = "▸ " + e.target.getAttribute("data-section"); });
      }, { rootMargin: "-35% 0px -55% 0px" });
      zones.forEach(function (z) { io.observe(z); });
      sect.addEventListener("click", function () {
        var cur = (sect.textContent || "").replace("▸ ", "").trim(), idx = -1, arr = Array.prototype.slice.call(zones);
        arr.forEach(function (z, i) { if (z.getAttribute("data-section") === cur) idx = i; });
        arr[(idx + 1) % arr.length].scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      });
    }
    if (home) home.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
    (function tick() {
      if (!clock) return;
      var d = new Date();
      clock.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      setTimeout(tick, 20000);
    })();
  })();

  /* ── copy link ── */
  (function copy() {
    var b = document.getElementById("copyLink");
    if (!b) return;
    b.addEventListener("click", function () {
      var url = location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { b.textContent = "✓ COPIED"; setTimeout(function(){ b.textContent = "⧉ COPY LINK"; }, 1600); });
    });
  })();

  /* ── command palette ── */
  (function pal() {
    var back = document.getElementById("palBack"), input = document.getElementById("palInput"), list = document.getElementById("palList"), btn = document.getElementById("paletteBtn");
    if (!back) return;
    var cmds = [
      { n: "go to runs — leaderboard lab", k: "runs ablation leaderboard", fn: function () { document.getElementById("runs").scrollIntoView(); } },
      { n: "go to paper — IEEE YOLOv12", k: "paper ieee yolov", fn: function () { document.getElementById("paper").scrollIntoView(); } },
      { n: "go to builds — UIU-Calendar", k: "builds calendar project", fn: function () { document.getElementById("builds").scrollIntoView(); } },
      { n: "go to stack", k: "stack skills", fn: function () { document.getElementById("stack").scrollIntoView(); } },
      { n: "hire me — email", k: "contact email hire", fn: function () { location.href = "mailto:root.saidul@gmail.com"; } },
      { n: "open kaggle profile", k: "kaggle expert", fn: function () { open("https://www.kaggle.com/mohammadsaidulislam", "_blank"); } },
      { n: "read IEEE paper", k: "ieee xplore", fn: function () { open("https://ieeexplore.ieee.org/document/11490261", "_blank"); } },
      { n: "post this on 𝕏", k: "share tweet expert", fn: function () { open(document.getElementById("botShare").href, "_blank"); } },
      { n: "unlock expert stamp", k: "expert easter", fn: function () { var s = document.getElementById("expertStamp"); if (s) s.classList.add("show"); window.scrollTo({ top: 0 }); } }
    ];
    var active = 0, filtered = cmds;
    function openPal() { back.hidden = false; input.value = ""; draw(""); setTimeout(function(){ input.focus(); }, 30); }
    function closePal() { back.hidden = true; }
    function draw(q) {
      q = q.toLowerCase();
      filtered = cmds.filter(function (c) { return (c.n + " " + c.k).toLowerCase().indexOf(q) !== -1; });
      active = 0;
      list.innerHTML = "";
      filtered.forEach(function (c, i) {
        var li = document.createElement("li");
        li.innerHTML = "<b>›</b> " + c.n.replace(/</g, "&lt;");
        if (i === 0) li.classList.add("active");
        li.addEventListener("click", function () { closePal(); c.fn(); });
        list.appendChild(li);
      });
      if (!filtered.length) list.innerHTML = "<li>no match — try ‘expert’</li>";
    }
    function move(d) {
      active = (active + d + filtered.length) % Math.max(1, filtered.length);
      Array.prototype.forEach.call(list.children, function (li, i) { li.classList.toggle("active", i === active); });
    }
    if (btn) btn.addEventListener("click", openPal);
    document.addEventListener("keydown", function (e) {
      if ((e.key === "k" || e.key === "K" || e.key === "/") && back.hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openPal(); }
      if (e.key === "Escape" && !back.hidden) closePal();
      if (!back.hidden && e.key === "ArrowDown") { e.preventDefault(); move(1); }
      if (!back.hidden && e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      if (!back.hidden && e.key === "Enter" && filtered[active]) { closePal(); filtered[active].fn(); }
    });
    input.addEventListener("input", function () { draw(input.value); });
    back.addEventListener("click", function (e) { if (e.target === back) closePal(); });
    // konami → expert rain
    var seq = [], KON = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";
    document.addEventListener("keydown", function (e) {
      seq.push(e.key); seq = seq.slice(-10);
      if (seq.join(",") === KON) {
        var s = document.getElementById("expertStamp"); if (s) s.classList.add("show");
        document.getElementById("top").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    });
  })();
})();
