/* =========================================================
   HOSTIN IMÓVEIS — Intro cinematográfica (porta 3D abrindo no scroll)
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var intro = document.getElementById("cinematicIntro");
    if (!intro) return;

    var doorL = document.getElementById("doorLeft");
    var doorR = document.getElementById("doorRight");
    var bgExt = document.getElementById("cineExterior");
    var bgInt = document.getElementById("cineInterior");
    var glow = document.getElementById("cineGlow");
    var text = document.getElementById("cineText");
    var cue = document.getElementById("cineScrollCue");

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      if (doorL) doorL.style.transform = "rotateY(-98deg)";
      if (doorR) doorR.style.transform = "rotateY(98deg)";
      if (bgInt) bgInt.style.opacity = "1";
      if (glow) glow.style.opacity = "0";
      if (text) { text.style.opacity = "1"; text.style.transform = "translateY(0)"; }
      if (cue) cue.style.opacity = "0";
      return;
    }

    function smoothstep(t) {
      return t * t * (3 - 2 * t);
    }

    var ticking = false;

    function update() {
      ticking = false;
      var rect = intro.getBoundingClientRect();
      var total = intro.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      var scrolled = -rect.top;
      var progress = Math.min(Math.max(scrolled / total, 0), 1);

      var doorP = Math.min(progress / 0.62, 1);
      var eased = smoothstep(doorP);
      var angle = eased * 98;

      if (doorL) doorL.style.transform = "rotateY(-" + angle + "deg)";
      if (doorR) doorR.style.transform = "rotateY(" + angle + "deg)";

      if (bgExt) bgExt.style.transform = "scale(" + (1 + progress * 0.14) + ")";
      if (bgInt) {
        bgInt.style.opacity = String(eased);
        bgInt.style.transform = "scale(" + (1.1 - eased * 0.1) + ")";
      }
      if (glow) {
        var fadeOut = progress > 0.75 ? Math.max(0, 1 - (progress - 0.75) / 0.25) : 1;
        glow.style.opacity = String(Math.min(eased * 1.4, 1) * fadeOut);
      }

      if (text) {
        var textOpacity = progress > 0.28 ? Math.max(0, 1 - (progress - 0.28) / 0.14) : 1;
        text.style.opacity = String(textOpacity);
        text.style.transform = "translateY(" + (-progress * 60) + "px)";
      }

      if (cue) {
        cue.style.opacity = String(progress < 0.06 ? 1 : Math.max(0, 1 - (progress - 0.06) / 0.08));
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  });
})();
