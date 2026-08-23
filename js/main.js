(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveals — content sections drift in once, then unobserve */
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

  /* Footer year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
