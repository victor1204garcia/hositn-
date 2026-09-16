/* =========================================================
   HOSTIN IMÓVEIS — Página de detalhe do imóvel
   ========================================================= */
(function () {
  "use strict";

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function featureHtml(f) {
    return '<div class="property-feature-item"><i class="fa-solid ' + f.icon + '"></i><span>' + f.label + "</span></div>";
  }

  function cardHtml(p) {
    var badgeClass = p.rent ? "property-badge property-badge-rent" : "property-badge";
    var priceText = p.price + (p.rent ? "/mês" : "");
    var features = p.features
      .map(function (f) {
        return '<span><i class="fa-solid ' + f.icon + '"></i> ' + f.label + "</span>";
      })
      .join("");
    return (
      '<article class="property-card revealed">' +
      '<div class="card-3d-wrap">' +
      '<div class="property-image">' +
      '<img src="' + p.image + '" alt="' + p.title + '">' +
      '<span class="' + badgeClass + '">' + p.badge + "</span>" +
      '<div class="property-price">' + priceText + "</div>" +
      "</div>" +
      '<div class="property-body">' +
      "<h3>" + p.title + "</h3>" +
      '<p class="property-location"><i class="fa-solid fa-location-dot"></i> ' + p.bairro + ", " + p.cidade + "</p>" +
      '<div class="property-features">' + features + "</div>" +
      '<a href="imovel.html?id=' + p.id + '" class="property-link">Ver detalhes <i class="fa-solid fa-arrow-right"></i></a>' +
      "</div></div></article>"
    );
  }

  function initCardTiltFor(container) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    container.querySelectorAll(".card-3d-wrap").forEach(function (card) {
      var bounds;
      card.addEventListener("mouseenter", function () {
        bounds = card.getBoundingClientRect();
      });
      card.addEventListener("mousemove", function (e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var x = (e.clientX - bounds.left) / bounds.width - 0.5;
        var y = (e.clientY - bounds.top) / bounds.height - 0.5;
        card.style.transform = "perspective(1200px) rotateX(" + (-y * 12) + "deg) rotateY(" + (x * 12) + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var list = window.HOSTIN_PROPERTIES || [];
    var id = parseInt(getParam("id"), 10);
    var property = list.filter(function (p) { return p.id === id; })[0] || list[0];
    if (!property) return;

    document.title = property.title + " | Hostin Imóveis";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", property.description.slice(0, 155));
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", property.title + " | Hostin Imóveis");
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", property.description.slice(0, 155));

    var breadcrumbTitle = document.getElementById("breadcrumbTitle");
    if (breadcrumbTitle) breadcrumbTitle.textContent = property.title;

    var titleEl = document.getElementById("propertyTitle");
    if (titleEl) titleEl.textContent = property.title;

    var locEl = document.getElementById("propertyLocation");
    if (locEl) locEl.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + property.bairro + ", " + property.cidade;

    var priceEl = document.getElementById("propertyPrice");
    if (priceEl) priceEl.textContent = property.price + (property.rent ? "/mês" : "");

    var badgeEl = document.getElementById("propertyBadge");
    if (badgeEl) {
      badgeEl.textContent = property.badge;
      if (property.rent) badgeEl.classList.add("property-badge-rent");
    }

    var bgEl = document.getElementById("propertyHeroBg");
    if (bgEl) bgEl.style.backgroundImage = "url('" + property.image + "')";

    var galleryEl = document.getElementById("propertyGallery");
    if (galleryEl) galleryEl.innerHTML = '<img src="' + property.image + '" alt="' + property.title + '">';

    var descEl = document.getElementById("propertyDescription");
    if (descEl) descEl.textContent = property.description;

    var gridEl = document.getElementById("propertyFeatureGrid");
    if (gridEl) gridEl.innerHTML = property.features.map(featureHtml).join("");

    var refEl = document.getElementById("propertyRef");
    if (refEl) refEl.textContent = "Referência: " + property.ref + " — Hostin Imóveis Ltda. CRECI 3.317-J";

    var msg = encodeURIComponent(
      'Olá! Tenho interesse no imóvel "' + property.title + '" (Ref. ' + property.ref + '), vi no site da Hostin Imóveis.'
    );
    var whatsEl = document.getElementById("propertyWhatsapp");
    if (whatsEl) whatsEl.href = "https://wa.me/" + property.whatsapp + "?text=" + msg;

    var similarWrap = document.getElementById("similarProperties");
    if (similarWrap) {
      var similar = list.filter(function (p) { return p.id !== property.id; });
      similar.sort(function (a, b) {
        var aScore = a.category === property.category ? 0 : 1;
        var bScore = b.category === property.category ? 0 : 1;
        return aScore - bScore;
      });
      similarWrap.innerHTML = similar.slice(0, 3).map(cardHtml).join("");
      initCardTiltFor(similarWrap);
    }
  });
})();
