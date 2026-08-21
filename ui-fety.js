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

const FETY_UI = {
  state: {
    occasion: null, // valeur de FETY_OCCASIONS, ou null = toutes
  },

  render() {
    const el = document.getElementById("profilContent");
    const occasion = this.state.occasion;
    const list = RECO.getFetyRecipes(occasion);

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
      ${
        list.length === 0
          ? `<div class="card empty-state fade-in"><p>Tsy mbola misy laoka Fety amin'ity fotoana ity.</p></div>`
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

  /** Construit un objet "result" (recipe + cost) comme RECO.getRecommendations, pour rester
   *  compatible avec UI.openRecipeDetail / UI.cookRecipe / UI.addRecipeToShoppingList. */
  toResult(recipe) {
    const cost = CALC.calculateRecipeCost(recipe, DATA.state.pantry);
    return {
      recipe,
      cost,
      scaledToBuy: cost.totalToBuy,
      scaledConsumption: cost.totalConsumption,
      overBudget: false,
      reasons: [],
      repetitionMessage: null,
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
