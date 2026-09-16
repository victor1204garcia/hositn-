/* =========================================================
   HOSTIN IMÓVEIS — Cenas 3D (Three.js)
   Hero: "skyline" abstrato de vidro/dourado com partículas
   CTA:  campo de partículas douradas flutuantes
   ========================================================= */
(function () {
  "use strict";

  if (typeof THREE === "undefined") return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     HERO SCENE
     --------------------------------------------------------- */
  function initHeroScene() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    var container = canvas.parentElement;
    var width = container.clientWidth;
    var height = container.clientHeight;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a12, 0.028);

    var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 6, 26);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Lights
    var ambient = new THREE.AmbientLight(0x8892c9, 0.55);
    scene.add(ambient);

    var keyLight = new THREE.PointLight(0xd4af6a, 3.2, 80);
    keyLight.position.set(12, 18, 14);
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0x6f7bff, 2.4, 80);
    rimLight.position.set(-16, 10, -10);
    scene.add(rimLight);

    var fillLight = new THREE.PointLight(0xffffff, 0.6, 60);
    fillLight.position.set(0, -6, 20);
    scene.add(fillLight);

    // ---- City group: abstract glass buildings ----
    var cityGroup = new THREE.Group();
    scene.add(cityGroup);

    var buildingCount = 34;
    var radius = 15;
    var goldEdge = new THREE.Color(0xd4af6a);
    var blueEdge = new THREE.Color(0x8f9bff);

    for (var i = 0; i < buildingCount; i++) {
      var angle = (i / buildingCount) * Math.PI * 2 + Math.random() * 0.15;
      var dist = radius * (0.35 + Math.random() * 0.9);
      var w = 0.9 + Math.random() * 1.6;
      var d = 0.9 + Math.random() * 1.6;
      var h = 2 + Math.random() * 9;

      var geo = new THREE.BoxGeometry(w, h, d);
      var mat = new THREE.MeshPhysicalMaterial({
        color: 0x141b32,
        metalness: 0.35,
        roughness: 0.25,
        transmission: 0.55,
        transparent: true,
        opacity: 0.55,
        thickness: 1.2,
        clearcoat: 0.4,
        reflectivity: 0.6
      });

      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(angle) * dist, h / 2 - 3.5, Math.sin(angle) * dist);
      mesh.rotation.y = Math.random() * Math.PI;
      cityGroup.add(mesh);

      // glowing wireframe edges
      var edges = new THREE.EdgesGeometry(geo);
      var edgeColor = Math.random() > 0.5 ? goldEdge : blueEdge;
      var lineMat = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.55 });
      var lineSegments = new THREE.LineSegments(edges, lineMat);
      mesh.add(lineSegments);
    }

    // ---- Floating particles (dust / stars) ----
    var particleCount = 420;
    var positions = new Float32Array(particleCount * 3);
    for (var p = 0; p < particleCount; p++) {
      positions[p * 3] = (Math.random() - 0.5) * 60;
      positions[p * 3 + 1] = (Math.random() - 0.5) * 30 + 4;
      positions[p * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particleMat = new THREE.PointsMaterial({
      color: 0xd4af6a,
      size: 0.09,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ---- Ground grid ring (subtle) ----
    var ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 1.32, 64);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af6a, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -3.5;
    scene.add(ring);

    // ---- Mouse parallax ----
    var mouseX = 0, mouseY = 0;
    var targetRotY = 0, targetRotX = 0;

    window.addEventListener("mousemove", function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // ---- Resize ----
    function onResize() {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", onResize);

    // ---- Animate ----
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        cityGroup.rotation.y = elapsed * 0.045;
        particles.rotation.y = elapsed * 0.02;
        ring.rotation.z = elapsed * 0.03;

        targetRotY += (mouseX * 0.35 - targetRotY) * 0.03;
        targetRotX += (mouseY * 0.2 - targetRotX) * 0.03;
        camera.position.x = Math.sin(targetRotY) * 26;
        camera.position.y = 6 + targetRotX * 3;
        camera.lookAt(0, -1, 0);

        keyLight.position.x = Math.sin(elapsed * 0.3) * 16;
        keyLight.position.z = Math.cos(elapsed * 0.3) * 16;
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ---------------------------------------------------------
     CTA BANNER SCENE — floating gold particle field
     --------------------------------------------------------- */
  function initCtaScene() {
    var canvas = document.getElementById("cta-canvas");
    if (!canvas) return;

    var container = canvas.parentElement;
    var width = container.clientWidth;
    var height = container.clientHeight;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 18;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    var group = new THREE.Group();
    scene.add(group);

    var count = 260;
    var geo = new THREE.IcosahedronGeometry(0.045, 0);
    var mat = new THREE.MeshBasicMaterial({ color: 0xd4af6a, transparent: true, opacity: 0.7 });

    for (var i = 0; i < count; i++) {
      var m = new THREE.Mesh(geo, mat);
      m.position.set((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 20);
      m.userData.speed = 0.15 + Math.random() * 0.4;
      m.userData.offset = Math.random() * Math.PI * 2;
      group.add(m);
    }

    function onResize() {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", onResize);

    var clock = new THREE.Clock();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        canvas.dataset.visible = entry.isIntersecting ? "1" : "0";
      });
    }, { threshold: 0.05 });
    io.observe(canvas);

    function animate() {
      requestAnimationFrame(animate);
      if (canvas.dataset.visible !== "1") return;
      var elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        group.rotation.y = elapsed * 0.03;
        group.children.forEach(function (m) {
          m.position.y += Math.sin(elapsed * m.userData.speed + m.userData.offset) * 0.003;
          m.rotation.x += 0.003;
          m.rotation.y += 0.004;
        });
      }
      renderer.render(scene, camera);
    }
    animate();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeroScene();
    initCtaScene();
  });
})();
