/* ============================================================
   LAOKA — ui.js
   SECTION: UI — rendu des écrans, navigation, event listeners
   ============================================================ */

const UI = {
  state: {
    currentScreen: "home",
    searchFilters: { budget: 3000, people: 4, mealTime: null, laokaType: null, trondroState: null, dishSubCategory: null, includeAchard: false, searchQuery: "" },
    lastResults: [],
    // "dashboard" (par défaut) ou "results" — quel contenu afficher dans l'onglet Laoka
    // (voir _applyScreen) : le dashboard de cadres est l'écran par défaut, les résultats de
    // recherche ne s'affichent qu'après un runSearch() explicite dans la session.
    laokaView: "dashboard",
  },

  /* ------------------- INIT ------------------- */
  init() {
    DATA.loadData();
    this.bindNav();
    this.bindGlobalModalClose();
    this.bindBackNavigation();
    this.renderHome();
    // Première entrée d'historique : remplace (et ne pousse pas), pour que
    // l'écran d'accueil reste "au fond" — un retour depuis l'accueil doit
    // quitter l'app, jamais depuis un écran/modal intermédiaire.
    history.replaceState({ screen: "home", modal: false }, "");
    this._applyScreen("home");
    this.renderExpiryBadge();
  },

  /* ------------------- NAVIGATION ------------------- */
  bindNav() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const screen = btn.dataset.screen;
        this.showScreen(screen);
      });
    });
    document.getElementById("adminAccessBtn").addEventListener("click", () => {
      this.showScreen("admin");
      ADMIN.render();
    });
    document.getElementById("backToAppBtn").addEventListener("click", () => {
      this.showScreen("home");
    });
  },

  /* ------------------- HISTORIQUE / BOUTON RETOUR -------------------
     L'app est une SPA pure : aucune navigation "logique" (changement d'onglet,
     ouverture de modal) ne modifiait l'historique du navigateur. Résultat :
     le bouton retour Android (physique ou geste) n'avait rien vers quoi
     revenir, donc le système fermait directement l'app.
     Principe : chaque navigation pousse une entrée d'historique ; popstate
     restaure l'état précédent sans jamais repousser une nouvelle entrée
     (sinon on boucle). Un modal ouvert compte comme un niveau à part entière :
     retour = ferme le modal d'abord, PUIS revient à l'écran précédent.

     Important : popstate est asynchrone (surtout après history.back()), donc
     on ne peut PAS s'appuyer dessus comme unique déclencheur de la fermeture
     DOM du modal — plusieurs endroits du code enchaînent closeModal() puis
     immédiatement une autre action (ex. ouvrir un nouveau modal) de façon
     synchrone. closeModal()/showScreen() font donc le travail DOM tout de
     suite ; popstate ne fait que "rattraper" l'état pour rester cohérent
     avec ce qui est déjà affiché (idempotent si déjà à jour). */
  bindBackNavigation() {
    window.addEventListener("popstate", (e) => {
      const s = (e.state && typeof e.state === "object") ? e.state : { screen: "home", modal: false };
      if (!s.modal && this._modalOpen) {
        this._applyModalClosed();
      }
      if (s.screen && s.screen !== this.state.currentScreen) {
        this._applyScreen(s.screen);
      }
    });
  },

  /* Change l'écran visible SANS toucher à l'historique — utilisé par le
     popstate handler (l'historique a déjà été mis à jour par le navigateur)
     et par init() pour l'état initial. */
  _applyScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById("screen-" + name);
    if (target) target.classList.add("active");
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.screen === name));
    this.state.currentScreen = name;

    if (name === "home") this.renderHome();
    // "laoka" : tableau de bord par défaut (cadres) tant qu'aucune recherche n'a été lancée dans
    // cette session ; une fois une recherche effectuée, on réaffiche les derniers résultats en
    // revenant sur l'onglet (comportement inchangé), sauf action explicite de retour au dashboard.
    if (name === "laoka") {
      if (this.state.laokaView === "results" && this.state.lastResults) {
        this.renderResultsScreen(this.state.lastResults);
      } else {
        this.renderLaokaDashboard();
      }
    }
    if (name === "tsopitra") TSOPITRA_UI.render();
    if (name === "courses") COURSES_UI.render();
    if (name === "profil") PROFIL_UI.render();
    window.scrollTo(0, 0);
  },

  /* Ferme le modal au niveau DOM seulement, sans toucher à l'historique
     (utilisé par le popstate handler, qui a déjà dépilé l'entrée). */
  _applyModalClosed() {
    document.getElementById("modalOverlay").classList.remove("active");
    document.getElementById("modalContent").innerHTML = "";
    this._modalOpen = false;
  },

  showScreen(name) {
    // Si un modal est ouvert, on le referme d'abord au niveau DOM : changer
    // d'onglet doit aussi fermer un modal ouvert par-dessus.
    const hadModal = this._modalOpen;
    this._applyModalClosed();
    this._applyScreen(name);
    // On ne pousse une entrée que si on change vraiment d'écran ou qu'on
    // vient de fermer un modal — évite d'empiler des entrées identiques
    // quand showScreen(name) est appelé plusieurs fois sur le même écran.
    if (name !== history.state?.screen || hadModal || history.state?.modal) {
      history.pushState({ screen: name, modal: false }, "");
    }
  },

  bindGlobalModalClose() {
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") this.closeModal();
    });
  },

  openModal(html) {
    const overlay = document.getElementById("modalOverlay");
    const content = document.getElementById("modalContent");
    content.innerHTML = html;
    overlay.classList.add("active");
    this._modalOpen = true;
    history.pushState({ screen: this.state.currentScreen, modal: true }, "");
  },
  closeModal() {
    // Travail DOM immédiat et synchrone : plusieurs appelants enchaînent
    // closeModal() puis, dans la même tâche, une autre action (ex. ouvrir un
    // nouveau modal juste après — voir ui-profil.js "Andao hova"). On utilise
    // donc replaceState (synchrone, ne déclenche PAS popstate) plutôt que
    // history.back() (asynchrone) pour ne jamais risquer d'empiler une
    // entrée sur un état d'historique pas encore "retombé".
    this._applyModalClosed();
    if (history.state && history.state.modal) {
      history.replaceState({ screen: this.state.currentScreen, modal: false }, "");
    }
  },

  toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  },

  renderExpiryBadge() {
    const items = STOCK.getItemsToUseSoon();
    const badge = document.getElementById("tsopitraBadge");
    if (items.length > 0) {
      badge.textContent = items.length;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  },

  /* ------------------- ACCUEIL ------------------- */
  renderHome() {
    const el = document.getElementById("screen-home");
    const suggestion = RECO.getTodaySuggestion();
    const soonItems = STOCK.getItemsToUseSoon();

    el.innerHTML = `
      <div class="hero card fade-in">
        <h1 class="hero-title">Inona no hataoko androany?</h1>
        <p class="hero-sub">Lazao ny budget-nao, firy ianareo, ary izay ao an-tsopitra.</p>
        <button class="btn btn-primary btn-block" id="btnHitadyLaoka">🔎 Hitady laoka</button>
      </div>

      <div class="moment-cards fade-in">
        <button class="moment-card" data-moment="maraina"><span class="moment-icon">🌅</span><span>Maraina</span></button>
        <button class="moment-card" data-moment="atoandro"><span class="moment-icon">☀️</span><span>Atoandro</span></button>
        <button class="moment-card" data-moment="hariva"><span class="moment-icon">🌙</span><span>Hariva</span></button>
      </div>

      ${
        soonItems.length > 0
          ? `<div class="card alert-card fade-in">
              <div class="alert-card-title">⚠️ Aza avela ho very</div>
              <p>Misy ${soonItems.map((i) => (DATA.getProduct(i.productId) || {}).name || "").join(", ")} mila ampiasaina izao.</p>
              <button class="btn btn-secondary btn-block" id="btnUseSoonItems">Mitady laoka amin'izany</button>
            </div>`
          : ""
      }

      <section class="section fade-in">
        <h2 class="section-title">Laoka anio</h2>
        ${suggestion ? this.recipeCardHTML(suggestion, { compact: true }) : `<p class="muted">Tsy misy tolotra amin'izao fotoana izao.</p>`}
      </section>
    `;

    document.getElementById("btnHitadyLaoka").addEventListener("click", () => this.openSearchForm());
    el.querySelectorAll(".moment-card").forEach((btn) => {
      btn.addEventListener("click", () => this.openSearchForm({ mealTime: btn.dataset.moment }));
    });
    const soonBtn = document.getElementById("btnUseSoonItems");
    if (soonBtn) soonBtn.addEventListener("click", () => this.openSearchForm());

    if (suggestion) {
      const jereoBtn = el.querySelector(".recipe-card [data-action='view']");
      if (jereoBtn) jereoBtn.addEventListener("click", () => this.openRecipeDetail(suggestion));
    }
  },

  /* ------------------- DASHBOARD LAOKA (écran par défaut, cadres) -------------------
     Remplace l'ancien écran vide de l'onglet "Laoka" : dès l'ouverture, avant toute recherche,
     un tableau de bord de cadres cliquables est affiché (Rony/Ritra/Endasina/Ketsaketsa/
     Vidin'entana/Bébé/Goûter). Le formulaire de recherche (openSearchForm) reste accessible via
     un bouton dédié, mais n'est plus l'unique point d'entrée de l'onglet. */
  LAOKA_DASHBOARD_FRAMES: [
    { key: "rony", icon: "🍲", label: "Rony", kind: "dishSubCategory", value: "rony" },
    { key: "ritra", icon: "🍛", label: "Ritra", kind: "dishSubCategory", value: "ritra" },
    { key: "endasina", icon: "🔥", label: "Endasina", kind: "cookingMode", value: "ENDASINA" },
    { key: "ketsaketsa", icon: "🥘", label: "Ketsaketsa", kind: "dishSubCategory", value: "ketsaketsa" },
    { key: "bebe", icon: "🍼", label: "Bébé", kind: "dishSubCategory", value: "bebe" },
    { key: "gouter", icon: "🌮", label: "Goûter", kind: "dishSubCategory", value: "gouter" },
  ],

  /** Recettes correspondant à un cadre du dashboard : soit par dishSubCategory, soit (Endasina)
   *  par mode de cuisson (type/cookingMethod), relié à DISH_COOKING_MODES comme demandé. */
  recipesForFrame(frame) {
    const recipes = DATA.state.recipes || [];
    if (frame.kind === "cookingMode") {
      return recipes.filter((r) => r.type === frame.value || r.cookingMethod === frame.value);
    }
    return recipes.filter((r) => r.dishSubCategory === frame.value);
  },

  renderLaokaDashboard() {
    const el = document.getElementById("screen-laoka");
    const frameCounts = this.LAOKA_DASHBOARD_FRAMES.map((f) => ({ ...f, count: this.recipesForFrame(f).length }));
    const manualProducts = (DATA.state.products || []).filter((p) => p.isIndicativePrice === false);

    el.innerHTML = `
      <div class="page-header fade-in">
        <h2>Laoka</h2>
        <p class="muted">Safidio ny sokajy, na mitadiava manokana.</p>
      </div>

      <button class="laoka-dash-search fade-in" id="btnDashSearch" type="button">
        <span>🔎 Hitady laoka manokana (budget, isan'olona...)</span>
        <span>›</span>
      </button>

      <div class="laoka-frames-grid fade-in">
        ${frameCounts.map((f) => `
          <button class="laoka-frame-card" type="button" data-frame="${f.key}">
            <span class="laoka-frame-icon">${f.icon}</span>
            <span class="laoka-frame-title">${f.label}</span>
            <span class="laoka-frame-count">${f.count} laoka</span>
          </button>
        `).join("")}
        <button class="laoka-frame-card wide" type="button" data-frame="vidinentana">
          <span class="laoka-frame-icon">🏷️</span>
          <span>
            <span class="laoka-frame-title">Vidin'entana</span><br>
            <span class="laoka-frame-count">${manualProducts.length} entana voarakitra</span>
          </span>
        </button>
      </div>
    `;

    document.getElementById("btnDashSearch").addEventListener("click", () => this.openSearchForm());
    el.querySelectorAll("[data-frame]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.frame;
        if (key === "vidinentana") {
          this.openVidinEntanaFrame();
        } else {
          const frame = this.LAOKA_DASHBOARD_FRAMES.find((f) => f.key === key);
          if (frame) this.openDashboardFrame(frame);
        }
      });
    });
  },

  /** Écran de détail d'un cadre (Rony/Ritra/Endasina/Ketsaketsa/Bébé/Goûter) : recettes groupées
   *  par ingrédient principal (légumes, anana, voamaina, voalena, trondro...), plats sans viande
   *  d'abord puis avec viande ensuite (RECO.groupRecipesForDashboard). Chaque recette reste
   *  modifiable via Admin (bouton crayon -> ADMIN.editRecipe, réutilise LAOKA_FORM_UI existant). */
  openDashboardFrame(frame) {
    const el = document.getElementById("screen-laoka");
    const recipes = this.recipesForFrame(frame);
    const groups = RECO.groupRecipesForDashboard(recipes);

    el.innerHTML = `
      <div class="laoka-frame-detail-header fade-in">
        <button class="btn-back" id="btnFrameBack">← Retour</button>
      </div>
      <div class="page-header fade-in" style="margin-top:0;">
        <h2>${frame.icon} ${frame.label}</h2>
      </div>
      <div id="frameGroupsList" class="fade-in">
        ${
          groups.length === 0
            ? `<div class="card empty-state"><p>Tsy mbola misy laoka ao amin'ity sokajy ity.</p></div>`
            : groups.map((g) => `
                <h3 class="laoka-frame-group-title">${g.label}</h3>
                ${g.recipes.map((r) => this.dashboardMiniCardHTML(r)).join("")}
              `).join("")
        }
      </div>
    `;
    document.getElementById("btnFrameBack").addEventListener("click", () => this.renderLaokaDashboard());

    const listEl = document.getElementById("frameGroupsList");
    if (listEl) {
      listEl.querySelectorAll("[data-action='view']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").dataset.id;
          const recipe = DATA.getRecipe(id);
          if (recipe) this.openRecipeDetail(this.wrapRecipeAsResult(recipe));
        });
      });
      listEl.querySelectorAll("[data-action='edit']").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.closest("[data-id]").dataset.id;
          // Réutilise directement Admin > Recettes (aucune duplication de logique d'édition) :
          // ADMIN.editRecipe encapsule déjà LAOKA_FORM_UI.startEdit.
          ADMIN.editRecipe(id);
        });
      });
    }
  },

  dashboardMiniCardHTML(recipe) {
    const meatTag = RECO.recipeHasMeat(recipe) ? "🍖" : "🌿";
    return `
      <div class="laoka-mini-card" data-id="${recipe.id}" data-action="view">
        <span class="laoka-mini-photo">${recipe.photo || "🍽️"}</span>
        <span class="laoka-mini-info">
          <span class="laoka-mini-name">${meatTag} ${recipe.name}</span>
          <span class="laoka-mini-meta">⏱️ ${recipe.time} min · 👥 ${recipe.servings}</span>
        </span>
        <button class="laoka-mini-edit" data-action="edit" title="Modifier" aria-label="Modifier">✏️</button>
      </div>
    `;
  },

  /** Construit un objet résultat { recipe, cost } compatible avec openRecipeDetail/cookRecipe,
   *  pour une recette ouverte directement depuis le dashboard (hors moteur de recherche RECO).
   *  people (optionnel) : nombre de personnes pour lequel calculer le prix — si absent, utilise
   *  recipe.servings (comportement historique, aucun scaling). */
  wrapRecipeAsResult(recipe, people) {
    const targetPeople = people || recipe.servings;
    const cost = CALC.calculateRecipeCost(recipe, DATA.state.pantry, targetPeople);
    const scaledToBuy = RECO.scaleCostForServings(cost.scalableToBuy, recipe.servings, targetPeople) + cost.forfaitToBuy;
    const scaledConsumption = RECO.scaleCostForServings(cost.scalableConsumption, recipe.servings, targetPeople) + cost.forfaitConsumption;
    return { recipe, cost, scaledToBuy, scaledConsumption, people: targetPeople };
  },

  /** Cadre "Vidin'entana" : liste des produits ajoutés manuellement via Admin > Produits
   *  (isIndicativePrice: false), avec leur prix — pas les recettes. */
  openVidinEntanaFrame() {
    const el = document.getElementById("screen-laoka");
    const products = (DATA.state.products || []).filter((p) => p.isIndicativePrice === false);

    el.innerHTML = `
      <div class="laoka-frame-detail-header fade-in">
        <button class="btn-back" id="btnFrameBack">← Retour</button>
      </div>
      <div class="page-header fade-in" style="margin-top:0;">
        <h2>🏷️ Vidin'entana</h2>
        <p class="muted">Entana nampidirina manokana tao amin'ny Paramètres > Produits.</p>
      </div>
      <div class="card fade-in">
        ${
          products.length === 0
            ? `<p class="muted">Mbola tsy misy entana nampidirina manokana. Ampio ao amin'ny Paramètres > Produits.</p>`
            : products.map((p) => `
                <div class="laoka-price-list-item">
                  <span class="laoka-price-list-name">${p.name}</span>
                  <span class="laoka-price-list-value">${CALC.formatAr(p.basePrice)} / ${UNIT_LABELS[p.unit] || p.unit}</span>
                </div>
              `).join("")
        }
      </div>
    `;
    document.getElementById("btnFrameBack").addEventListener("click", () => this.renderLaokaDashboard());
  },

  /* ------------------- FORMULAIRE DE RECHERCHE ------------------- */
  openSearchForm(preset = {}) {
    this.state.searchFilters = { ...this.state.searchFilters, ...preset };
    const f = this.state.searchFilters;

    const html = `
      <div class="modal-header">
        <h2>Inona no hataoko?</h2>
        <button class="modal-close" id="closeSearchModal" aria-label="Hidiy">✕</button>
      </div>
      <form id="searchForm" class="form">
        <div class="field">
          <label for="fBudget">Budget</label>
          <div class="input-suffix">
            <input type="number" id="fBudget" min="0" step="100" value="${f.budget || 3000}" required aria-describedby="budgetErr">
            <span class="suffix">Ar</span>
          </div>
          <div class="field-error hidden" id="budgetErr">Tsy azo atao ny budget latsaka zero.</div>
        </div>

        <div class="field">
          <label for="fFoodSearch">Sakafo tadiavina</label>
          <input type="search" id="fFoodSearch" value="${f.searchQuery || ""}" placeholder="ex : henan'omby, ovy, trondro, anana" autocomplete="off">
          <p class="muted small">Mitadiava akora na sakafo iray: ny valiny dia ahitana ny laoka rehetra mitambatra amin'io sakafo io, araka ny budget-nao.</p>
        </div>

        <div class="field">
          <label for="fPeople">Isan'olona</label>
          <select id="fPeople">
            ${[1,2,3,4,5,6,7,8,9,10].map((n) => `<option value="${n}" ${f.people===n?"selected":""}>${n}</option>`).join("")}
            <option value="more" ${f.people==="more"?"selected":""}>10+ / Danin'ny kibo</option>
          </select>
        </div>
        <div class="field hidden" id="fPeopleMoreWrap">
          <label for="fPeopleMore">Isa marina</label>
          <input type="number" id="fPeopleMore" min="11" value="15">
        </div>

        <div class="field">
          <label>Fotoana</label>
          <div class="choice-row">
            <button type="button" class="choice-btn ${f.mealTime==="maraina"?"active":""}" data-value="maraina">Maraina</button>
            <button type="button" class="choice-btn ${f.mealTime==="atoandro"?"active":""}" data-value="atoandro">Atoandro</button>
            <button type="button" class="choice-btn ${f.mealTime==="hariva"?"active":""}" data-value="hariva">Hariva</button>
          </div>
        </div>

        <div class="field">
          <label>Sokajin-tsakafo (fikarohana ampahibemaso)</label>
          <div class="choice-grid" id="fDishSubCategoryWrap">
            <button type="button" class="choice-chip ${!f.dishSubCategory?"active":""}" data-value="">Jiaby</button>
            ${DISH_CATEGORIES_SEARCH.map((c) => `<button type="button" class="choice-chip ${f.dishSubCategory===c?"active":""}" data-value="${c}">${DISH_CATEGORY_LABELS[c]}</button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label>Karazana laoka</label>
          <div class="choice-grid" id="fLaokaTypeWrap">
            ${LAOKA_KIND.map((t) => `<button type="button" class="choice-chip ${f.laokaType===t?"active":""}" data-value="${t}">${LAOKA_KIND_LABELS[t]}</button>`).join("")}
          </div>
        </div>

        <div class="field hidden" id="fTrondroStateWrap">
          <label>Trondro — maina (sec) sa lena (frais) ?</label>
          <div class="choice-row">
            ${TRONDRO_STATES.map((s) => `<button type="button" class="choice-btn ${f.trondroState===s?"active":""}" data-value="${s}">${TRONDRO_STATE_LABELS[s]}</button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label class="toggle-row">
            <span>🥗 Inclure les achards (légumes marinés/crus)</span>
            <input type="checkbox" id="fIncludeAchard" ${f.includeAchard ? "checked" : ""}>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Hitady</button>
      </form>
    `;
    this.openModal(html);
    document.getElementById("closeSearchModal").addEventListener("click", () => this.closeModal());

    const peopleSelect = document.getElementById("fPeople");
    const moreWrap = document.getElementById("fPeopleMoreWrap");
    moreWrap.classList.toggle("hidden", peopleSelect.value !== "more");
    peopleSelect.addEventListener("change", () => {
      moreWrap.classList.toggle("hidden", peopleSelect.value !== "more");
    });

    let selectedMoment = f.mealTime || null;
    document.querySelectorAll("#searchForm .choice-row .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const already = btn.classList.contains("active");
        document.querySelectorAll("#searchForm .choice-row .choice-btn").forEach((b) => b.classList.remove("active"));
        if (!already) {
          btn.classList.add("active");
          selectedMoment = btn.dataset.value;
        } else {
          selectedMoment = null;
        }
      });
    });

    let selectedType = f.laokaType || null;
    let selectedTrondroState = f.trondroState || null;
    const trondroStateWrap = document.getElementById("fTrondroStateWrap");
    // Sous-filtre maina/lena pertinent pour les deux groupes poisson (audit prompt 1/4 :
    // TRONDRO générique remplacé par HAZANDRANO/HAZANDRANOMASINA distincts).
    const isFishKind = (t) => t === "HAZANDRANO" || t === "HAZANDRANOMASINA";
    trondroStateWrap.classList.toggle("hidden", !isFishKind(selectedType));

    document.querySelectorAll("#fLaokaTypeWrap .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const already = btn.classList.contains("active");
        document.querySelectorAll("#fLaokaTypeWrap .choice-chip").forEach((b) => b.classList.remove("active"));
        if (!already) {
          btn.classList.add("active");
          selectedType = btn.dataset.value;
        } else {
          selectedType = null;
        }
        trondroStateWrap.classList.toggle("hidden", !isFishKind(selectedType));
        if (!isFishKind(selectedType)) {
          selectedTrondroState = null;
          document.querySelectorAll("#fTrondroStateWrap .choice-btn").forEach((b) => b.classList.remove("active"));
        }
      });
    });

    document.querySelectorAll("#fTrondroStateWrap .choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const already = btn.classList.contains("active");
        document.querySelectorAll("#fTrondroStateWrap .choice-btn").forEach((b) => b.classList.remove("active"));
        selectedTrondroState = already ? null : btn.dataset.value;
        if (!already) btn.classList.add("active");
      });
    });

    let selectedDishSubCategory = f.dishSubCategory || null;
    document.querySelectorAll("#fDishSubCategoryWrap .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#fDishSubCategoryWrap .choice-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedDishSubCategory = btn.dataset.value || null;
      });
    });

    document.getElementById("searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const budget = Number(document.getElementById("fBudget").value);
      const budgetErr = document.getElementById("budgetErr");
      if (!budget || budget <= 0) {
        budgetErr.classList.remove("hidden");
        return;
      }
      budgetErr.classList.add("hidden");

      let people = peopleSelect.value === "more" ? Number(document.getElementById("fPeopleMore").value) : Number(peopleSelect.value);
      if (!people || people <= 0) people = 1;

      const includeAchard = document.getElementById("fIncludeAchard").checked;
      const searchQuery = (document.getElementById("fFoodSearch").value || "").trim();
      this.state.searchFilters = { budget, people, mealTime: selectedMoment, laokaType: selectedType, trondroState: isFishKind(selectedType) ? selectedTrondroState : null, dishSubCategory: selectedDishSubCategory, includeAchard, searchQuery };
      this.closeModal();
      this.runSearch();
    });
  },

  /* ------------------- RÉSULTATS ------------------- */
  runSearch() {
    const f = this.state.searchFilters || {};
    const query = (f.searchQuery || "").trim();
    if (!query) {
      const results = RECO.getRecommendations(f);
      this.state.lastResults = results;
      this.state.laokaView = "results";
      this.renderResultsScreen(results);
      this.showScreen("laoka");
      return;
    }

    const normalize = (value) => String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[’']/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    const allRecipes = [
      ...(Array.isArray(DATA.state.recipes) ? DATA.state.recipes : []),
      ...(Array.isArray(DATA.state.roMazavaRecipes) ? DATA.state.roMazavaRecipes : [])
    ];
    const unique = new Map();
    allRecipes.forEach((r) => { if (r && r.id) unique.set(r.id, r); });

    const matchesQuery = (recipe) => {
      const productNames = (recipe.ingredients || []).map((ing) => {
        const p = DATA.getProduct(ing.productId);
        return p ? p.name : "";
      });
      const haystack = normalize([recipe.name, recipe.dishSubCategory, recipe.type, ...productNames].join(" "));
      return tokens.every((token) => haystack.includes(token));
    };
    const matchesFilters = (recipe) => {
      if (f.dishSubCategory && recipe.dishSubCategory !== f.dishSubCategory) return false;
      if (f.mealTime && Array.isArray(recipe.moment) && recipe.moment.length && !recipe.moment.includes(f.mealTime)) return false;
      return true;
    };

    const results = [];
    unique.forEach((recipe) => {
      if (!matchesQuery(recipe) || !matchesFilters(recipe)) return;
      const wrapped = this.wrapRecipeAsResult(recipe, f.people);
      const remaining = Number(f.budget || 0) - Number(wrapped.scaledToBuy || 0);
      results.push({ ...wrapped, requestedPeople: f.people, people: f.people, overBudget: remaining < 0, reasons: remaining < 0 ? [`Budget dépassé de ${Math.abs(remaining)} Ar`] : [], repetitionMessage: null, budgetAdjusted: false });
    });

    results.sort((a, b) => {
      if (a.overBudget !== b.overBudget) return a.overBudget ? 1 : -1;
      return (a.scaledToBuy || 0) - (b.scaledToBuy || 0);
    });
    this.state.lastResults = results;
    this.state.laokaView = "results";
    this.renderResultsScreen(results);
    this.showScreen("laoka");
  },

  /** Retour au tableau de bord par défaut de l'onglet Laoka (cadres), depuis l'écran de résultats. */
  backToLaokaDashboard() {
    this.state.laokaView = "dashboard";
    this.renderLaokaDashboard();
  },

  renderResultsScreen(results) {
    const f = this.state.searchFilters;
    const el = document.getElementById("screen-laoka");
    el.innerHTML = `
      <div class="results-header fade-in">
        <button class="btn-back" id="btnBackToDashboard">← Retour</button>
        <h2>Ireto no mety aminao</h2>
        <div class="results-meta">
          <span>💰 ${CALC.formatAr(f.budget)}</span>
          <span>👥 ${f.people}</span>
          ${f.searchQuery ? `<span>🔎 ${f.searchQuery}</span>` : ""}
          ${f.mealTime ? `<span>${this.momentLabel(f.mealTime)}</span>` : ""}
          ${f.dishSubCategory ? `<span>${DISH_CATEGORY_LABELS[f.dishSubCategory] || f.dishSubCategory}</span>` : ""}
        </div>
        <button class="btn btn-secondary btn-block" id="btnNewSearch">Ovaina ny fikarohana</button>
      </div>
      <div class="results-list" id="resultsList"></div>
    `;
    document.getElementById("btnNewSearch").addEventListener("click", () => this.openSearchForm());
    document.getElementById("btnBackToDashboard").addEventListener("click", () => this.backToLaokaDashboard());

    const list = document.getElementById("resultsList");
    if (results.length === 0) {
      list.innerHTML = `<div class="card empty-state"><p>Tsy nahitana laoka mifanaraka. Andao ovaina ny sivana.</p></div>`;
      return;
    }

    // Regroupement par sous-catégorie de laoka (prompt 3) : uniquement quand aucun filtre de
    // catégorie précis n'a été choisi par l'utilisateur — sinon les résultats sont déjà d'une
    // seule catégorie et un regroupement n'apporterait rien.
    // renderOrder garde la correspondance carte DOM <-> objet résultat, y compris avec les <h3>
    // de groupe intercalés (querySelectorAll(".recipe-card") ignore les <h3>, donc l'ordre reste aligné).
    let renderOrder = results;
    if (!f.dishSubCategory) {
      const groups = {};
      results.forEach((r) => {
        const key = r.recipe.dishSubCategory || "laoka_classique";
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
      });
      const orderedKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
      renderOrder = [];
      orderedKeys.forEach((key) => {
        list.insertAdjacentHTML("beforeend", `<h3 class="section-title" style="margin-top:18px;">${DISH_CATEGORY_LABELS[key] || key}</h3>`);
        groups[key].forEach((r) => {
          list.insertAdjacentHTML("beforeend", this.recipeCardHTML(r));
          renderOrder.push(r);
        });
      });
    } else {
      results.forEach((r) => {
        list.insertAdjacentHTML("beforeend", this.recipeCardHTML(r));
      });
    }

    // Bind card actions — renderOrder[idx] correspond exactement à la idx-ième .recipe-card du DOM
    list.querySelectorAll(".recipe-card").forEach((card, idx) => {
      const r = renderOrder[idx];
      const viewBtn = card.querySelector("[data-action='view']");
      const cookBtn = card.querySelector("[data-action='cook']");
      const addBtn = card.querySelector("[data-action='addcourses']");
      if (viewBtn) viewBtn.addEventListener("click", () => this.openRecipeDetail(r));
      if (cookBtn) cookBtn.addEventListener("click", () => this.cookRecipe(r));
      if (addBtn) addBtn.addEventListener("click", () => this.addRecipeToShoppingList(r));
    });
  },

  momentLabel(m) {
    return { maraina: "🌅 Maraina", atoandro: "☀️ Atoandro", hariva: "🌙 Hariva" }[m] || m;
  },

  /* ------------------- CARTE RECETTE ------------------- */
  recipeCardHTML(result, opts = {}) {
    const { recipe, scaledToBuy, scaledConsumption, overBudget, reasons, repetitionMessage, budgetAdjusted, people, requestedPeople } = result;
    const f = this.state.searchFilters;
    const budgetRemaining = f.budget ? f.budget - scaledToBuy : null;
    const warningPairs = RECO.getWarningPairs(recipe);

    return `
      <div class="card recipe-card fade-in">
        <div class="recipe-card-top">
          <div class="recipe-photo">${recipe.photo}</div>
          <div class="recipe-info">
            <h3>${recipe.name}</h3>
            <div class="recipe-meta">
              <span class="tag">${recipe.type}</span>
              <span>⏱️ ${recipe.time} min</span>
              <span>👥 ${people || requestedPeople || recipe.servings}</span>
            </div>
          </div>
        </div>

        <div class="recipe-price-row">
          <div class="price-block">
            <span class="price-label">Montant à dépenser</span>
            <span class="price-value">${CALC.formatAr(scaledToBuy)}</span>
          </div>
          ${
            budgetRemaining !== null
              ? `<div class="price-block ${budgetRemaining < 0 ? "over" : ""}">
                  <span class="price-label">Budget restant</span>
                  <span class="price-value">${CALC.formatAr(budgetRemaining)}</span>
                </div>`
              : ""
          }
        </div>

        ${budgetAdjusted ? `<p class="muted small">Habetsany voatsipika mba hifanaraka amin'ny budget-nao (ho an'olona ${people}).</p>` : ""}
        ${overBudget ? `<div class="warning-banner">Tsy ampy ${CALC.formatAr(Math.abs(budgetRemaining))} ny budget-nao amin'ity laoka ity.</div>` : ""}
        ${warningPairs.length ? `<div class="warning-banner">Raha izaho ianao, tsy manao an'izany aho. Tsy dia mifanaraka ireo akora ireo.</div>` : ""}
        ${
          repetitionMessage
            ? `<div class="info-banner">${repetitionMessage.message}</div>`
            : ""
        }

        <div class="recipe-lists">
          <div class="recipe-list-col">
            <div class="list-title">🏠 Efa ao an-trano</div>
            ${result.cost.haveList.length ? result.cost.haveList.map((i) => `<div class="list-item">${i.name}</div>`).join("") : `<div class="list-item muted">—</div>`}
          </div>
          <div class="recipe-list-col">
            <div class="list-title">🛒 Hovidiana</div>
            ${result.cost.buyList.length ? result.cost.buyList.map((i) => `<div class="list-item">${i.name}</div>`).join("") : `<div class="list-item muted">—</div>`}
          </div>
        </div>

        ${!opts.compact ? `<div class="recipe-actions">
          <button class="btn btn-secondary" data-action="view">Voir la fomba fanaovana</button>
          <button class="btn btn-primary" data-action="cook">Atao anio</button>
          <button class="btn btn-tertiary" data-action="addcourses">+ Courses</button>
        </div>` : `<button class="btn btn-primary btn-block" data-action="view">Jereo</button>`}
      </div>
    `;
  },

  openRecipeDetail(result) {
    const { recipe, cost } = result;
    // Correction bug "nombre de personnes figé" : on affiche le nombre de personnes réellement
    // recherché (result.people, ou searchFilters.people en secours), pas recipe.servings qui est
    // la base de la recette et ne reflète jamais la recherche de l'utilisateur.
    const displayPeople = result.people || (this.state && this.state.searchFilters && this.state.searchFilters.people) || recipe.servings;
    // Idem pour les montants : on utilise les valeurs mises à l'échelle (scaledConsumption/
    // scaledToBuy, déjà calculées dans runSearch/getRecommendations/wrapRecipeAsResult) plutôt que
    // cost.totalConsumption/cost.totalToBuy qui restent à l'échelle de base (recipe.servings).
    const displayConsumption = (result.scaledConsumption !== undefined) ? result.scaledConsumption : cost.totalConsumption;
    const displayToBuy = (result.scaledToBuy !== undefined) ? result.scaledToBuy : cost.totalToBuy;
    // Facteur d'échelle pour les quantités par ligne d'ingrédient (les lignes de cost.lines restent
    // à recipe.servings ; on affiche la quantité mise à l'échelle pour rester cohérent avec displayPeople).
    const scaleFactor = recipe.servings ? displayPeople / recipe.servings : 1;
    const html = `
      <div class="modal-header">
        <h2>${recipe.photo} ${recipe.name}</h2>
        <button class="modal-close" id="closeDetailModal" aria-label="Hidiy">✕</button>
      </div>
      <div class="recipe-detail">
        <div class="recipe-meta">
          <span class="tag">${recipe.type}</span>
          <span>⏱️ ${recipe.time} min</span>
          <span>👥 ${displayPeople} olona</span>
        </div>
        ${result.budgetAdjusted ? `<p class="muted small">Habetsany voatsipika mba hifanaraka amin'ny budget-nao (ho an'olona ${displayPeople}).</p>` : ""}

        <h3 class="detail-subtitle">Akora ilaina</h3>
        <table class="price-table">
          ${cost.lines.map((l) => `
            <tr>
              <td>${l.name} ${l.hasEnough ? "✅" : ""}</td>
              <td>${l.isForfait ? l.qty : Math.round(l.qty * scaleFactor * 1000) / 1000} ${l.unit}</td>
              <td>${CALC.formatAr(l.isForfait ? l.consumptionCost : Math.round(l.consumptionCost * scaleFactor))}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="2">TOTAL (konsomasiona)</td>
            <td>${CALC.formatAr(displayConsumption)}</td>
          </tr>
          <tr class="total-row highlight">
            <td colspan="2">Montant à dépenser</td>
            <td>${CALC.formatAr(displayToBuy)}</td>
          </tr>
        </table>

        <h3 class="detail-subtitle">Fomba fanaovana</h3>
        <ol class="steps-list">
          ${recipe.steps.map((s) => `<li>${s}</li>`).join("")}
        </ol>

        <button class="btn btn-secondary btn-block" id="detailMahandroBtn" style="margin-bottom:10px;">👨‍🍳 Mahandro (guide pas-à-pas)</button>
        <button class="btn btn-primary btn-block" id="detailCookBtn">Atao anio</button>
      </div>
    `;
    this.openModal(html);
    document.getElementById("closeDetailModal").addEventListener("click", () => this.closeModal());
    document.getElementById("detailMahandroBtn").addEventListener("click", () => {
      MAHANDRO_UI.open(result);
    });
    document.getElementById("detailCookBtn").addEventListener("click", () => {
      this.closeModal();
      this.cookRecipe(result);
    });
  },

  cookRecipe(result) {
    const { recipe } = result;
    STOCK.deductForRecipe(recipe);
    HISTORY.saveMealHistory(recipe.id, recipe.name);
    this.renderExpiryBadge();
    this.toast(`✅ ${recipe.name} voamarina ho an'ny anio!`);
    if (this.state.currentScreen === "laoka") this.renderResultsScreen(this.state.lastResults);
  },

  addRecipeToShoppingList(result) {
    const { cost } = result;
    cost.buyList.forEach((item) => {
      const existing = DATA.state.shoppingList.find((s) => s.productId === item.productId && !s.checked);
      if (existing) {
        existing.qty += item.missingQty;
      } else {
        DATA.state.shoppingList.push({
          id: "s_" + Date.now() + Math.random().toString(36).slice(2, 6),
          productId: item.productId,
          qty: item.missingQty,
          unit: item.unit,
          checked: false,
        });
      }
    });
    DATA.saveData();
    this.toast("🛒 Nampidirina tao amin'ny HOVIDIANA");
  },
};
