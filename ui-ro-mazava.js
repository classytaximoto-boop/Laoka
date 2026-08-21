/* ============================================================
   LAOKA — ui-ro-mazava.js
   Écran « Paramètres > Ro mazava » — liste des bouillons clairs,
   à remplir manuellement plat par plat (DATA.state.roMazavaRecipes,
   vide par défaut). Réutilise le wizard LAOKA_FORM_UI pour l'ajout,
   en forçant dishCategory = "ro_mazava".
   ============================================================ */

const RO_MAZAVA_UI = {
  render() {
    const el = document.getElementById("profilContent");
    const list = DATA.state.roMazavaRecipes || [];

    el.innerHTML = `
      <button class="btn-back" id="roMazavaBack">← Retour</button>
      <div class="page-header fade-in">
        <h2>Ro mazava</h2>
        <p class="muted">Ireo rovitra madio — ampio iray ary iray.</p>
      </div>
      <div class="action-row fade-in" style="flex-direction:column; gap:8px;">
        <button class="btn btn-primary btn-block" id="btnAddRoMazava">+ Ajouter un ro mazava</button>
        <button class="btn btn-secondary btn-block" id="btnAddRoMatsatso">+ Ajouter un ro matsatso (anana + rano fotsiny)</button>
      </div>
      ${
        list.length === 0
          ? `<div class="card empty-state fade-in"><p>Mbola tsy misy ro mazava voarakitra. Ampio ny voalohany.</p></div>`
          : `<div class="results-list fade-in" id="roMazavaList">
              ${list.map((r) => this.itemHTML(r)).join("")}
            </div>`
      }
    `;

    document.getElementById("roMazavaBack").addEventListener("click", () => PROFIL_UI.renderTab("parametres"));

    const startDraft = (dishSubCategory) => {
      LAOKA_FORM_UI.draft = LAOKA_FORM_UI.emptyDraft();
      LAOKA_FORM_UI.draft.dishCategory = "ro_mazava";
      LAOKA_FORM_UI.draft.dishSubCategory = dishSubCategory; // cohérent avec saveDraftAsRecipe (dérive dishCategory de dishSubCategory)
      LAOKA_FORM_UI.draft.foodRole = "laoka";
      LAOKA_FORM_UI.draft.type = "RONY";
      if (dishSubCategory === "ro_matsatso") {
        // Pré-remplit directement l'anana comme seul ingrédient — le formulaire reste utilisable
        // pour changer la variété d'anana, mais saveDraftAsRecipe filtre de toute façon tout ajout
        // hors ROMATSATSO_RULE.allowedAnanaProductIds (règle absolue, prompt 2/4).
        LAOKA_FORM_UI.draft.ingredientType = "anana";
        LAOKA_FORM_UI.draft.recipeIngredients = [{ productId: "anana", qty: 2, unit: "bunch" }];
      }
      LAOKA_FORM_UI.step = 0;
      LAOKA_FORM_UI.mode = "detaille";
      // Retour personnalisé : après sauvegarde ou abandon, on revient à cet écran plutôt qu'à Paramètres
      const originalSave = LAOKA_FORM_UI.saveDraftAsRecipe.bind(LAOKA_FORM_UI);
      LAOKA_FORM_UI.saveDraftAsRecipe = function () {
        originalSave();
        LAOKA_FORM_UI.saveDraftAsRecipe = originalSave; // restaure le comportement normal ensuite
        RO_MAZAVA_UI.render();
      };
      LAOKA_FORM_UI.renderStep();
    };

    document.getElementById("btnAddRoMazava").addEventListener("click", () => startDraft("ro_mazava"));
    document.getElementById("btnAddRoMatsatso").addEventListener("click", () => startDraft("ro_matsatso"));

    const listEl = document.getElementById("roMazavaList");
    if (listEl) {
      listEl.querySelectorAll("[data-action='delete']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").dataset.id;
          DATA.state.roMazavaRecipes = DATA.state.roMazavaRecipes.filter((r) => r.id !== id);
          DATA.saveData();
          this.render();
          UI.toast("Nofafana.");
        });
      });
    }
  },

  itemHTML(recipe) {
    return `
      <div class="card fade-in" data-id="${recipe.id}">
        <div class="recipe-card-top">
          <div class="recipe-photo">${recipe.photo || "🍲"}</div>
          <div class="recipe-info">
            <h3>${recipe.name} ${recipe.dishSubCategory === "ro_matsatso" ? '<span class="tag">Ro matsatso</span>' : ""}</h3>
            <div class="recipe-meta">
              <span>${(recipe.moment || []).map((m) => (typeof MEAL_MOMENT_LABELS !== "undefined" ? MEAL_MOMENT_LABELS[m] : m)).join(", ")}</span>
            </div>
          </div>
        </div>
        ${recipe.manualPrice ? `<p class="muted small">Vidiny : ${CALC.formatAr(recipe.manualPrice)}</p>` : ""}
        <div class="recipe-actions">
          <button class="btn-icon danger" data-action="delete">Supprimer</button>
        </div>
      </div>
    `;
  },
};
