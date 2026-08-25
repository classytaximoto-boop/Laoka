/* ============================================================
   LAOKA — ui-kitchen-live.js
   Écran « Ao an-dakozia » : mode cuisson en direct, ouvert par
   swipe droite→gauche sur une carte de résultat (voir ui.js
   bindCardSwipeToMahandro). Différent de MAHANDRO_UI (guide
   pas-à-pas par étapes) : ici un seul écran minimaliste avec
   chrono live, température ajustable, type de feu, contenu de
   la marmite et une bannière d'avertissement — pensé pour rester
   ouvert à côté du fourneau pendant toute la cuisson, pas pour
   naviguer entre étapes.
   ============================================================ */

const FIRE_TYPES = ["charbon", "kitay", "gaz", "bio"];
const FIRE_TYPE_LABELS = {
  charbon: "🔥 Charbon",
  kitay: "🪵 Kitay",
  gaz: "🔵 Gaz",
  bio: "🌱 Bio",
};

/* "Ce qu'il y a dans la marmite" — reprend les mêmes catégories de cuisson que MAHANDRO_TEMP_BY_TYPE
   (voir ui-mahandro.js), pour rester cohérent avec le reste de l'app plutôt que d'inventer une
   nouvelle liste. */
const KITCHEN_INSIDE_TYPES = ["RONY", "SAOSY", "RITRA", "KIENDY", "LEGUMES", "VOAMAINA", "KETSAKETSA"];
const KITCHEN_INSIDE_LABELS = {
  RONY: "Rony", SAOSY: "Saosy", RITRA: "Ritra", KIENDY: "Kiendy (endasina)",
  LEGUMES: "Legioma", VOAMAINA: "Voamaina", KETSAKETSA: "Ketsaketsa",
};

const KITCHEN_LIVE_UI = {
  recipe: null,
  fireType: null,
  insideType: null,
  temp: 100,
  elapsedSeconds: 0,
  timerInterval: null,
  timerRunning: false,

  /* ------------------- OUVERTURE ------------------- */
  /** Point d'entrée appelé au swipe (voir ui.js bindCardSwipeToMahandro). Affiche d'abord un petit
   *  écran de préparation (type de feu + contenu de la marmite), choisis manuellement à chaque
   *  ouverture — voir décision utilisateur : pas de déduction automatique depuis dishSubCategory,
   *  car le même laoka peut être cuisiné différemment (feu, marmite) selon les jours. */
  open(result) {
    this.recipe = result.recipe;
    this.fireType = null;
    this.insideType = this.guessInsideType(result.recipe);
    this.renderSetup();
  },

  /** Déduit une valeur initiale plausible pour "inside" à partir de dishSubCategory/type de la
   *  recette, uniquement pour pré-sélectionner un choix dans le setup — l'utilisateur reste libre
   *  de le changer avant de lancer le chrono (voir open ci-dessus). */
  guessInsideType(recipe) {
    const bySubCategory = { rony: "RONY", ritra: "RITRA", saosy: "SAOSY", ketsaketsa: "KETSAKETSA" };
    return bySubCategory[recipe.dishSubCategory] || recipe.type || "RITRA";
  },

  renderSetup() {
    const html = `
      <div class="kitchen-setup fade-in">
        <h2>Ao an-dakozia</h2>
        <p class="muted">${this.recipe.name}</p>

        <div class="field">
          <label>Karazana afo</label>
          <div class="choice-grid">
            ${FIRE_TYPES.map((f) => `<button type="button" class="choice-chip ${this.fireType === f ? "active" : ""}" data-fire="${f}">${FIRE_TYPE_LABELS[f]}</button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label>Ao anaty vilany (inside)</label>
          <div class="choice-grid">
            ${KITCHEN_INSIDE_TYPES.map((t) => `<button type="button" class="choice-chip ${this.insideType === t ? "active" : ""}" data-inside="${t}">${KITCHEN_INSIDE_LABELS[t]}</button>`).join("")}
          </div>
        </div>

        <button class="btn btn-primary btn-block" id="kitchenSetupStart" ${this.fireType ? "" : "disabled"}>Andao hanomboka</button>
        <button class="btn btn-tertiary btn-block" id="kitchenSetupCancel">Aoka</button>
      </div>
    `;
    UI.openModal(html);

    const startBtn = document.getElementById("kitchenSetupStart");
    document.querySelectorAll("[data-fire]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.fireType = btn.dataset.fire;
        document.querySelectorAll("[data-fire]").forEach((b) => b.classList.toggle("active", b === btn));
        startBtn.disabled = false;
      });
    });
    document.querySelectorAll("[data-inside]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.insideType = btn.dataset.inside;
        document.querySelectorAll("[data-inside]").forEach((b) => b.classList.toggle("active", b === btn));
      });
    });
    startBtn.addEventListener("click", () => this.startLive());
    document.getElementById("kitchenSetupCancel").addEventListener("click", () => UI.closeModal());
  },

  /* ------------------- ÉCRAN LIVE ------------------- */
  startLive() {
    this.temp = (typeof MAHANDRO_TEMP_BY_TYPE !== "undefined" && MAHANDRO_TEMP_BY_TYPE[this.insideType]) || 100;
    this.elapsedSeconds = 0;
    this.timerRunning = true;
    this.renderLive();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      const el = document.getElementById("kitchenLiveClock");
      if (el) el.textContent = this.formatElapsed(this.elapsedSeconds);
    }, 1000);
  },

  formatElapsed(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  },

  renderLive() {
    const html = `
      <div class="kitchen-live fade-in">
        <div class="kitchen-live-clock" id="kitchenLiveClock">${this.formatElapsed(this.elapsedSeconds)}</div>

        <div class="kitchen-live-row">
          <div class="kitchen-live-temp">
            <button type="button" class="kitchen-temp-btn" id="kitchenTempDown">−</button>
            <span id="kitchenTempValue">${this.temp}°</span>
            <button type="button" class="kitchen-temp-btn" id="kitchenTempUp">+</button>
          </div>
          <div class="kitchen-live-fire">${FIRE_TYPE_LABELS[this.fireType]}</div>
        </div>

        <div class="kitchen-live-inside">
          <span class="muted small">Ao anaty vilany</span>
          <div class="kitchen-live-inside-value">${KITCHEN_INSIDE_LABELS[this.insideType] || this.insideType}</div>
        </div>

        <h3 class="kitchen-live-name">${this.recipe.name}</h3>

        <div class="kitchen-live-warning">
          ⚠️ Tandremo — mijery matetika, aza avela ho maina na may ny sakafo.
        </div>

        <button class="btn btn-tertiary btn-block" id="kitchenLiveClose">Ajanony</button>
      </div>
    `;
    UI.openModal(html);

    document.getElementById("kitchenTempUp").addEventListener("click", () => this.adjustTemp(5));
    document.getElementById("kitchenTempDown").addEventListener("click", () => this.adjustTemp(-5));
    document.getElementById("kitchenLiveClose").addEventListener("click", () => this.stopLive());
  },

  adjustTemp(delta) {
    this.temp = Math.max(0, this.temp + delta);
    const el = document.getElementById("kitchenTempValue");
    if (el) el.textContent = `${this.temp}°`;
  },

  stopLive() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.timerRunning = false;
    UI.closeModal();
  },
};
