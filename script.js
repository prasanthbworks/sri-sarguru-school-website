/* Sri Sarguru Matriculation School
   Progressive enhancement only. With JavaScript disabled every moment
   panel stays visible inline and every gallery remains a scrollable strip,
   so no content is ever lost. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  /* ---------------- Mobile menu ---------------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- Carousel ---------------- */
  function initCarousel(root) {
    if (root.dataset.carouselReady) return;
    root.dataset.carouselReady = '1';

    var track = root.querySelector('.car-track');
    var slides = track ? Array.prototype.slice.call(track.children) : [];
    var dotsWrap = root.querySelector('.car-dots');
    var prev = root.querySelector('.car-nav.prev');
    var next = root.querySelector('.car-nav.next');
    var index = 0;
    var timer = null;

    if (slides.length < 2) {
      root.classList.add('single');
      return;
    }

    /* dots */
    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'car-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + slides.length);
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { go(i, true); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    function paint() {
      dots.forEach(function (d, i) {
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    function go(i, userAction) {
      index = (i + slides.length) % slides.length;
      track.scrollTo({
        left: slides[index].offsetLeft - track.offsetLeft,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      paint();
      if (userAction) stop();
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1, true); });
    if (next) next.addEventListener('click', function () { go(index + 1, true); });

    /* keyboard */
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, true); }
    });

    /* keep dots honest when the user swipes */
    var settle;
    track.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var best = 0, bestD = Infinity;
        slides.forEach(function (s, i) {
          var d = Math.abs((s.offsetLeft - track.offsetLeft) + s.clientWidth / 2 - mid);
          if (d < bestD) { bestD = d; best = i; }
        });
        index = best;
        paint();
      }, 90);
    }, { passive: true });

    /* auto-advance */
    function start() {
      if (reduceMotion || timer) return;
      timer = setInterval(function () { go(index + 1); }, 4500);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    var mode = root.dataset.autoplay || 'auto';
    if (mode === 'hover' && !coarse) {
      /* desktop: advance while the visitor is looking at it */
      root.addEventListener('mouseenter', start);
      root.addEventListener('mouseleave', stop);
    } else {
      /* touch, and anything inside an overlay: advance gently on its own,
         but only while actually on screen */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
        }, { threshold: 0.4 }).observe(root);
      } else {
        start();
      }
      track.addEventListener('touchstart', stop, { passive: true });
      track.addEventListener('pointerdown', stop);
    }

    root._stopCarousel = stop;
    root._startCarousel = start;
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* ---------------- Moment overlay ---------------- */
  var overlay = document.getElementById('overlay');
  var overlayBody = document.getElementById('overlay-body');
  var lastFocus = null;

  function closeOverlay() {
    if (!overlay || overlay.hidden) return;
    overlay.querySelectorAll('[data-carousel]').forEach(function (c) {
      if (c._stopCarousel) c._stopCarousel();
    });
    overlay.hidden = true;
    overlayBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function openOverlay(name, trigger) {
    var source = document.getElementById('moment-' + name);
    if (!overlay || !source) return;
    lastFocus = trigger || null;

    var clone = source.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.remove('moment-panel');
    var heading = clone.querySelector('h3');
    if (heading) heading.id = 'overlay-title';

    overlayBody.innerHTML = '';
    overlayBody.appendChild(clone);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    overlayBody.querySelectorAll('[data-carousel]').forEach(function (c) {
      c.removeAttribute('data-carousel-ready');
      var dots = c.querySelector('.car-dots');
      if (dots) dots.innerHTML = '';
      initCarousel(c);
    });

    var closeBtn = overlay.querySelector('.overlay-close');
    if (closeBtn) closeBtn.focus();
  }

  document.querySelectorAll('.tile[data-moment]').forEach(function (tile) {
    tile.addEventListener('click', function () {
      openOverlay(tile.dataset.moment, tile);
    });
  });

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeOverlay();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
      /* keep tab focus inside the dialog */
      if (e.key === 'Tab' && !overlay.hidden) {
        var f = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();
