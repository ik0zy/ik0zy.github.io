(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveals — sections drift in once, then unobserve.
     The timeline panel shares this mechanism: .in also triggers
     the axis draw-in and event stagger (see CSS). */
  var revealed = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealed.forEach(function (el, i) {
      el.style.setProperty('--d', (i % 4) * 70 + 'ms');
      io.observe(el);
    });
  } else {
    revealed.forEach(function (el) { el.classList.add('in'); });
  }

  /* Count-up for the hero stats — runs once, when the strip is visible */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = parseInt(el.getAttribute('data-duration'), 10) || 1100;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4); /* easeOutQuart */
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll('[data-count]');
  function finishAll() {
    counters.forEach(function (el) {
      el.textContent = parseInt(el.getAttribute('data-count'), 10).toLocaleString('en-US');
    });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    finishAll();
  } else {
    var stats = document.getElementById('stats');
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          counters.forEach(countUp);
          cio.disconnect();
        }
      });
    }, { threshold: 0.3 });
    if (stats) cio.observe(stats); else finishAll();
  }

  /* Station clock — Asia/Dhaka, 24h */
  var clock = document.getElementById('clock');
  if (clock) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dhaka', hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (e) { fmt = null; }

    function tick() {
      var t = fmt ? fmt.format(new Date()) : '';
      if (t === '24:00:00') t = '00:00:00'; /* en-GB edge case at midnight */
      clock.textContent = t;
    }
    tick();
    setInterval(tick, 1000);
  }

  /* Footer year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
