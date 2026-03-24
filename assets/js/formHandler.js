(function () {
  function isGoogleFormConfigured(config) {
    const googleForm = config.googleForm || {};
    const fields = googleForm.fields || {};
    const values = [googleForm.action, fields.name, fields.className, fields.mobile];

    return values.every(function (value) {
      return Boolean(value) && !String(value).includes("REPLACE");
    });
  }

  function normalizeClassValue(className) {
    const value = String(className || "").trim();

    if (/^Class\s+/i.test(value)) {
      return value.replace(/^Class\s+/i, "").trim();
    }

    return value;
  }

  function appendGoogleFields(form, config, data) {
    const fields = (config.googleForm && config.googleForm.fields) || {};

    form.querySelectorAll(".admission-hidden-field").forEach(function (node) {
      node.remove();
    });

    [
      { name: fields.name, value: data.name },
      { name: fields.className, value: normalizeClassValue(data.className) },
      { name: fields.mobile, value: data.mobile }
    ].forEach(function (entry) {
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = entry.name;
      hiddenInput.value = entry.value;
      hiddenInput.className = "admission-hidden-field";
      form.appendChild(hiddenInput);
    });
  }

  function submitToGoogleForm(form, config, data) {
    if (!isGoogleFormConfigured(config)) {
      window.console.warn("Google Form config is incomplete in assets/js/integrations.js");
      return false;
    }

    appendGoogleFields(form, config, data);
    form.action = config.googleForm.action;
    form.method = "POST";
    form.target = "admissionFormTarget";
    form.enctype = "application/x-www-form-urlencoded";
    HTMLFormElement.prototype.submit.call(form);
    return true;
  }

  function playSynthWelcome(config) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    const context = new AudioContextConstructor();
    const frequencies = ((config.audio && config.audio.tone) || [523.25, 659.25, 783.99]).slice(0, 3);
    const volume = (config.audio && config.audio.volume) || 0.18;
    const startAt = context.currentTime + 0.02;

    frequencies.forEach(function (frequency, index) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const noteStart = startAt + index * 0.12;
      const noteEnd = noteStart + 0.22;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gainNode.gain.setValueAtTime(0.0001, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(volume / (index + 1.5), noteStart + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);
    });

    window.setTimeout(function () {
      if (typeof context.close === "function") {
        context.close().catch(function () {});
      }
    }, 900);
  }

  function configureAudioElement(audioElement, config) {
    if (!audioElement) {
      return;
    }

    audioElement.volume = (config.audio && config.audio.volume) || 0.3;
    audioElement.loop = !(config.audio && config.audio.loop === false);
    audioElement.preload = "auto";
    audioElement.autoplay = !(config.audio && config.audio.autoplay === false);
    audioElement.playsInline = true;
    setupAudioBoost(audioElement, config);
  }

  function getAudioBoostValue(config) {
    const boost = Number(config.audio && config.audio.gainBoost);

    if (!Number.isFinite(boost) || boost <= 0) {
      return 1;
    }

    return boost;
  }

  function setupAudioBoost(audioElement, config) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    const gainBoost = getAudioBoostValue(config);

    if (!audioElement || !AudioContextConstructor || gainBoost <= 1) {
      return null;
    }

    if (audioElement.__admissionAudioState) {
      audioElement.__admissionAudioState.gainNode.gain.value = gainBoost;
      return audioElement.__admissionAudioState;
    }

    try {
      const context = new AudioContextConstructor();
      const source = context.createMediaElementSource(audioElement);
      const gainNode = context.createGain();

      gainNode.gain.value = gainBoost;
      source.connect(gainNode);
      gainNode.connect(context.destination);

      audioElement.__admissionAudioState = {
        context: context,
        gainNode: gainNode,
        source: source
      };

      return audioElement.__admissionAudioState;
    } catch (error) {
      return null;
    }
  }

  function resumeAudioBoost(audioElement, config) {
    const audioState = setupAudioBoost(audioElement, config);

    if (!audioState || !audioState.context || audioState.context.state !== "suspended") {
      return Promise.resolve();
    }

    return audioState.context.resume().catch(function () {
      return undefined;
    });
  }

  function playAudioElement(audioElement, config) {
    if (!audioElement) {
      return Promise.reject(new Error("Audio element not found"));
    }

    return resumeAudioBoost(audioElement, config).then(function () {
      const result = audioElement.play();

      if (result && typeof result.then === "function") {
        return result;
      }

      return Promise.resolve();
    });
  }

  function setupBackgroundAudio(audioElement, config) {
    const shouldAutoplay = !(config.audio && config.audio.autoplay === false);

    if (!audioElement || !shouldAutoplay) {
      return;
    }

    configureAudioElement(audioElement, config);

    const fallbackEvents = ["pointerdown", "touchstart", "click", "keydown"];
    let unlocked = false;
    let retryTimer = 0;

    function cleanupFallbackListeners() {
      fallbackEvents.forEach(function (eventName) {
        document.removeEventListener(eventName, unlockAudio, true);
      });

      audioElement.removeEventListener("canplay", attemptPlayback);
      audioElement.removeEventListener("loadeddata", attemptPlayback);
      window.removeEventListener("pageshow", attemptPlayback);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (retryTimer) {
        window.clearTimeout(retryTimer);
        retryTimer = 0;
      }
    }

    function markUnlocked() {
      unlocked = true;
      cleanupFallbackListeners();
    }

    function scheduleRetry() {
      if (unlocked || retryTimer) {
        return;
      }

      retryTimer = window.setTimeout(function () {
        retryTimer = 0;
        attemptPlayback();
      }, 700);
    }

    function attemptPlayback() {
      if (unlocked) {
        return;
      }

      playAudioElement(audioElement, config)
        .then(function () {
          markUnlocked();
        })
        .catch(function () {
          scheduleRetry();
        });
    }

    function unlockAudio() {
      if (unlocked) {
        return;
      }

      attemptPlayback();
    }

    function handleVisibilityChange() {
      if (!document.hidden) {
        attemptPlayback();
      }
    }

    audioElement.load();
    audioElement.addEventListener("canplay", attemptPlayback);
    audioElement.addEventListener("loadeddata", attemptPlayback);
    window.addEventListener("pageshow", attemptPlayback);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    fallbackEvents.forEach(function (eventName) {
      document.addEventListener(eventName, unlockAudio, true);
    });

    attemptPlayback();
  }

  function playWelcomeSound(audioElement, config) {
    const useFile = Boolean(config.audio && config.audio.useFile && audioElement);

    if (!useFile) {
      playSynthWelcome(config);
      return;
    }

    configureAudioElement(audioElement, config);

    if (!audioElement.paused) {
      return;
    }

    playAudioElement(audioElement, config).catch(function () {
      playSynthWelcome(config);
    });
  }

  function wireBrochureLinks(config, openOverlay) {
    document.querySelectorAll(".btn-royal, .adm-btn").forEach(function (node) {
      node.addEventListener("click", openOverlay);
    });

    document.querySelectorAll(".btn-orange").forEach(function (node) {
      node.href = (config.links && config.links.app) || "#";
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    });

    document.querySelectorAll(".soc-b").forEach(function (node) {
      if (node.textContent && node.textContent.toLowerCase().includes("whatsapp")) {
        node.href = (config.whatsapp && config.whatsapp.baseUrl) || "https://wa.me/918400585469";
        node.target = "_blank";
        node.rel = "noopener noreferrer";
      }
    });
  }

  function focusField(field, preventScroll) {
    if (!field) {
      return;
    }

    try {
      field.focus({ preventScroll: preventScroll });
    } catch (error) {
      field.focus();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const config = window.SBICAdmissionConfig || {};
    const experience = window.AdmissionExperience || {};
    const form = document.getElementById("admissionForm");
    const closeButton = document.getElementById("admissionClose");
    const nameInput = document.getElementById("admissionName");
    const classInput = document.getElementById("admissionClass");
    const mobileInput = document.getElementById("admissionMobile");
    const status = document.getElementById("admissionStatus");
    const audioElement = document.getElementById("welcomeSound");

    if (!form || !nameInput || !classInput || !mobileInput || !status) {
      return;
    }

    setupBackgroundAudio(audioElement, config);

    function openOverlay(event) {
      if (event) {
        event.preventDefault();
      }

      status.hidden = true;
      form.classList.remove("is-submitting");
      experience.showOverlay && experience.showOverlay();

      window.setTimeout(function () {
        focusField(nameInput, false);
      }, 120);
    }

    mobileInput.addEventListener("input", function () {
      mobileInput.value = mobileInput.value.replace(/\D+/g, "").slice(0, 10);
    });

    if (closeButton) {
      closeButton.addEventListener("click", function () {
        status.hidden = true;
        experience.hideOverlay && experience.hideOverlay();
      });
    }

    wireBrochureLinks(config, openOverlay);

    form.addEventListener("submit", function (event) {
      const data = {
        className: classInput.value.trim(),
        mobile: mobileInput.value.trim(),
        name: nameInput.value.trim()
      };

      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      form.classList.add("is-submitting");
      submitToGoogleForm(form, config, data);

      status.hidden = false;
      status.textContent = "Thank you. Your admission enquiry has been submitted.";

      playWelcomeSound(audioElement, config);
      form.reset();

      window.setTimeout(function () {
        form.classList.remove("is-submitting");
        status.hidden = true;
        experience.hideOverlay && experience.hideOverlay();
      }, 900);
    });

    window.setTimeout(function () {
      if (experience.isOverlayVisible && experience.isOverlayVisible()) {
        focusField(nameInput, true);
      }
    }, 450);
  });
})();
