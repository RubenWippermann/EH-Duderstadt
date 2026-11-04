/* Sanftes Scrollen (Lenis 1.3.27, lokal gebündelt, MIT). Wird erst nach dem ersten Paint (load + Idle) nachgeladen: kein Einfluss auf LCP/INP.
   Nur Desktop mit Maus; nativ bei Touch, reduzierter Bewegung, Datensparmodus. Ohne JS bleibt alles nativ und vollständig lesbar. */
(function () {
  "use strict";
  var mm = window.matchMedia;
  if (!mm) return;
  if (mm("(prefers-reduced-motion: reduce)").matches) return;
  if (!mm("(hover: hover) and (pointer: fine)").matches) return;
  var cx = navigator.connection;
  if (cx && (cx.saveData || /(^|-)2g$/.test(cx.effectiveType || ""))) return;
  function start() {
    var s = document.createElement("script");
    s.src = "/assets/vendor/lenis-1.3.27.min.js";
    s.async = true;
    s.onload = function () {
      var lenis = new window.Lenis({ lerp: 0.12, anchors: true });
      (function frame(t) { lenis.raf(t); window.requestAnimationFrame(frame); })(0);
    };
    document.head.appendChild(s);
  }
  function idle() { (window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(start, { timeout: 3000 }); }
  if (document.readyState === "complete") idle(); else window.addEventListener("load", idle, { once: true });
})();
