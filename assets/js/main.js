/* =========================================================
   HOSTIN IMÓVEIS — Interações principais
   ========================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    initPreloader();
    initCursor();
    initHeader();
    initMobileNav();
    initScrollReveal();
    initCounters();
    initCardTilt();
    initAboutTilt();
    initPropertyFilters();
    initTestimonialSlider();
    initContactForm();
    initBackToTop();
    initSmoothAnchors();
    initParticlesFallback();
    initParallax();
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* ---------------- Preloader ---------------- */
  function initPreloader() {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    window.addEventListener("load", function () {
      setTimeout(function () { pre.classList.add("loaded"); }, 500);
    });
    // fallback in case load event is delayed
    setTimeout(function () { pre.classList.add("loaded"); }, 3000);
  }

  /* ---------------- Custom cursor ---------------- */
  function initCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;

    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    loop();

    var hoverables = document.querySelectorAll("a, button, .property-card, input, select, textarea");
    hoverables.forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("hovered"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("hovered"); });
    });
  }

  /* ---------------- Header scroll state ---------------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Active link on scroll
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll(".nav-link");
    if (!sections.length || !navLinks.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      toggle.classList.toggle("active");
      nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.classList.remove("active");
        nav.classList.remove("open");
      });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initScrollReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach(function (el) { el.classList.add("revealed"); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = (i % 4) * 90;
          setTimeout(function () { el.classList.add("revealed"); }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    items.forEach(function (el) { obs.observe(el); });
  }

  /* ---------------- Counters ---------------- */
  function initCounters() {
    var counters = document.querySelectorAll(".stat-number");
    if (!counters.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var duration = 1800;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { obs.observe(el); });
  }

  /* ---------------- 3D tilt on property cards ---------------- */
  function initCardTilt() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion) return;
    var cards = document.querySelectorAll(".card-3d-wrap");

    cards.forEach(function (card) {
      var bounds;
      card.addEventListener("mouseenter", function () {
        bounds = card.getBoundingClientRect();
      });
      card.addEventListener("mousemove", function (e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var x = (e.clientX - bounds.left) / bounds.width - 0.5;
        var y = (e.clientY - bounds.top) / bounds.height - 0.5;
        var rotY = x * 12;
        var rotX = -y * 12;
        card.style.transform = "perspective(1200px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  }

  /* ---------------- Tilt on about photo ---------------- */
  function initAboutTilt() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion) return;
    var card = document.getElementById("aboutCard3d");
    if (!card) return;
    var wrap = card.closest(".about-visual");
    if (!wrap) return;

    wrap.addEventListener("mousemove", function (e) {
      var b = wrap.getBoundingClientRect();
      var x = (e.clientX - b.left) / b.width - 0.5;
      var y = (e.clientY - b.top) / b.height - 0.5;
      card.style.transform = "rotateY(" + (x * 14) + "deg) rotateX(" + (-y * 14) + "deg)";
    });
    wrap.addEventListener("mouseleave", function () {
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  }

  /* ---------------- Property filters ---------------- */
  function initPropertyFilters() {
    var buttons = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".property-card");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");

        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-category") === filter;
          if (match) {
            card.style.display = "";
            requestAnimationFrame(function () {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            });
          } else {
            card.style.opacity = "0";
            card.style.transform = "translateY(16px)";
            setTimeout(function () { card.style.display = "none"; }, 250);
          }
        });
      });
    });

    cards.forEach(function (card) {
      card.style.transition = "opacity .35s ease, transform .35s ease";
    });
  }

  /* ---------------- Testimonial slider (mobile) ---------------- */
  function initTestimonialSlider() {
    var track = document.getElementById("testimonialsTrack");
    var dotsWrap = document.getElementById("testimonialDots");
    if (!track || !dotsWrap) return;

    var cards = track.querySelectorAll(".testimonial-card");
    if (cards.length <= 1) return;

    cards.forEach(function (_, i) {
      var dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll("button");

    function updateVisibility() {
      var isMobile = window.innerWidth <= 1080;
      dotsWrap.style.display = isMobile ? "flex" : "none";
    }
    updateVisibility();
    window.addEventListener("resize", updateVisibility);

    function goTo(index) {
      var isMobile = window.innerWidth <= 1080;
      if (!isMobile) return;
      var card = cards[index];
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
      dots.forEach(function (d, i) { d.classList.toggle("active", i === index); });
    }

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var isMobile = window.innerWidth <= 1080;
        if (isMobile) {
          var scrollCenter = track.scrollLeft + track.clientWidth / 2;
          var closest = 0, minDist = Infinity;
          cards.forEach(function (card, i) {
            var center = card.offsetLeft - track.offsetLeft + card.offsetWidth / 2;
            var dist = Math.abs(center - scrollCenter);
            if (dist < minDist) { minDist = dist; closest = i; }
          });
          dots.forEach(function (d, i) { d.classList.toggle("active", i === closest); });
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------- Contact form ---------------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var success = document.getElementById("formSuccess");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector("button[type=submit]");
      var originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>Enviando...</span> <i class='fa-solid fa-spinner fa-spin'></i>";
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        if (success) success.classList.add("show");
        form.reset();
        setTimeout(function () {
          if (success) success.classList.remove("show");
        }, 5000);
      }, 900);
    });
  }

  /* Hero search form: just prevent reload and jump to properties */
  document.addEventListener("DOMContentLoaded", function () {
    var searchForm = document.getElementById("searchForm");
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var target = document.getElementById("imoveis");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  /* ---------------- Back to top ---------------- */
  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Smooth anchor scrolling with header offset ---------------- */
  function initSmoothAnchors() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var hash = link.getAttribute("href");
        if (hash.length < 2) return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        var headerHeight = document.getElementById("siteHeader").offsetHeight;
        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  /* ---------------- CSS-only floating particles fallback (behind hero text) ---------------- */
  function initParticlesFallback() {
    var wrap = document.getElementById("heroParticles");
    if (!wrap) return;
    var count = 18;
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("span");
      var size = 2 + Math.random() * 4;
      dot.style.position = "absolute";
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.borderRadius = "50%";
      dot.style.background = Math.random() > 0.5 ? "rgba(212,175,106,.5)" : "rgba(143,155,255,.35)";
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top = Math.random() * 100 + "%";
      dot.style.filter = "blur(.5px)";
      dot.style.animation = "floatDot " + (6 + Math.random() * 8) + "s ease-in-out " + (Math.random() * 4) + "s infinite";
      wrap.appendChild(dot);
    }

    if (!document.getElementById("floatDotKeyframes")) {
      var style = document.createElement("style");
      style.id = "floatDotKeyframes";
      style.textContent = "@keyframes floatDot{0%,100%{transform:translateY(0) translateX(0);opacity:.6}50%{transform:translateY(-30px) translateX(12px);opacity:1}}";
      document.head.appendChild(style);
    }
  }

  /* ---------------- Scroll parallax (background/decorative images) ---------------- */
  function initParallax() {
    if (prefersReducedMotion) return;
    var els = document.querySelectorAll("[data-parallax]");
    if (!els.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) * speed;
        el.style.transform = "translateY(" + (-offset) + "px)";
      });
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
  }
})();
