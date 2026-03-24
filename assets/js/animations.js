(function () {
  let overlay;
  let brochureShell;
  let particleCanvas;
  let particleContext;
  let particles = [];
  let frameId = 0;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function prefersReducedMotion() {
    return reducedMotionQuery.matches;
  }

  function resizeCanvas() {
    if (!particleCanvas || !particleContext) {
      return;
    }

    const rect = particleCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    particleCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    particleCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    particleContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedParticles() {
    if (!particleCanvas) {
      return;
    }

    const bounds = particleCanvas.getBoundingClientRect();
    const count = Math.max(14, Math.min(28, Math.round(window.innerWidth / 70)));

    particles = Array.from({ length: count }, function () {
      return {
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
        radius: 1 + Math.random() * 2.1,
        alpha: 0.18 + Math.random() * 0.35,
        velocityX: (Math.random() - 0.5) * 0.34,
        velocityY: (Math.random() - 0.5) * 0.3
      };
    });
  }

  function drawParticles() {
    if (!particleContext || !particleCanvas) {
      return;
    }

    const bounds = particleCanvas.getBoundingClientRect();
    particleContext.clearRect(0, 0, bounds.width, bounds.height);

    particles.forEach(function (particle, index) {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;

      if (particle.x < -20) {
        particle.x = bounds.width + 20;
      } else if (particle.x > bounds.width + 20) {
        particle.x = -20;
      }

      if (particle.y < -20) {
        particle.y = bounds.height + 20;
      } else if (particle.y > bounds.height + 20) {
        particle.y = -20;
      }

      particleContext.beginPath();
      particleContext.fillStyle = "rgba(255, 255, 255, " + particle.alpha + ")";
      particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      particleContext.fill();

      const neighbor = particles[index + 1];

      if (neighbor) {
        particleContext.beginPath();
        particleContext.strokeStyle = "rgba(255, 255, 255, 0.08)";
        particleContext.lineWidth = 1;
        particleContext.moveTo(particle.x, particle.y);
        particleContext.lineTo(neighbor.x, neighbor.y);
        particleContext.stroke();
      }
    });
  }

  function animateParticles() {
    if (!overlay || overlay.classList.contains("is-hidden") || prefersReducedMotion()) {
      frameId = 0;
      return;
    }

    drawParticles();
    frameId = window.requestAnimationFrame(animateParticles);
  }

  function startParticles() {
    if (!particleCanvas || prefersReducedMotion()) {
      return;
    }

    particleContext = particleCanvas.getContext("2d");

    if (!particleContext) {
      return;
    }

    resizeCanvas();
    seedParticles();

    if (!frameId) {
      frameId = window.requestAnimationFrame(animateParticles);
    }
  }

  function stopParticles() {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function setBrochureBlur(shouldBlur) {
    if (!brochureShell) {
      return;
    }

    brochureShell.classList.toggle("brochure-shell--blurred", shouldBlur);
  }

  function showOverlay() {
    if (!overlay) {
      return;
    }

    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    setBrochureBlur(true);
    startParticles();
  }

  function hideOverlay() {
    if (!overlay) {
      return;
    }

    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    setBrochureBlur(false);
    stopParticles();
  }

  function handleResize() {
    if (!particleCanvas || prefersReducedMotion()) {
      return;
    }

    resizeCanvas();
    seedParticles();
  }

  document.addEventListener("DOMContentLoaded", function () {
    overlay = document.getElementById("admissionOverlay");
    brochureShell = document.getElementById("brochureShell");
    particleCanvas = document.getElementById("admissionParticles");

    window.requestAnimationFrame(function () {
      if (brochureShell) {
        brochureShell.classList.add("is-ready");
      }

      if (overlay) {
        overlay.classList.add("is-ready");
      }
    });

    startParticles();
    window.addEventListener("resize", handleResize, { passive: true });

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", function () {
        if (prefersReducedMotion()) {
          stopParticles();
        } else {
          startParticles();
        }
      });
    }
  });

  window.AdmissionExperience = {
    hideOverlay: hideOverlay,
    isOverlayVisible: function () {
      return Boolean(overlay && !overlay.classList.contains("is-hidden"));
    },
    setBrochureBlur: setBrochureBlur,
    showOverlay: showOverlay
  };
})();
