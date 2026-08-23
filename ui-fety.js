/* ============================================================
   LAOKA — ui-fety.js
   Écran « Fety » — sélection spéciale de laoka/accompagnements pour
   les fêtes et grandes occasions (prompt 3/4, section 1).
   IMPORTANT : Fety n'est pas un groupe alimentaire ni un dishCategory
   séparé — c'est une sélection de recettes existantes de
   DATA.state.recipes marquées isFety: true (voir RECO.getFetyRecipes).
   Réutilise UI.openRecipeDetail / UI.cookRecipe pour rester cohérent
   avec l'écran de résultats standard.
   ============================================================ */

/* Budget minimum pour une recherche Fety : en dessous de ce montant, le choix de laoka
   "grande occasion" n'a pas de sens (portions, plats plus riches, etc.) — on bloque avec
   un message plutôt que de renvoyer des résultats hors-sujet ou incomplets. */
const FETY_MIN_BUDGET = 20000;

const FETY_UI = {
  state: {
    occasion: null, // valeur de FETY_OCCASIONS, ou null = toutes
    budget: null,   // budget saisi par l'utilisateur (Ar), ou null = pas encore filtré par budget
    people: 4,       // nombre de personnes, 4 à 10 (mêmes bornes que la recherche standard)
  },

  render() {
    const el = document.getElementById("profilContent");
    const occasion = this.state.occasion;
    let list = RECO.getFetyRecipes(occasion);

    // Filtre budget (optionnel) : uniquement appliqué une fois que l'utilisateur a saisi et
    // validé un budget (this.state.budget !== null). Sous le plancher FETY_MIN_BUDGET, la
    // validation du formulaire bloque déjà la saisie (voir bindBudgetForm) — donc si
    // this.state.budget est défini ici, il est nécessairement >= FETY_MIN_BUDGET.
    if (this.state.budget) {
      list = list.filter((r) => {
        const cost = CALC.calculateRecipeCost(r, DATA.state.pantry, this.state.people);
        const scaledToBuy = RECO.scaleCostForServings(cost.scalableToBuy, r.servings, this.state.people) + cost.forfaitToBuy;
        return scaledToBuy <= this.state.budget;
      });
    }

    el.innerHTML = `
      <button class="btn-back" id="fetyBack">← Retour</button>
      <div class="page-header fade-in">
        <h2>🎉 Fety</h2>
        <p class="muted">Sokajy manokana ho an'ny fety sy fotoana lehibe — tsy sokajin-tsakafo fa fitsipahana laoka mifanaraka.</p>
      </div>
      <div class="chip-row fade-in" id="fetyOccasionChips" style="flex-wrap:wrap; gap:8px; display:flex; margin-bottom:14px;">
        <button class="btn ${!occasion ? "btn-primary" : "btn-secondary"}" data-occasion="">Rehetra</button>
        ${FETY_OCCASIONS.map((o) => `
          <button class="btn ${occasion === o ? "btn-primary" : "btn-secondary"}" data-occasion="${o}">${FETY_OCCASION_LABELS[o]}</button>
        `).join("")}
      </div>

      <div class="card fade-in" style="margin-bottom:14px;">
        <form id="fetyBudgetForm" class="form">
          <div class="field-row">
            <div class="field">
              <label for="fetyBudgetInput">Budget (minimum ${CALC.formatAr(FETY_MIN_BUDGET)})</label>
              <div class="input-suffix">
                <input type="number" id="fetyBudgetInput" min="${FETY_MIN_BUDGET}" step="500" value="${this.state.budget || ""}" placeholder="Ohatra: 25000">
                <span class="suffix">Ar</span>
              </div>
            </div>
            <div class="field">
              <label for="fetyPeopleInput">Olona</label>
              <input type="number" id="fetyPeopleInput" min="4" max="10" value="${this.state.people}">
            </div>
          </div>
          <div class="field-error hidden" id="fetyBudgetErr"></div>
          <div class="form-actions" style="display:flex; gap:8px;">
            <button type="submit" class="btn btn-primary btn-block">Sivana amin'ny budget</button>
            ${this.state.budget ? `<button type="button" class="btn btn-secondary" id="fetyBudgetClear">Esory</button>` : ""}
          </div>
        </form>
      </div>

      ${
        list.length === 0
          ? `<div class="card empty-state fade-in"><p>${this.state.budget ? "Tsy misy laoka Fety mifanaraka amin'io budget io." : "Tsy mbola misy laoka Fety amin'ity fotoana ity."}</p></div>`
          : `<div class="results-list fade-in" id="fetyList">
              ${list.map((r) => this.itemHTML(r)).join("")}
            </div>`
      }
    `;

    document.getElementById("fetyBack").addEventListener("click", () => PROFIL_UI.renderTab("parametres"));

    document.querySelectorAll("#fetyOccasionChips [data-occasion]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.state.occasion = btn.dataset.occasion || null;
        this.render();
      });
    });

    this.bindBudgetForm();

    const listEl = document.getElementById("fetyList");
    if (listEl) {
      listEl.querySelectorAll("[data-action='view']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").dataset.id;
          const recipe = DATA.state.recipes.find((r) => r.id === id);
          if (recipe) UI.openRecipeDetail(this.toResult(recipe));
        });
      });
      listEl.querySelectorAll("[data-action='addcourses']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").dataset.id;
          const recipe = DATA.state.recipes.find((r) => r.id === id);
          if (recipe) UI.addRecipeToShoppingList(this.toResult(recipe));
        });
      });
    }
  },

  /** Valide et applique le formulaire budget/personnes. Le plancher FETY_MIN_BUDGET est une
   *  règle bloquante (pas un simple avertissement) : en dessous, on refuse la saisie plutôt que
   *  de renvoyer des laoka Fety hors-budget ou de silencieusement remonter le montant à la
   *  place de l'utilisateur. */
  bindBudgetForm() {
    const form = document.getElementById("fetyBudgetForm");
    const clearBtn = document.getElementById("fetyBudgetClear");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const budget = Number(document.getElementById("fetyBudgetInput").value);
      const people = Number(document.getElementById("fetyPeopleInput").value) || 4;
      const errEl = document.getElementById("fetyBudgetErr");

      if (!budget || budget < FETY_MIN_BUDGET) {
        errEl.textContent = `Tsy azo atao ny budget latsaka ny ${CALC.formatAr(FETY_MIN_BUDGET)} ho an'ny Fety.`;
        errEl.classList.remove("hidden");
        return;
      }
      if (people < 4 || people > 10) {
        errEl.textContent = "Ny isan'olona dia tokony ho eo anelanelan'ny 4 sy 10.";
        errEl.classList.remove("hidden");
        return;
      }
      errEl.classList.add("hidden");

      this.state.budget = budget;
      this.state.people = people;
      this.render();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.state.budget = null;
        this.render();
      });
    }
  },

  /** Construit un objet "result" (recipe + cost) comme RECO.getRecommendations, pour rester
   *  compatible avec UI.openRecipeDetail / UI.cookRecipe / UI.addRecipeToShoppingList.
   *  Si un budget Fety est actif, on met le coût à l'échelle du nombre de personnes choisi
   *  (this.state.people), comme le fait RECO.getRecommendations pour la recherche standard. */
  toResult(recipe) {
    const people = this.state.budget ? this.state.people : undefined;
    const cost = CALC.calculateRecipeCost(recipe, DATA.state.pantry, people);
    const scaledToBuy = people
      ? RECO.scaleCostForServings(cost.scalableToBuy, recipe.servings, people) + cost.forfaitToBuy
      : cost.totalToBuy;
    const scaledConsumption = people
      ? RECO.scaleCostForServings(cost.scalableConsumption, recipe.servings, people) + cost.forfaitConsumption
      : cost.totalConsumption;
    return {
      recipe,
      cost,
      scaledToBuy,
      scaledConsumption,
      overBudget: false,
      reasons: [],
      repetitionMessage: null,
      people,
    };
  },

  itemHTML(recipe) {
    return `
      <div class="card fade-in" data-id="${recipe.id}">
        <div class="recipe-card-top">
          <div class="recipe-photo">${recipe.photo || "🎉"}</div>
          <div class="recipe-info">
            <h3>${recipe.name}</h3>
            <div class="recipe-meta">
              <span>${(recipe.festiveOccasions || []).map((o) => FETY_OCCASION_LABELS[o] || o).join(", ")}</span>
              <span>⏱️ ${recipe.time} min</span>
            </div>
          </div>
        </div>
        <div class="recipe-actions">
          <button class="btn-icon" data-action="view">Jereo</button>
          <button class="btn-icon" data-action="addcourses">🛒 Ampio</button>
        </div>
      </div>
    `;
  },
};
