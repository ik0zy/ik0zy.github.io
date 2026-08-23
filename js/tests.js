/* MSI//BENCHMARK — the three tests + evaluation report.
   Everything runs client-side. No network calls. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORE_KEY = 'msi-benchmark-v3';
  var ACTUAL_RANK = 40;
  var FIELD = 1564;

  /* ————— state ————— */
  var state = { vision: false, rank: false, csv: false };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    if (saved && typeof saved === 'object') {
      ['vision', 'rank', 'csv'].forEach(function (k) { state[k] = !!saved[k]; });
    }
  } catch (e) { /* private mode etc. — start fresh */ }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function chipEl(k) { return document.getElementById('chip-' + k); }

  function setChip(k, status, label) {
    var c = chipEl(k);
    if (!c) return;
    c.setAttribute('data-status', status);
    c.textContent = label;
  }

  function renderReport() {
    var n = 0;
    ['vision', 'rank', 'csv'].forEach(function (k) {
      var el = document.getElementById('stat-' + k);
      if (!el) return;
      if (state[k]) { n++; el.textContent = 'PASS'; el.classList.add('pass'); }
      else { el.textContent = 'NOT RUN'; el.classList.remove('pass'); }
    });
    var chip = document.getElementById('scoreChip');
    if (chip) chip.textContent = n + '/3';
    var report = document.getElementById('report');
    if (report) report.classList.toggle('complete', n === 3);
  }

  function markPass(k) {
    if (state[k]) return;
    state[k] = true;
    saveState();
    setChip(k, 'pass', 'PASS');
    renderReport();
  }

  function initChips() {
    ['vision', 'rank', 'csv'].forEach(function (k) {
      if (state[k]) setChip(k, 'pass', 'PASS');
    });
    renderReport();
  }

  function setRunning(k) { if (!state[k]) setChip(k, 'running', 'RUNNING'); }

  /* ————— TEST 01 · VISION — Error Level Analysis ————— */
  (function visionTest() {
    var dz = document.getElementById('dropzone');
    var input = document.getElementById('fileInput');
    var msg = document.getElementById('visionMsg');
    var results = document.getElementById('elaResults');
    var cA = document.getElementById('canvasOrig');
    var cB = document.getElementById('canvasEla');
    if (!dz || !input) return;

    function say(text, kind) {
      msg.textContent = text;
      msg.className = 'testmsg mono' + (kind ? ' ' + kind : '');
    }

    function loadImage(src) {
      return new Promise(function (res, rej) {
        var im = new Image();
        im.onload = function () { res(im); };
        im.onerror = function () { rej(new Error('decode failed')); };
        im.src = src;
      });
    }

    /* jet-style colormap: dark blue (clean) → cyan → green → yellow → red (suspicious) */
    var LUT = (function () {
      var stops = [
        [8, 16, 70], [0, 110, 235], [40, 215, 130], [255, 205, 50], [235, 30, 20]
      ];
      var lut = new Uint8Array(256 * 3);
      for (var i = 0; i < 256; i++) {
        var t = i / 255 * (stops.length - 1);
        var s = Math.min(stops.length - 2, Math.floor(t));
        var f = t - s;
        lut[i * 3]     = stops[s][0] + (stops[s + 1][0] - stops[s][0]) * f;
        lut[i * 3 + 1] = stops[s][1] + (stops[s + 1][1] - stops[s][1]) * f;
        lut[i * 3 + 2] = stops[s][2] + (stops[s + 1][2] - stops[s][2]) * f;
      }
      return lut;
    })();

    function handle(file) {
      if (!file) return;
      if (!file.type || file.type.indexOf('image/') !== 0) {
        say('That is not an image. Images only — a JPEG works best.', 'err');
        return;
      }
      setRunning('vision');
      say('Processing locally — nothing leaves your machine…');

      var url = URL.createObjectURL(file);
      loadImage(url).then(function (img) {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.max(1, Math.round(img.naturalWidth * scale));
        var h = Math.max(1, Math.round(img.naturalHeight * scale));

        cA.width = w; cA.height = h;
        cB.width = w; cB.height = h;
        var ca = cA.getContext('2d', { willReadFrequently: true });
        var cb = cB.getContext('2d', { willReadFrequently: true });
        ca.drawImage(img, 0, 0, w, h);

        /* re-encode at fixed quality — the "crime" ELA detects */
        var jpeg = cA.toDataURL('image/jpeg', 0.85);
        return loadImage(jpeg).then(function (rec) {
          cb.drawImage(rec, 0, 0, w, h);
          var A = ca.getImageData(0, 0, w, h).data;
          var B = cb.getImageData(0, 0, w, h).data;
          var out = cb.createImageData(w, h);
          var o = out.data;
          var diff = new Uint8Array(w * h);
          var mx = 0, i, p, v;

          for (i = 0, p = 0; i < diff.length; i++, p += 4) {
            v = (Math.abs(A[p] - B[p]) + Math.abs(A[p + 1] - B[p + 1]) + Math.abs(A[p + 2] - B[p + 2])) / 3;
            if (v > 255) v = 255;
            diff[i] = v;
            if (v > mx) mx = v;
          }

          if (mx < 5) {
            say('Almost no error variance — this image is probably lossless (PNG) or re-saved many times. ELA reads JPEG-compressed images best. Try a photo from the web.', 'err');
          } else {
            var white = Math.max(14, mx * 0.72);
            for (i = 0, p = 0; i < diff.length; i++, p += 4) {
              v = diff[i] / white; if (v > 1) v = 1;
              var li = (v * 255) | 0;
              o[p] = LUT[li * 3]; o[p + 1] = LUT[li * 3 + 1]; o[p + 2] = LUT[li * 3 + 2]; o[p + 3] = 255;
            }
            say('Done — ' + w + '×' + h + 'px. Flat colours survived re-compression; bright red/yellow zones were edited, spliced or re-saved at a different quality.', 'ok');
          }
          cb.putImageData(out, 0, 0);
          results.hidden = false;
          markPass('vision');
        });
      }).catch(function () {
        say('Could not read that file. Try a standard JPEG or PNG.', 'err');
        if (!state.vision) setChip('vision', 'ready', 'READY');
      });
    }

    dz.addEventListener('click', function () { input.click(); });
    dz.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', function () { handle(input.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over', 'drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over', 'drag'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);
    });
  })();

  /* ————— TEST 02 · PREDICTION — guess the rank ————— */
  (function rankTest() {
    var slider = document.getElementById('rankSlider');
    var out = document.getElementById('rankOut');
    var lock = document.getElementById('lockBtn');
    var reveal = document.getElementById('rankReveal');
    var numEl = document.getElementById('actualNum');
    var bar = document.querySelector('#test-rank .pctbar');
    var verdict = document.getElementById('rankVerdict');
    if (!slider || !lock) return;

    slider.addEventListener('input', function () {
      out.textContent = parseInt(slider.value, 10).toLocaleString('en-US');
    });

    lock.addEventListener('click', function () {
      if (lock.disabled) return;
      lock.disabled = true;
      slider.disabled = true;
      setRunning('rank');

      var guess = parseInt(slider.value, 10);
      reveal.hidden = false;

      function finish() {
        numEl.textContent = String(ACTUAL_RANK);
        bar.classList.add('done');
        var ratio = Math.abs(guess - ACTUAL_RANK) / FIELD;
        if (ratio <= 0.05)      verdict.textContent = '▸ SHARP EYE — you called it. Most people guess bottom-half.';
        else if (ratio <= 0.25) verdict.textContent = '▸ CLOSE — but the top 3% is a different tier. Literally: Expert tier, awarded that day.';
        else                    verdict.textContent = '▸ OFF THE MARK — which is exactly why "top 3% of 1,564" is worth a line on a CV.';
        markPass('rank');
      }

      if (reduced) { finish(); return; }

      /* roll the number from the guess down/up to the actual */
      var start = null, DUR = 1300, from = guess;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / DUR, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        numEl.textContent = Math.round(from + (ACTUAL_RANK - from) * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(frame); else finish();
      }
      requestAnimationFrame(frame);
    });

    /* restore a previously passed state cleanly */
    if (state.rank) {
      slider.value = String(ACTUAL_RANK);
      out.textContent = String(ACTUAL_RANK);
      reveal.hidden = false;
      numEl.textContent = String(ACTUAL_RANK);
      bar.classList.add('done');
      verdict.textContent = '▸ Already evaluated in this browser — score stands.';
      lock.disabled = true; slider.disabled = true;
    }
  })();

  /* ————— TEST 03 · AUTOMATION — calendar CSV ————— */
  (function csvTest() {
    var btn = document.getElementById('csvBtn');
    var out = document.getElementById('csvOut');
    if (!btn || !out) return;

    var CSV =
      'Subject,Start Date,All Day\n' +
      'Autumn T241 — Classes Begin,09/08/2024,TRUE\n' +
      'Last Date of Course Registration,09/19/2024,TRUE\n' +
      'Mid-term Examinations,10/20/2024,TRUE\n' +
      'Last Date of Withdrawal,11/14/2024,TRUE\n' +
      'Final Examinations,12/08/2024,TRUE\n' +
      'Grade Submission Deadline,12/22/2024,TRUE';

    var done = false;

    btn.addEventListener('click', function () {
      if (done) return;
      done = true;
      btn.disabled = true;
      btn.textContent = 'GENERATING…';
      setRunning('csv');
      out.hidden = false;

      function finish() {
        out.textContent = CSV;
        btn.textContent = 'GENERATED ✓';
        markPass('csv');
      }

      if (reduced) { finish(); return; }

      var i = 0;
      out.textContent = '';
      var caret = document.createElement('span');
      caret.className = 'caret';
      out.appendChild(caret);
      var timer = setInterval(function () {
        i += 3; /* 3 chars per tick ≈ fast, satisfying */
        if (i >= CSV.length) {
          clearInterval(timer);
          finish();
          return;
        }
        out.textContent = CSV.slice(0, i);
        out.appendChild(caret);
      }, 12);
    });

    if (state.csv) { done = true; btn.disabled = true; btn.textContent = 'GENERATED ✓'; out.hidden = false; out.textContent = CSV; }
  })();

  /* ————— Report: copy result ————— */
  (function copyResult() {
    var btn = document.getElementById('copyBtn');
    var msg = document.getElementById('copiedMsg');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var n = ['vision', 'rank', 'csv'].filter(function (k) { return state[k]; }).length;
      var line = 'I scored ' + n + '/3 on Mohammad Saidul Islam\'s portfolio benchmark — think you can beat me? https://ik0zy.github.io';
      function ok() {
        msg.hidden = false;
        setTimeout(function () { msg.hidden = true; }, 2200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(line).then(ok, function () { fallback(line, ok); });
      } else {
        fallback(line, ok);
      }
      function fallback(text, cb) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); cb(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  })();

  initChips();
})();
