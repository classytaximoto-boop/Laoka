/* ============================================================
   LAOKA — ui-mahandro.js
   Écran « MAHANDRO » : guide de cuisson pas-à-pas en swipe,
   avec minuteur et température indicative par étape.
   ============================================================ */

/* Température indicative (°C) par type de cuisson — donnée informative,
   à ajuster selon le matériel (kitchen à sy, gaz, four...). */
const MAHANDRO_TEMP_BY_TYPE = {
  RITRA: 160,
  KIENDY: 180,
  SAOSY: 140,
  RONY: 100,
  LASOPY: 100,
  LEGUMES: 150,
  POISSON: 170,
  ATODY: 150,
  MAINA: 190,
  VOAMAINA: 100,
  KETSAKETSA: 25,
};

const MAHANDRO_UI = {
  recipe: null,
  result: null,
  steps: [],
  current: 0,
  timerInterval: null,
  timerRemaining: 0,
  timerRunning: false,
  touchStartX: null,

  /* ------------------- OUVERTURE ------------------- */
  open(result) {
    const { recipe } = result;
    this.recipe = recipe;
    this.result = result;
    this.steps = this.buildSteps(recipe);
    this.current = 0;
    this.stopTimer();

    const html = `
      <div class="modal-header">
        <h2>👨‍🍳 Mahandro — ${recipe.name}</h2>
        <button class="modal-close" id="closeMahandroModal" aria-label="Hidiy">✕</button>
      </div>
      <div class="mahandro-wrap" id="mahandroWrap">
        <div class="mahandro-dots" id="mahandroDots"></div>
        <div class="mahandro-track" id="mahandroTrack"></div>
        <div class="mahandro-nav">
          <button class="btn btn-secondary" id="mahandroPrev">‹ Teo</button>
          <span class="mahandro-count" id="mahandroCount"></span>
          <button class="btn btn-primary" id="mahandroNext">Manaraka ›</button>
        </div>
      </div>
    `;
    UI.openModal(html);
    document.getElementById("closeMahandroModal").addEventListener("click", () => {
      this.stopTimer();
      UI.closeModal();
    });
    this.renderDots();
    this.renderSlide();
    this.bindNav();
    this.bindSwipe();
  },

  /* ------------------- CONSTRUCTION DES ÉTAPES ------------------- */
  buildSteps(recipe) {
    const baseTemp = MAHANDRO_TEMP_BY_TYPE[recipe.type] || null;
    return recipe.steps.map((text, i) => ({
      index: i,
      text,
      seconds: this.guessDuration(text),
      temp: this.guessTemp(text, baseTemp),
    }));
  },

  /* Essaie de deviner une durée depuis le texte de l'étape (mots-clés en malagasy).
     Sinon, retourne une durée par défaut modeste pour garder un minuteur utile. */
  guessDuration(text) {
    const t = text.toLowerCase();
    const minMatch = t.match(/(\d+)\s*(minitra|min)/);
    if (minMatch) return parseInt(minMatch[1], 10) * 60;
    if (/mandra-maina|mandra-mivalana|moramora/.test(t)) return 15 * 60;
    if (/mandra-masaka|mandra-malemy/.test(t)) return 10 * 60;
    if (/atono kely|kely/.test(t)) return 5 * 60;
    if (/aharo|asio|ampiana|voavily|voatetika|diovina|tapaho/.test(t)) return 3 * 60;
    return 4 * 60;
  },

  /* Température indicative par étape : garde la base du type de plat,
     sauf pour les étapes de préparation à froid (couper, laver...) qui n'en ont pas besoin. */
  guessTemp(text, baseTemp) {
    const t = text.toLowerCase();
    const prepOnly = /diovina|tapaho|voatetika(?!.*atono)|handioviana|hotapahina/.test(t) && !/atono|ahandroina|endasina/.test(t);
    if (prepOnly) return null;
    if (baseTemp == null) return null;
    if (/mafana be|endasina/.test(t)) return baseTemp + 20;
    return baseTemp;
  },

  /* ------------------- RENDU ------------------- */
  renderDots() {
    const dots = document.getElementById("mahandroDots");
    dots.innerHTML = this.steps.map((s, i) =>
      `<span class="mahandro-dot${i === this.current ? " active" : ""}${i < this.current ? " done" : ""}"></span>`
    ).join("");
  },

  renderSlide() {
    this.stopTimer();
    const step = this.steps[this.current];
    const track = document.getElementById("mahandroTrack");
    const count = document.getElementById("mahandroCount");
    const prevBtn = document.getElementById("mahandroPrev");
    const nextBtn = document.getElementById("mahandroNext");

    track.innerHTML = `
      <div class="mahandro-slide fade-in">
        <div class="mahandro-step-num">Dingana ${this.current + 1} / ${this.steps.length}</div>
        <p class="mahandro-step-text">${step.text}</p>
        <div class="mahandro-meta-row">
          ${step.temp != null ? `<div class="mahandro-meta-chip">🌡️ ${step.temp}°C</div>` : ""}
          ${step.seconds ? `<div class="mahandro-meta-chip">⏱️ ${this.formatDuration(step.seconds)}</div>` : ""}
        </div>
        ${step.seconds ? `
          <div class="mahandro-timer">
            <div class="mahandro-timer-display" id="mahandroTimerDisplay">${this.formatDuration(step.seconds)}</div>
            <div class="mahandro-timer-actions">
              <button class="btn btn-secondary btn-sm" id="mahandroTimerToggle">▶️ Atomboy</button>
              <button class="btn btn-tertiary btn-sm" id="mahandroTimerReset">↺ Averina</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;

    count.textContent = `${this.current + 1} / ${this.steps.length}`;
    prevBtn.disabled = this.current === 0;
    prevBtn.classList.toggle("btn-disabled", this.current === 0);

    const isLast = this.current === this.steps.length - 1;
    nextBtn.textContent = isLast ? "✅ Vita ny fahandroana" : "Manaraka ›";

    if (step.seconds) {
      this.timerRemaining = step.seconds;
      this.timerRunning = false;
      document.getElementById("mahandroTimerToggle").addEventListener("click", () => this.toggleTimer());
      document.getElementById("mahandroTimerReset").addEventListener("click", () => this.resetTimer());
    }

    this.renderDots();
  },

  bindNav() {
    document.getElementById("mahandroPrev").addEventListener("click", () => {
      if (this.current > 0) {
        this.current--;
        this.renderSlide();
      }
    });
    document.getElementById("mahandroNext").addEventListener("click", () => {
      const isLast = this.current === this.steps.length - 1;
      if (isLast) {
        this.finish();
      } else {
        this.current++;
        this.renderSlide();
      }
    });
  },

  bindSwipe() {
    const wrap = document.getElementById("mahandroWrap");
    wrap.addEventListener("touchstart", (e) => {
      this.touchStartX = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener("touchend", (e) => {
      if (this.touchStartX == null) return;
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const threshold = 45;
      if (dx < -threshold && this.current < this.steps.length - 1) {
        this.current++;
        this.renderSlide();
      } else if (dx > threshold && this.current > 0) {
        this.current--;
        this.renderSlide();
      }
      this.touchStartX = null;
    }, { passive: true });
  },

  /* ------------------- MINUTEUR ------------------- */
  toggleTimer() {
    const btn = document.getElementById("mahandroTimerToggle");
    if (this.timerRunning) {
      this.stopTimer();
      btn.textContent = "▶️ Atomboy";
    } else {
      this.timerRunning = true;
      btn.textContent = "⏸️ Ajanony";
      this.timerInterval = setInterval(() => {
        this.timerRemaining--;
        const display = document.getElementById("mahandroTimerDisplay");
        if (display) display.textContent = this.formatDuration(Math.max(this.timerRemaining, 0));
        if (this.timerRemaining <= 0) {
          this.stopTimer();
          UI.toast(`⏰ Vita ny fotoana — dingana ${this.current + 1}!`);
          if (display) display.classList.add("mahandro-timer-done");
        }
      }, 1000);
    }
  },

  resetTimer() {
    this.stopTimer();
    const step = this.steps[this.current];
    if (!step) return;
    this.timerRemaining = step.seconds;
    const display = document.getElementById("mahandroTimerDisplay");
    if (display) {
      display.textContent = this.formatDuration(step.seconds);
      display.classList.remove("mahandro-timer-done");
    }
    const btn = document.getElementById("mahandroTimerToggle");
    if (btn) btn.textContent = "▶️ Atomboy";
  },

  stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.timerRunning = false;
  },

  formatDuration(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  },

  /* ------------------- FIN DE CUISSON ------------------- */
  finish() {
    this.stopTimer();
    UI.closeModal();
    if (this.result) UI.cookRecipe(this.result);
  },
};
