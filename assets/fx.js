/* Effekt-Ebene (FX) — erstehilfe-duderstadt.de. Vanilla-JS, keine externen Skripte.
   Läuft nur ohne prefers-reduced-motion. Ohne JS bleibt alles wie bisher. */
(function () {
  "use strict";
  var mm = window.matchMedia;
  if (!mm || mm("(prefers-reduced-motion: reduce)").matches) return;
  var fine = mm("(hover: hover) and (pointer: fine)").matches;
  var doc = document, root = doc.documentElement;
  root.classList.add("fx-on");
  function init() {
  var raf = window.requestAnimationFrame.bind(window);
  var hasIO = "IntersectionObserver" in window;
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }

  /* Lese-Fortschritt */
  var bar = doc.createElement("div");
  bar.className = "fx-progress";
  bar.setAttribute("aria-hidden", "true");
  doc.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      ticking = false;
    });
  }

  /* Einmal-Beobachter: setzt .fx-in, mit Sicherheitsnetz */
  function once(els, opts, fn) {
    if (!els.length) return;
    if (!hasIO) { els.forEach(function (e) { e.classList.add("fx-in"); if (fn) fn(e); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        io.unobserve(e.target);
        e.target.classList.add("fx-in");
        if (fn) fn(e.target);
      });
    }, opts);
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () {
      els.forEach(function (e) {
        if (!e.classList.contains("fx-in") && e.getBoundingClientRect().top < window.innerHeight) { e.classList.add("fx-in"); if (fn) fn(e); }
      });
    }, 3500);
  }

  /* Hero */
  var hero = doc.querySelector(".hero, .page-hero");
  if (hero) {
    hero.classList.add("fx-hero");
    var sun = doc.createElement("div");
    sun.className = "fx-sun";
    sun.setAttribute("aria-hidden", "true");
    var ns = "http://www.w3.org/2000/svg";
    var svg = doc.createElementNS(ns, "svg");
    svg.setAttribute("class", "fx-fachwerk");
    svg.setAttribute("viewBox", "0 0 400 260");
    var p = doc.createElementNS(ns, "path");
    p.setAttribute("d", "M10 250 V30 L200 10 L390 30 V250 Z M10 130 H390 M130 250 V130 M270 250 V130 M10 130 L130 30 M390 130 L270 30 M130 130 L200 10 M270 130 L200 10 M200 130 V10");
    svg.appendChild(p);
    sun.appendChild(svg);
    hero.insertBefore(sun, hero.firstChild);

    var h1 = hero.querySelector("h1");
    if (h1 && !h1.querySelector(".fx-word")) {
      h1.classList.add("fx-split");
      h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
      var n = 0;
      (function split(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = doc.createDocumentFragment();
            c.nodeValue.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(doc.createTextNode(" ")); return; }
              var s = doc.createElement("span");
              s.className = "fx-word";
              s.setAttribute("aria-hidden", "true");
              s.style.setProperty("--i", n++);
              s.textContent = w;
              frag.appendChild(s);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) split(c);
        });
      })(h1);
    }
    if (fine) {
      var spot = doc.createElement("div");
      spot.className = "fx-spot";
      spot.setAttribute("aria-hidden", "true");
      hero.insertBefore(spot, sun.nextSibling);
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        spot.style.setProperty("--sx", e.clientX - r.left + "px");
        spot.style.setProperty("--sy", e.clientY - r.top + "px");
        hero.classList.add("fx-hot");
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { hero.classList.remove("fx-hot"); });
    }
  }

  $$(".hero h1, .page-hero h1").forEach(function (h) { h.classList.add("fx-split"); });

  /* Termin-Zeilen: gestaffelter Einflug, auch bei später (live) ausgetauschten Zeilen */
  function fly(container) {
    $$(".termin-row:not(.fx-fly)", container).forEach(function (r, i) {
      r.style.setProperty("--fi", Math.min(i, 8));
      r.classList.add("fx-fly");
    });
  }
  $$("[data-termine]").forEach(function (t) {
    fly(t);
    if ("MutationObserver" in window) new MutationObserver(function () { fly(t); }).observe(t, { childList: true, subtree: true });
  });
  if (fine) {
    doc.addEventListener("pointermove", function (e) {
      var r = e.target.closest && e.target.closest("a.termin-row");
      if (!r) return;
      var b = r.getBoundingClientRect();
      r.style.setProperty("--gx", (e.clientX - b.left) + "px");
    }, { passive: true });
  }

  /* Überschriften */
  once($$(".section-head"), { threshold: 0.4 });

  /* Kennzahlen: nur feste Zahlen zählen (Live-Zähler bleibt unberührt) */
  var stats = $$(".stat b").filter(function (el) { return !el.hasAttribute("data-termine-count") && /^\d+( \D.*)?$/.test(el.textContent.trim()); });
  if (stats.length && hasIO) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        sio.unobserve(e.target);
        var el = e.target, fin = el.getAttribute("data-fx-final");
        var m = /^(\d+)(.*)$/.exec(fin), target = parseInt(m[1], 10), suffix = m[2], t0 = null, dur = 1200;
        function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 4);
          el.textContent = Math.round(target * ease) + suffix;
          if (k < 1) raf(step); else el.textContent = fin;
        }
        raf(step);
        setTimeout(function () { el.textContent = fin; }, dur + 400);
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) {
      var t = el.textContent.trim();
      el.setAttribute("data-fx-final", t);
      el.classList.add("fx-count");
      el.setAttribute("aria-label", t);
      sio.observe(el);
    });
  }

  /* Bilder: Wisch-Auftritt */
  var imgs = $$(".split img, .illu img, .illu-round img");
  imgs.forEach(function (i) { i.classList.add("fx-wipe-pre"); });
  /* Der Wisch schneidet das Bild selbst weg — beobachtet wird deshalb der Elternknoten */
  imgs.forEach(function (i) {
    var p = i.parentElement;
    once([p], { threshold: 0.2 }, function () { i.classList.add("fx-in"); });
  });

  /* Footer */
  var fg = doc.querySelector(".foot-grid");
  if (fg) { fg.classList.add("fx-foot-pre"); once([fg], { threshold: 0.15 }); }

  /* Karten: 3D-Neigung + Glut-Reflex; primäre Buttons magnetisch */
  if (fine) {
    $$(".card.hoverable, .kurs-card").forEach(function (card) {
      card.classList.add("fx-tilt");
      var glare = doc.createElement("span");
      glare.className = "fx-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);
      var pending = false, ev = null;
      card.addEventListener("pointermove", function (e) {
        ev = e;
        if (pending) return;
        pending = true;
        raf(function () {
          pending = false;
          var r = card.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
          card.style.setProperty("--ry", ((x - 0.5) * 8).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg");
          card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
          card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
          card.classList.add("fx-tilt-on");
        });
      }, { passive: true });
      card.addEventListener("pointerleave", function () { card.classList.remove("fx-tilt-on"); });
    });
    $$(".btn.primary").forEach(function (b) {
      b.classList.add("fx-mag");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + "px");
        b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + "px");
      }, { passive: true });
      b.addEventListener("pointerleave", function () {
        b.style.setProperty("--bx", "0px");
        b.style.setProperty("--by", "0px");
      });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
