/* ============================================================
   LAOKA — ui-profil.js
   Écran « PROFIL » : préférences, fady, halal, mpino, historique, paramètres
   ============================================================ */

const PROFIL_UI = {
  currentTab: "menu",

  render() {
    const el = document.getElementById("screen-profil");
    el.innerHTML = `<div id="profilContent"></div>`;
    this.renderMenu();
  },

  renderMenu() {
    const el = document.getElementById("profilContent");
    el.innerHTML = `
      <div class="page-header fade-in">
        <h2>Profil</h2>
      </div>
      <div class="profil-menu fade-in">
        <button class="profil-item" data-tab="preferences"><span>❤️ Préférences (Tiako / Tsy tiako)</span><span>›</span></button>
        <button class="profil-item" data-tab="fady"><span>🚫 Fady ko</span><span>›</span></button>
        <button class="profil-item" data-tab="halal"><span>☪️ Halal</span><span>›</span></button>
        <button class="profil-item" data-tab="mpino"><span>🙏 Fomba fihinanana</span><span>›</span></button>
        <button class="profil-item" id="profilFetyBtn"><span>🎉 Fety</span><span>›</span></button>
        <button class="profil-item" data-tab="parametres"><span>⚙️ Paramètres</span><span>›</span></button>
        <button class="profil-item" data-tab="historique"><span>📜 Historique (Ny nohaniko)</span><span>›</span></button>
      </div>
    `;
    el.querySelectorAll(".profil-item[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => this.renderTab(btn.dataset.tab));
    });
    document.getElementById("profilFetyBtn").addEventListener("click", () => {
      FETY_UI.state.occasion = null;
      FETY_UI.render();
    });
  },

  backButton() {
    return `<button class="btn-back" id="profilBack">← Retour</button>`;
  },
  bindBack() {
    document.getElementById("profilBack").addEventListener("click", () => this.renderMenu());
  },

  renderTab(tab) {
    if (tab === "preferences") return this.renderPreferences();
    if (tab === "fady") return this.renderFady();
    if (tab === "halal") return this.renderHalal();
    if (tab === "mpino") return this.renderMpino();
    if (tab === "parametres") return this.renderParametres();
    if (tab === "historique") return this.renderHistorique();
  },

  /* ------------------- PRÉFÉRENCES ------------------- */
  renderPreferences() {
    const el = document.getElementById("profilContent");
    const products = DATA.state.products;
    const profile = DATA.state.profile;

    el.innerHTML = `
      ${this.backButton()}
      <div class="page-header fade-in"><h2>Préférences</h2></div>
      <section class="section fade-in">
        <h3 class="section-title">❤️ Tiako</h3>
        <div class="chip-list" id="likesList">
          ${profile.likes.map((id) => this.chipHTML(id, "like")).join("")}
        </div>
        <button class="btn btn-secondary btn-sm" id="addLikeBtn">+ Ajouter</button>
      </section>
      <section class="section fade-in">
        <h3 class="section-title">❌ Tsy tiako</h3>
        <div class="chip-list" id="dislikesList">
          ${profile.dislikes.map((id) => this.chipHTML(id, "dislike")).join("")}
        </div>
        <button class="btn btn-secondary btn-sm" id="addDislikeBtn">+ Ajouter</button>
      </section>
    `;
    this.bindBack();
    document.getElementById("addLikeBtn").addEventListener("click", () => this.openProductPicker("likes"));
    document.getElementById("addDislikeBtn").addEventListener("click", () => this.openProductPicker("dislikes"));
    this.bindChipRemoval();
  },

  chipHTML(productId, listType) {
    const p = DATA.getProduct(productId);
    return `<span class="chip" data-id="${productId}" data-list="${listType}">${p ? p.name : productId} <button class="chip-remove" aria-label="Esory">✕</button></span>`;
  },

  bindChipRemoval() {
    document.querySelectorAll(".chip-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chip = btn.closest(".chip");
        const id = chip.dataset.id;
        const list = chip.dataset.list;
        DATA.state.profile[list] = DATA.state.profile[list].filter((x) => x !== id);
        DATA.saveData();
        this.renderPreferences();
      });
    });
  },

  openProductPicker(targetList) {
    const products = DATA.state.products;
    UI.openModal(`
      <div class="modal-header"><h2>Choisir un aliment</h2><button class="modal-close" id="closePickerModal">✕</button></div>
      <div class="picker-list">
        ${products.map((p) => `<button class="picker-item" data-id="${p.id}">${p.name}</button>`).join("")}
      </div>
    `);
    document.getElementById("closePickerModal").addEventListener("click", () => UI.closeModal());
    document.querySelectorAll(".picker-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const list = DATA.state.profile[targetList];
        if (!list.includes(id)) list.push(id);
        DATA.saveData();
        UI.closeModal();
        this.renderPreferences();
      });
    });
  },

  /* ------------------- FADY ------------------- */
  renderFady() {
    const el = document.getElementById("profilContent");
    const products = DATA.state.products;
    const profile = DATA.state.profile;

    el.innerHTML = `
      ${this.backButton()}
      <div class="page-header fade-in"><h2>Fady ko</h2><p class="muted">Ny fady dia tsy ho asehon'ny fitodihana mihitsy.</p></div>
      <section class="section fade-in">
        <div class="fady-list">
          ${products.map((p) => `
            <label class="checkbox-row">
              <input type="checkbox" data-id="${p.id}" ${profile.fady.includes(p.id) ? "checked" : ""}>
              <span>${p.name}</span>
            </label>
          `).join("")}
        </div>
      </section>
    `;
    this.bindBack();
    el.querySelectorAll(".fady-list input[type='checkbox']").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.dataset.id;
        if (cb.checked) {
          if (!DATA.state.profile.fady.includes(id)) DATA.state.profile.fady.push(id);
        } else {
          DATA.state.profile.fady = DATA.state.profile.fady.filter((x) => x !== id);
        }
        DATA.saveData();
        UI.toast("Fady voaraikitra.");
      });
    });
  },

  /* ------------------- HALAL ------------------- */
  renderHalal() {
    const el = document.getElementById("profilContent");
    const profile = DATA.state.profile;
    el.innerHTML = `
      ${this.backButton()}
      <div class="page-header fade-in"><h2>Halal</h2></div>
      <section class="section fade-in card">
        <label class="toggle-row">
          <span>Activer Halal</span>
          <input type="checkbox" id="halalToggle" ${profile.halal ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
        <p class="muted small">Raha ON, dia hosivanina ny laoka sy akora tsy mifanaraka.</p>
      </section>
      <section class="section fade-in">
        <h3 class="section-title">Règles personnalisées</h3>
        <p class="muted">Manampia FADY manokana ao amin'ny « Fady ko » raha ilaina.</p>
      </section>
    `;
    this.bindBack();
    document.getElementById("halalToggle").addEventListener("change", (e) => {
      profile.halal = e.target.checked;
      DATA.saveData();
      UI.toast(profile.halal ? "Halal activé." : "Halal désactivé.");
    });
  },

  /* ------------------- MPINO / FOMBA FIHINANANA ------------------- */
  renderMpino() {
    const el = document.getElementById("profilContent");
    const profile = DATA.state.profile;
    const modes = [
      { id: "standard", label: "Standard" },
      { id: "halal", label: "Halal" },
      { id: "mpino", label: "Mpino" },
      { id: "sabatista", label: "Sabatista / Adventiste" },
      { id: "vegetarien", label: "Végétarien" },
      { id: "personnalise", label: "Personnalisé" },
    ];
    el.innerHTML = `
      ${this.backButton()}
      <div class="page-header fade-in"><h2>Fomba fihinanana</h2><p class="muted">Tsy mitovy daholo ny fombam-pihinanan'ny kristianina rehetra — safidio izay mifanaraka aminao.</p></div>
      <section class="section fade-in">
        <div class="radio-list">
          ${modes.map((m) => `
            <label class="radio-row">
              <input type="radio" name="dietMode" value="${m.id}" ${profile.dietMode === m.id ? "checked" : ""}>
              <span>${m.label}</span>
            </label>
          `).join("")}
        </div>
      </section>
    `;
    this.bindBack();
    el.querySelectorAll("input[name='dietMode']").forEach((r) => {
      r.addEventListener("change", () => {
        profile.dietMode = r.value;
        if (r.value === "halal") profile.halal = true;
        DATA.saveData();
        UI.toast("Fomba fihinanana voaraikitra.");
      });
    });
  },

  /* ------------------- PARAMÈTRES ------------------- */
  TONE_OPTIONS: [
    { id: "simple", label: "Simple", icon: "💬", desc: "Ton naturel, tsotra sy mahazatra." },
    { id: "elegant", label: "Élégant", icon: "🌸", desc: "Fitenenana malemy paika sy voafidy." },
    { id: "professionnel", label: "Professionnel", icon: "💼", desc: "Fomba fitenenana marin-toerana, tsotra sy mahery." },
    { id: "basy_vava", label: "Basy vava", icon: "🔥", desc: "Miteny mivantana, be hery, tsy misy fihatsarambelatsihy." },
  ],

  renderParametres() {
    const el = document.getElementById("profilContent");
    const currentTone = DATA.state.settings.tone || "simple";
    el.innerHTML = `
      ${this.backButton()}
      <div class="page-header fade-in"><h2>Paramètres</h2></div>
      <section class="section fade-in card">
        <p>Ville : ${DATA.state.settings.city}</p>
        <p>Devise : ${DATA.state.settings.currency}</p>
      </section>
      <section class="section fade-in">
        <h3 class="section-title">🗣️ Fomba fitenenana</h3>
        <p class="muted small">Safidio ny endriky ny hafatra sy ny tenin'ny appli.</p>
        <div class="tone-list">
          ${this.TONE_OPTIONS.map((t) => `
            <label class="tone-row${t.id === currentTone ? " tone-row-active" : ""}">
              <input type="radio" name="appTone" value="${t.id}" ${t.id === currentTone ? "checked" : ""}>
              <span class="tone-icon">${t.icon}</span>
              <span class="tone-text">
                <span class="tone-label">${t.label}</span>
                <span class="tone-desc">${t.desc}</span>
              </span>
            </label>
          `).join("")}
        </div>
      </section>
      <section class="section fade-in">
        <button class="btn btn-primary btn-block" id="addLaokaBtn">➕ Ajouter un laoka</button>
        <button class="btn btn-secondary btn-block" id="roMazavaBtn" style="margin-top:10px;">🍲 Ro mazava</button>
        <button class="btn btn-secondary btn-block" id="fetyParamBtn" style="margin-top:10px;">🎉 Fety (fêtes et grandes occasions)</button>
      </section>
      <section class="section fade-in">
        <button class="btn btn-danger btn-block" id="resetBtn">Réinitialiser les données demo</button>
      </section>
    `;
    this.bindBack();
    el.querySelectorAll("input[name='appTone']").forEach((r) => {
      r.addEventListener("change", () => {
        DATA.state.settings.tone = r.value;
        DATA.saveData();
        UI.toast("Fomba fitenenana voaraikitra.");
        this.renderParametres();
      });
    });
    document.getElementById("addLaokaBtn").addEventListener("click", () => LAOKA_FORM_UI.render());
    document.getElementById("roMazavaBtn").addEventListener("click", () => RO_MAZAVA_UI.render());
    document.getElementById("fetyParamBtn").addEventListener("click", () => {
      FETY_UI.state.occasion = null;
      FETY_UI.render();
    });
    document.getElementById("resetBtn").addEventListener("click", () => {
      UI.openModal(`
        <div class="modal-header"><h2>Confirmation</h2></div>
        <p>Hamafa daholo ny angona ary hiverina amin'ny toe-javatra demo voalohany. Tsy azo averina intsony ity fihetsika ity. Tohizana?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="resetNo">Tsia</button>
          <button class="btn btn-danger" id="resetYes">Eny, hamafa</button>
        </div>
      `);
      document.getElementById("resetNo").addEventListener("click", () => UI.closeModal());
      document.getElementById("resetYes").addEventListener("click", () => {
        DATA.resetToDemo(true);
        UI.closeModal();
        UI.renderExpiryBadge();
        this.renderMenu();
        UI.showScreen("home");
        UI.toast("Angona demo naverina tamin'ny voalohany.");
      });
    });
  },

  /* ------------------- HISTORIQUE ------------------- */
  renderHistorique() {
    const el = document.getElementById("profilContent");
    const sorted = [...DATA.state.history].sort((a, b) => b.date.localeCompare(a.date));

    el.innerHTML = `
      ${this.backButton()}
      <div class="page-header fade-in"><h2>Ny nohaniko</h2></div>
      <div class="timeline fade-in">
        ${
          sorted.length === 0
            ? `<div class="card empty-state"><p>Mbola tsy misy tantara.</p></div>`
            : sorted.map((h) => `
              <div class="timeline-item">
                <div class="timeline-date">${TSOPITRA_UI.formatDate(h.date)}</div>
                <div class="timeline-label">${h.label}</div>
                <button class="btn btn-tertiary btn-sm" data-recipe="${h.recipeId}">Rechoisir</button>
              </div>
            `).join("")
        }
      </div>
    `;
    this.bindBack();
    el.querySelectorAll("[data-recipe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const recipeId = btn.dataset.recipe;
        const recipe = DATA.getRecipe(recipeId);
        if (!recipe) return;
        const repetitionMessage = HISTORY.getRepetitionMessage(recipeId);
        if (repetitionMessage) {
          UI.openModal(`
            <div class="modal-header"><h2>${recipe.name}</h2></div>
            <p>${repetitionMessage.message}</p>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="repeatChange">Andao hova</button>
              <button class="btn btn-primary" id="repeatSame">Atao ihany</button>
            </div>
          `);
          document.getElementById("repeatChange").addEventListener("click", () => {
            UI.closeModal();
            UI.openSearchForm();
          });
          document.getElementById("repeatSame").addEventListener("click", () => {
            UI.closeModal();
            const cost = CALC.calculateRecipeCost(recipe, DATA.state.pantry);
            const result = { recipe, cost, scaledToBuy: cost.totalToBuy, scaledConsumption: cost.totalConsumption, overBudget: false, reasons: [], repetitionMessage: null };
            UI.cookRecipe(result);
          });
        } else {
          const cost = CALC.calculateRecipeCost(recipe, DATA.state.pantry);
          const result = { recipe, cost, scaledToBuy: cost.totalToBuy, scaledConsumption: cost.totalConsumption, overBudget: false, reasons: [], repetitionMessage: null };
          UI.cookRecipe(result);
        }
      });
    });
  },
};
