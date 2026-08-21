/* ============================================================
   LAOKA — ui.js
   SECTION: UI — rendu des écrans, navigation, event listeners
   ============================================================ */

const UI = {
  state: {
    currentScreen: "home",
    searchFilters: { budget: 3000, people: 4, mealTime: null, laokaType: null, trondroState: null, dishSubCategory: null, includeAchard: false },
    lastResults: [],
  },

  /* ------------------- INIT ------------------- */
  init() {
    DATA.loadData();
    this.bindNav();
    this.bindGlobalModalClose();
    this.renderHome();
    this.showScreen("home");
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

  showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById("screen-" + name);
    if (target) target.classList.add("active");
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.screen === name));
    this.state.currentScreen = name;

    if (name === "home") this.renderHome();
    if (name === "tsopitra") TSOPITRA_UI.render();
    if (name === "courses") COURSES_UI.render();
    if (name === "profil") PROFIL_UI.render();
    window.scrollTo(0, 0);
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
  },
  closeModal() {
    document.getElementById("modalOverlay").classList.remove("active");
    document.getElementById("modalContent").innerHTML = "";
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
    trondroStateWrap.classList.toggle("hidden", selectedType !== "TRONDRO");

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
        trondroStateWrap.classList.toggle("hidden", selectedType !== "TRONDRO");
        if (selectedType !== "TRONDRO") {
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
      this.state.searchFilters = { budget, people, mealTime: selectedMoment, laokaType: selectedType, trondroState: selectedType === "TRONDRO" ? selectedTrondroState : null, dishSubCategory: selectedDishSubCategory, includeAchard };
      this.closeModal();
      this.runSearch();
    });
  },

  /* ------------------- RÉSULTATS ------------------- */
  runSearch() {
    const results = RECO.getRecommendations(this.state.searchFilters);
    this.state.lastResults = results;
    this.renderResultsScreen(results);
    this.showScreen("laoka");
  },

  renderResultsScreen(results) {
    const f = this.state.searchFilters;
    const el = document.getElementById("screen-laoka");
    el.innerHTML = `
      <div class="results-header fade-in">
        <h2>Ireto no mety aminao</h2>
        <div class="results-meta">
          <span>💰 ${CALC.formatAr(f.budget)}</span>
          <span>👥 ${f.people}</span>
          ${f.mealTime ? `<span>${this.momentLabel(f.mealTime)}</span>` : ""}
          ${f.dishSubCategory ? `<span>${DISH_CATEGORY_LABELS[f.dishSubCategory] || f.dishSubCategory}</span>` : ""}
        </div>
        <button class="btn btn-secondary btn-block" id="btnNewSearch">Ovaina ny fikarohana</button>
      </div>
      <div class="results-list" id="resultsList"></div>
    `;
    document.getElementById("btnNewSearch").addEventListener("click", () => this.openSearchForm());

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
    const { recipe, scaledToBuy, scaledConsumption, overBudget, reasons, repetitionMessage } = result;
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
    const html = `
      <div class="modal-header">
        <h2>${recipe.photo} ${recipe.name}</h2>
        <button class="modal-close" id="closeDetailModal" aria-label="Hidiy">✕</button>
      </div>
      <div class="recipe-detail">
        <div class="recipe-meta">
          <span class="tag">${recipe.type}</span>
          <span>⏱️ ${recipe.time} min</span>
          <span>👥 ${recipe.servings} olona</span>
        </div>

        <h3 class="detail-subtitle">Akora ilaina</h3>
        <table class="price-table">
          ${cost.lines.map((l) => `
            <tr>
              <td>${l.name} ${l.hasEnough ? "✅" : ""}</td>
              <td>${l.qty} ${l.unit}</td>
              <td>${CALC.formatAr(l.consumptionCost)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="2">TOTAL (konsomasiona)</td>
            <td>${CALC.formatAr(cost.totalConsumption)}</td>
          </tr>
          <tr class="total-row highlight">
            <td colspan="2">Montant à dépenser</td>
            <td>${CALC.formatAr(cost.totalToBuy)}</td>
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
