/* Sri Sarguru Matriculation School
   Progressive enhancement. Without JavaScript the page still reads in full:
   moment content stays in the DOM, galleries remain scrollable strips. */
(function () {
  'use strict';

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;

  /* ---------------- Nav ---------------- */
  var nav = document.getElementById('nav');
  var menu = document.getElementById('menu');
  var toggle = document.querySelector('.menu-toggle');

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

  if (nav) {
    addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', scrollY > 10);
    }, { passive: true });
  }

  /* ---------------- Scrollspy ----------------
     Highlights whichever section is currently in view. */
  var spyLinks = [].slice.call(document.querySelectorAll('.menu > a[data-spy]'));
  var targets = spyLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').split('#')[1];
    return id ? document.getElementById(id) : null;
  });

  function spy() {
    var best = -1, bestTop = -Infinity;
    var line = scrollY + 140;
    targets.forEach(function (el, i) {
      if (!el) return;
      var top = el.offsetTop;
      if (top <= line && top > bestTop) { bestTop = top; best = i; }
    });
    /* above the first section the hero is showing, so Home is current */
    if (scrollY < 120) best = 0;
    spyLinks.forEach(function (a, i) {
      a.classList.toggle('active', i === best);
    });
  }

  if (spyLinks.length && document.body.dataset.page === 'home') {
    var ticking = false;
    addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { spy(); ticking = false; });
      }
    }, { passive: true });
    spy();
  }

  /* ---------------- Reveal on scroll ---------------- */
  var rises = [].slice.call(document.querySelectorAll('.rise'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    /* Reveals: play on entry, and arm again once the element is clear of the
       viewport, so scrolling back through a section fades it in a second time.
       Two observers, because the reset needs a looser boundary than the reveal
       -- resetting at the same edge makes elements flicker at the fold. */
    var show = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add('in');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    var arm = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) en.target.classList.remove('in');
      });
    }, { threshold: 0, rootMargin: '160px 0px 160px 0px' });

    rises.forEach(function (el) { show.observe(el); arm.observe(el); });
  } else {
    rises.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Gallery ---------------- */
  function initGallery(root) {
    var track = root.querySelector('.track');
    var slides = [].slice.call(track.children);
    var dotsWrap = root.querySelector('.dots');
    var prev = root.querySelector('.gnav.p');
    var next = root.querySelector('.gnav.n');
    var index = 0, timer = null;

    if (slides.length < 2) { root.classList.add('single'); return; }

    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + slides.length);
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { go(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });

    function paint() {
      dots.forEach(function (d, i) { d.setAttribute('aria-selected', i === index ? 'true' : 'false'); });
    }
    function go(i, user) {
      index = (i + slides.length) % slides.length;
      track.scrollTo({
        left: slides[index].offsetLeft - track.offsetLeft,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      paint();
      if (user) stop();
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    if (prev) prev.addEventListener('click', function () { go(index - 1, true); });
    if (next) next.addEventListener('click', function () { go(index + 1, true); });

    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, true); }
    });

    var settle;
    track.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bestD = Infinity;
        slides.forEach(function (s, i) {
          var d = Math.abs((s.offsetLeft - track.offsetLeft) + s.clientWidth / 2 - mid);
          if (d < bestD) { bestD = d; best = i; }
        });
        index = best; paint();
      }, 90);
    }, { passive: true });

    if (!reduceMotion) timer = setInterval(function () { go(index + 1); }, 4800);
    track.addEventListener('pointerdown', stop);
    track.addEventListener('touchstart', stop, { passive: true });
    root._stop = stop;
  }

  /* ---------------- Moment overlay ---------------- */
  var overlay = document.getElementById('overlay');
  var body = document.getElementById('overlay-body');
  var lastFocus = null;

  function closeOverlay() {
    if (!overlay || overlay.hidden) return;
    overlay.querySelectorAll('.gal').forEach(function (g) { if (g._stop) g._stop(); });
    overlay.hidden = true;
    body.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function openOverlay(key, trigger) {
    var src = document.getElementById('moment-' + key);
    if (!overlay || !src) return;
    lastFocus = trigger || null;

    var title = src.dataset.title || '';
    var text = src.dataset.text || '';
    var imgs = (src.dataset.imgs || '').split(',').filter(Boolean);
    var alts = (src.dataset.alts || '').split('|');

    var html = '<h3 id="overlay-title">' + title + '</h3><p>' + text + '</p>' +
      '<div class="gal"><div class="track" aria-label="' + title + ' photos">' +
      imgs.map(function (s, i) {
        return '<img src="' + s + '" alt="' + (alts[i] || '') + '" loading="lazy">';
      }).join('') +
      '</div><button class="gnav p" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<button class="gnav n" type="button" aria-label="Next photo">&#8250;</button>' +
      '<div class="dots" role="tablist"></div></div>';

    body.innerHTML = html;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    initGallery(body.querySelector('.gal'));
    overlay.querySelector('.ov-close').focus();
  }

  document.querySelectorAll('.tile[data-moment]').forEach(function (t) {
    t.addEventListener('click', function () { openOverlay(t.dataset.moment, t); });
  });

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeOverlay();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
      if (e.key === 'Tab' && !overlay.hidden) {
        var f = overlay.querySelectorAll('button,[href],input,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------------- Videos ----------------
     Nothing loads from YouTube until a thumbnail is clicked, and opening one
     closes the other, so two soundtracks can never play at once. */
  var facades = [].slice.call(document.querySelectorAll('.vfacade'));

  function closeVideos(except) {
    facades.forEach(function (f) {
      if (f === except) return;
      var frame = f.parentNode.querySelector('iframe');
      if (frame) frame.parentNode.removeChild(frame);
      f.hidden = false;
    });
  }

  facades.forEach(function (f) {
    f.addEventListener('click', function () {
      closeVideos(f);
      var id = f.dataset.video;
      if (!id) return;
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id +
                  '?autoplay=1&rel=0&modestbranding=1';
      frame.title = f.dataset.label || 'Video';
      frame.setAttribute('allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      frame.setAttribute('allowfullscreen', '');
      f.parentNode.appendChild(frame);
      f.hidden = true;
    });
  });

  /* ---------------- Enquiry form ----------------
     Tally's own script fills the iframe in, but on a cold first load it can
     arrive too late. Fall back to setting the source directly. */
  function loadTally() {
    if (typeof Tally !== 'undefined' && Tally.loadEmbeds) { Tally.loadEmbeds(); }
    [].slice.call(document.querySelectorAll('iframe[data-tally-src]')).forEach(function (f) {
      if (!f.src) f.src = f.dataset.tallySrc;
    });
  }
  loadTally();
  addEventListener('load', loadTally);
  setTimeout(loadTally, 1200);
  setTimeout(loadTally, 3500);

  /* ---------------- Marquee: duplicate for a seamless loop ---------------- */
  var mt = document.querySelector('.marquee-track');
  if (mt && !reduceMotion) {
    mt.innerHTML += mt.innerHTML;
    mt.querySelectorAll('img').forEach(function (im, i) {
      if (i >= mt.children.length / 2) im.setAttribute('aria-hidden', 'true');
    });
  }
})();
