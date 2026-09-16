/* =========================================================
   HOSTIN IMÓVEIS — Intro cinematográfica
   A foto do imóvel se aproxima (zoom) e depois se abre como uma
   porta dupla em 3D conforme o usuário rola a página.
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var intro = document.getElementById("cinematicIntro");
    if (!intro) return;

    var doorL = document.getElementById("doorLeft");
    var doorR = document.getElementById("doorRight");
    var bgInt = document.getElementById("cineInterior");
    var glow = document.getElementById("cineGlow");
    var text = document.getElementById("cineText");
    var cue = document.getElementById("cineScrollCue");

    var ZOOM_START = 200; // % background-size at rest
    var ZOOM_END = 280; // % background-size fully zoomed
    var DOOR_START = 0.18; // progress where the doors start cracking open
    var DOOR_END = 0.74; // progress where the doors are fully open

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      if (doorL) { doorL.style.backgroundSize = ZOOM_END + "% 100%"; doorL.style.transform = "rotateY(-98deg)"; doorL.style.setProperty("--frame-opacity", "1"); }
      if (doorR) { doorR.style.backgroundSize = ZOOM_END + "% 100%"; doorR.style.transform = "rotateY(98deg)"; doorR.style.setProperty("--frame-opacity", "1"); }
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

      var zoomPct = ZOOM_START + progress * (ZOOM_END - ZOOM_START);
      var sizeStr = zoomPct + "% 100%";

      var doorP = Math.min(Math.max((progress - DOOR_START) / (DOOR_END - DOOR_START), 0), 1);
      var eased = smoothstep(doorP);
      var angle = eased * 98;

      if (doorL) {
        doorL.style.backgroundSize = sizeStr;
        doorL.style.transform = "rotateY(-" + angle + "deg)";
        doorL.style.setProperty("--frame-opacity", String(eased));
      }
      if (doorR) {
        doorR.style.backgroundSize = sizeStr;
        doorR.style.transform = "rotateY(" + angle + "deg)";
        doorR.style.setProperty("--frame-opacity", String(eased));
      }

      if (bgInt) {
        bgInt.style.opacity = String(eased);
        bgInt.style.transform = "scale(" + (1.1 - eased * 0.1) + ")";
      }
      if (glow) {
        var fadeOut = progress > 0.85 ? Math.max(0, 1 - (progress - 0.85) / 0.15) : 1;
        glow.style.opacity = String(Math.min(eased * 1.4, 1) * fadeOut);
      }

      if (text) {
        var textOpacity = progress > 0.16 ? Math.max(0, 1 - (progress - 0.16) / 0.12) : 1;
        text.style.opacity = String(textOpacity);
        text.style.transform = "translateY(" + (-progress * 60) + "px)";
      }

      if (cue) {
        cue.style.opacity = String(progress < 0.05 ? 1 : Math.max(0, 1 - (progress - 0.05) / 0.07));
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
