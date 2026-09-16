/* =========================================================
   HOSTIN IMÓVEIS — Intro cinematográfica
   Fase A (partículas): um campo de partículas douradas "desenha"
   a tagline em um palco preto, no estilo de reveals de tipografia
   em areia/partículas.
   Fase B (porta): a foto do imóvel se aproxima com zoom e depois
   se abre como uma porta dupla em 3D, revelando o interior.
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
    var veil = document.getElementById("cineVeil");
    var canvas = document.getElementById("cineParticleCanvas");

    var ZOOM_START = 200;
    var ZOOM_END = 280;
    var DOOR_START = 0.24; // fraction of PHASE B (not of the whole intro)
    var DOOR_END = 0.82;

    var PARTICLE_PHASE_END = 0.34; // fraction of the WHOLE intro spent on the particle stage
    var VEIL_FADE_START = PARTICLE_PHASE_END - 0.05;
    var VEIL_FADE_END = PARTICLE_PHASE_END + 0.03;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      if (doorL) { doorL.style.backgroundSize = ZOOM_END + "% 100%"; doorL.style.transform = "rotateY(-98deg)"; doorL.style.setProperty("--frame-opacity", "1"); }
      if (doorR) { doorR.style.backgroundSize = ZOOM_END + "% 100%"; doorR.style.transform = "rotateY(98deg)"; doorR.style.setProperty("--frame-opacity", "1"); }
      if (bgInt) bgInt.style.opacity = "1";
      if (glow) glow.style.opacity = "0";
      if (text) { text.style.opacity = "1"; text.style.transform = "translateY(0)"; }
      if (cue) cue.style.opacity = "0";
      if (veil) veil.style.opacity = "0";
      return;
    }

    function smoothstep(t) {
      t = Math.min(Math.max(t, 0), 1);
      return t * t * (3 - 2 * t);
    }

    /* ---------------- Particle typography ---------------- */
    var ctx = canvas ? canvas.getContext("2d") : null;
    var particles = [];
    var canvasW = 0, canvasH = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var isSmall = window.innerWidth < 760;
    var step = isSmall ? 7 : 4;

    function sampleText(lines, boardW, boardH) {
      var off = document.createElement("canvas");
      off.width = boardW;
      off.height = boardH;
      var octx = off.getContext("2d");
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      lines.forEach(function (line) {
        octx.font = line.weight + " " + line.size + "px " + line.font;
        octx.fillText(line.text, boardW / 2, line.y);
      });
      var data = octx.getImageData(0, 0, boardW, boardH).data;
      var pts = [];
      for (var y = 0; y < boardH; y += step) {
        for (var x = 0; x < boardW; x += step) {
          var alpha = data[(y * boardW + x) * 4 + 3];
          if (alpha > 120) pts.push({ x: x, y: y });
        }
      }
      return pts;
    }

    function buildParticles() {
      if (!canvas || !ctx) return;
      var rect = canvas.getBoundingClientRect();
      canvasW = rect.width;
      canvasH = rect.height;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var boardW = Math.min(canvasW, 1000);
      var boardH = 260;
      var kickerSize = isSmall ? 20 : 26;
      var titleSize = isSmall ? 46 : Math.min(88, boardW * 0.09);

      var pts = sampleText(
        [
          { text: "H O S T I N   I M Ó V E I S", size: kickerSize, weight: "600", font: "Outfit, sans-serif", y: boardH * 0.28 },
          { text: "O imóvel que você procura", size: titleSize, weight: "700", font: "'Playfair Display', serif", y: boardH * 0.56 },
          { text: "está aqui.", size: titleSize, weight: "700", font: "'Playfair Display', serif", y: boardH * 0.84 }
        ],
        boardW,
        boardH
      );

      var scale = Math.min((canvasW * 0.9) / boardW, (canvasH * 0.55) / boardH);
      var offsetX = (canvasW - boardW * scale) / 2;
      var offsetY = (canvasH - boardH * scale) / 2;

      particles = pts.map(function (p) {
        var angle = Math.random() * Math.PI * 2;
        var dist = 220 + Math.random() * 420;
        var tx = offsetX + p.x * scale;
        var ty = offsetY + p.y * scale;
        return {
          tx: tx,
          ty: ty,
          sx: tx + Math.cos(angle) * dist,
          sy: ty + Math.sin(angle) * dist - 60,
          ex: tx + Math.cos(angle + 1.4) * dist * 1.3,
          ey: ty + Math.sin(angle + 1.4) * dist * 1.3 - 140,
          size: 1 + Math.random() * 1.6
        };
      });
    }

    var resizeTimer;
    function onResize() {
      isSmall = window.innerWidth < 760;
      step = isSmall ? 7 : 4;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildParticles();
        update();
      }, 200);
    }

    function drawParticles(localProgress) {
      if (!ctx || !particles.length) return;
      ctx.clearRect(0, 0, canvasW, canvasH);

      var assemble = smoothstep(localProgress / 0.42);
      var disperse = localProgress > 0.72 ? smoothstep((localProgress - 0.72) / 0.28) : 0;
      var alpha = Math.max(0, Math.min(assemble, 1 - disperse));
      if (alpha <= 0.01) return;

      ctx.fillStyle = "rgba(240, 217, 168, 1)";
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var x = p.sx + (p.tx - p.sx) * assemble + (p.ex - p.tx) * disperse;
        var y = p.sy + (p.ty - p.sy) * assemble + (p.ey - p.ty) * disperse;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x, y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(buildParticles).catch(buildParticles);
    }
    buildParticles();
    window.addEventListener("resize", onResize);

    /* ---------------- Scroll-driven update ---------------- */
    var ticking = false;

    function update() {
      ticking = false;
      var rect = intro.getBoundingClientRect();
      var total = intro.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      var scrolled = -rect.top;
      var progress = Math.min(Math.max(scrolled / total, 0), 1);

      /* Phase A — particle typography on a black stage */
      var particleLocal = Math.min(progress / PARTICLE_PHASE_END, 1);
      drawParticles(particleLocal);

      if (veil) {
        var veilOpacity = 1;
        if (progress > VEIL_FADE_START) {
          veilOpacity = 1 - smoothstep((progress - VEIL_FADE_START) / (VEIL_FADE_END - VEIL_FADE_START));
        }
        veil.style.opacity = String(veilOpacity);
      }
      if (canvas) canvas.style.opacity = progress > VEIL_FADE_END ? "0" : "1";

      if (cue) {
        cue.style.opacity = String(progress < 0.04 ? 1 : Math.max(0, 1 - (progress - 0.04) / 0.06));
      }

      /* Phase B — photo zoom + door opening, remapped over the remaining scroll */
      var progressB = Math.min(Math.max((progress - PARTICLE_PHASE_END) / (1 - PARTICLE_PHASE_END), 0), 1);

      var zoomPct = ZOOM_START + progressB * (ZOOM_END - ZOOM_START);
      var sizeStr = zoomPct + "% 100%";

      var doorP = Math.min(Math.max((progressB - DOOR_START) / (DOOR_END - DOOR_START), 0), 1);
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
        var fadeOut = progressB > 0.9 ? Math.max(0, 1 - (progressB - 0.9) / 0.1) : 1;
        glow.style.opacity = String(Math.min(eased * 1.4, 1) * fadeOut);
      }

      if (text) {
        var textOpacity = progressB > 0.02 && progressB < 0.2
          ? Math.min(1, (progressB - 0.02) / 0.08)
          : progressB >= 0.2
          ? Math.max(0, 1 - (progressB - 0.2) / 0.12)
          : 0;
        text.style.opacity = String(textOpacity);
        text.style.transform = "translateY(" + (-progressB * 60) + "px)";
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
