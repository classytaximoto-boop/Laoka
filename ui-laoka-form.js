/* ============================================================
   LAOKA — ui-laoka-form.js
   Écran « Paramètres > Ajouter un laoka » — formulaire complet,
   accessible uniquement depuis Paramètres (pas dans Admin > Recettes,
   pour ne pas polluer le dashboard).
   Deux modes :
   - "simple"  : un seul écran, champs essentiels (nom, atao, type, moment, prix)
   - "detaille": wizard 13 étapes (refonte prompt 2) couvrant toute l'architecture
     Menu principal / Laoka / Voalena / Ambany tanana / compatibilité en %.

   RÈGLE : ce wizard sert à créer un ACCOMPAGNEMENT / LAOKA. Le riz/vary, mangahazo,
   katsaka, vomanga et saonjo (menu principal) ne sont jamais proposés ici comme laoka.
   ============================================================ */

const LAOKA_FORM_UI = {
  mode: "simple", // "simple" | "detaille"
  step: 0,
  draft: null,

  /* 13 étapes du wizard détaillé (prompt 2) */
  STEPS: [
    "identite",        // 1. identité + famille (dishSubCategory)
    "ingredient",       // 2. ingrédient principal (ingredientType)
    "animal",            // 3. partie / source animale (conditionnelle)
    "fotoana",            // 4. fotoana (moment)
    "atao",                // 5. atao / mode de préparation (cookingMethod)
    "fangarony",             // 6. fangarony
    "sauce_epices",            // 7. sauce / épices / aromates
    "compatibilite",             // 8. compatibilité en %
    "quantite_prix",               // 9. quantité, unité, prix
    "regime",                       // 10. régime alimentaire
    "saison",                        // 11. saison / calendrier
    "recette",                        // 12. recette complète
    "recap",                           // 13. récapitulatif
  ],

  emptyDraft() {
    return {
      // 1. Identité
      name: "",
      photo: "🍽️",
      foodRole: "laoka",          // laoka | condiment (jamais menu_principal depuis ce wizard)
      dishSubCategory: "laoka_classique", // valeur de DISH_CATEGORIES
      dishCategory: "laoka",       // champ historique conservé pour compat RECO (dérivé à la sauvegarde)

      // 2. Ingrédient principal
      ingredientType: "hena",       // legumes | anana | hena | voamaina | hazan_drano | hazandranomasina | atody
      mainIngredientId: "",          // productId sélectionné comme ingrédient principal (optionnel, informatif)

      // 3. Partie / source animale (conditionnel)
      animalSource: "",               // boeuf | porc | poulet | lapin | poisson | crustace | autre | ""
      animalPart: "",                  // viande | pied | tete | ... | ""

      // 4. Fotoana
      moment: [],                       // maraina/atoandro/hariva/gouter

      // 5. Atao (mode de préparation)
      type: "RITRA",                     // cookingMethod historique (champ `type` conservé)

      // 6. Fangarony
      fangarony: [],                      // [{ id, name, qty?, unit? }]

      // 7. Sauce / épices
      sauceItems: [],                      // [{ id, name }] issus de SAUCE_BASE_REFERENCE + perso
      spiceItems: [],                       // [{ id, name }] issus de SPICES_REFERENCE + perso
      sauce: "",                             // texte libre conservé (rétrocompat affichage)
      spices: "",                             // texte libre conservé (rétrocompat affichage)

      // 8. Compatibilité en %
      incompatibleProducts: [],                // [{ productId, percentage }] — dérivé des groupes cochés (rétrocompat RECO)
      incompatibleTypes: [],                    // [{ typeId, percentage }] (typeId = valeur DISH_COOKING_MODES)
      incompatibleTypeGroups: [],                // [ingredientType,...] — groupes alimentaires cochés (nouvelle UI simplifiée)
      incompatiblePercentage: 100,                // % appliqué globalement aux groupes/cuissons cochés
      incompatibleCustom: [{ text: "", percentage: 100 }], // au moins 4 lignes visibles au rendu

      // 9. Quantité / prix
      qty: 1,
      unit: "kg",
      price: 0,
      priceUnit: "kg",

      // 10. Régime
      diet: [],                                  // halal | mpino | sabatista | vegetarien | standard | personnalise
      dietCustom: "",
      containsPork: false,

      // 11. Saison
      season: [],

      // 12. Recette complète
      time: 30,
      servings: 4,
      recipeIngredients: [],                        // [{ productId, qty, unit }]
      steps: [""],
      notes: "",
    };
  },

  /* ------------------- ENTRÉE ------------------- */
  render() {
    this.draft = this.emptyDraft();
    this.editingRecipeId = null;
    this.step = 0;
    this.renderModeChoice();
  },

  /** Ouvre le wizard détaillé pré-rempli avec une recette existante, pour modification (bouton
      "Modifier" de l'écran Admin > Recettes). onDone est appelé après sauvegarde/suppression du
      mode édition, pour permettre à l'appelant de rafraîchir sa propre vue (ex. ADMIN.renderRecettesTable),
      puisqu'ici on ne retourne pas vers PROFIL_UI comme le fait le flux d'ajout normal. */
  startEdit(recipe, onDone) {
    const d = this.emptyDraft();
    // Ne copie que les champs connus du draft, pour ne pas propager de champs legacy inattendus
    // vers le formulaire (ex. manualPrice/manualQty gérés séparément plus bas).
    Object.assign(d, {
      name: recipe.name || "",
      photo: recipe.photo || "🍽️",
      foodRole: recipe.foodRole || "laoka",
      dishSubCategory: recipe.dishSubCategory || "laoka_classique",
      dishCategory: recipe.dishCategory || "laoka",
      ingredientType: recipe.ingredientType || "hena",
      mainIngredientId: recipe.mainIngredientId || "",
      animalSource: recipe.animalSource || "",
      animalPart: recipe.animalPart || "",
      moment: Array.isArray(recipe.moment) ? [...recipe.moment] : [],
      type: recipe.type || recipe.cookingMethod || "RITRA",
      fangarony: Array.isArray(recipe.fangarony) ? structuredClone(recipe.fangarony) : [],
      sauceItems: Array.isArray(recipe.sauceItems) ? structuredClone(recipe.sauceItems) : [],
      spiceItems: Array.isArray(recipe.spiceItems) ? structuredClone(recipe.spiceItems) : [],
      sauce: recipe.sauce || "",
      spices: recipe.spices || "",
      incompatibleProducts: recipe.incompatibleWith && Array.isArray(recipe.incompatibleWith.products) ? structuredClone(recipe.incompatibleWith.products) : [],
      incompatibleTypes: recipe.incompatibleWith && Array.isArray(recipe.incompatibleWith.types) ? structuredClone(recipe.incompatibleWith.types) : [],
      incompatibleTypeGroups: Array.isArray(recipe.incompatibleTypeGroups) ? [...recipe.incompatibleTypeGroups] : [],
      incompatiblePercentage: typeof recipe.incompatiblePercentage === "number" ? recipe.incompatiblePercentage : 100,
      incompatibleCustom: recipe.incompatibleWith && Array.isArray(recipe.incompatibleWith.custom) && recipe.incompatibleWith.custom.length
        ? structuredClone(recipe.incompatibleWith.custom) : [{ text: "", percentage: 100 }],
      qty: recipe.manualQty || 1,
      unit: recipe.manualPriceUnit || "kg",
      price: recipe.manualPrice || 0,
      priceUnit: recipe.manualPriceUnit || "kg",
      diet: Array.isArray(recipe.diet) ? [...recipe.diet] : [],
      dietCustom: recipe.dietCustom || "",
      containsPork: !!recipe.containsPork,
      season: Array.isArray(recipe.season) ? [...recipe.season] : [],
      time: recipe.time || 30,
      servings: recipe.servings || 4,
      recipeIngredients: Array.isArray(recipe.ingredients) ? structuredClone(recipe.ingredients) : [],
      steps: Array.isArray(recipe.steps) && recipe.steps.length ? [...recipe.steps] : [""],
      notes: recipe.notes || "",
    });
    this.draft = d;
    this.editingRecipeId = recipe.id;
    this._editReturnCallback = typeof onDone === "function" ? onDone : null;
    this.mode = "detaille";
    this.step = 0;
    // Le formulaire s'affiche dans #profilContent (dans #screen-profil) : on doit d'abord naviguer
    // vers cet écran, même si l'édition a été lancée depuis Admin, sinon aucun conteneur n'existe.
    UI.showScreen("profil");
    PROFIL_UI.render();
    this.renderStep();
  },

  screenShell(title, innerHTML) {
    const el = document.getElementById("profilContent");
    el.innerHTML = `
      <button class="btn-back" id="laokaFormBack">← Retour</button>
      <div class="page-header fade-in"><h2>${title}</h2></div>
      ${innerHTML}
    `;
    document.getElementById("laokaFormBack").addEventListener("click", () => this.returnFromForm());
  },

  /** Retour arrière commun (bouton "← Retour" + étape 0 "Annuler") : en mode édition (ouvert
      depuis Admin > Recettes), on revient à Admin plutôt qu'à Profil > Paramètres, sinon
      comportement historique inchangé. */
  returnFromForm() {
    if (this.editingRecipeId) {
      const cb = this._editReturnCallback;
      this.editingRecipeId = null;
      this._editReturnCallback = null;
      if (typeof ADMIN !== "undefined") {
        UI.showScreen("admin");
        ADMIN.render();
        ADMIN.renderView("recettes");
      }
      if (cb) cb();
    } else {
      PROFIL_UI.renderTab("parametres");
    }
  },

  /* ------------------- CHOIX DU MODE ------------------- */
  renderModeChoice() {
    this.screenShell("Ajouter un laoka", `
      <section class="section fade-in">
        <p class="muted">Safidio ny fomba fanampiana laoka vaovao.</p>
        <p class="muted small">Ny vary, mangahazo, katsaka, vomanga ary saonjo dia « menu principal », tsy laoka — tsy ho hita eto ireo.</p>
        <div class="choice-row" style="flex-direction:column; gap:10px;">
          <button class="btn btn-primary btn-block" id="modeSimple">Simple — un seul écran</button>
          <button class="btn btn-secondary btn-block" id="modeDetaille">Détaillé — 13 étapes (recommandé)</button>
        </div>
      </section>
    `);
    document.getElementById("modeSimple").addEventListener("click", () => {
      this.mode = "simple";
      this.renderSimpleForm();
    });
    document.getElementById("modeDetaille").addEventListener("click", () => {
      this.mode = "detaille";
      this.step = 0;
      this.renderStep();
    });
  },

  /* ------------------- MODE SIMPLE (un seul écran) ------------------- */
  renderSimpleForm() {
    const d = this.draft;
    this.screenShell("Ajouter un laoka — Simple", `
      <form id="laokaSimpleForm" class="form fade-in">
        <div class="field">
          <label for="lsName">Nom du laoka</label>
          <input type="text" id="lsName" value="${d.name}" required placeholder="ex : Akoho sy voanio">
        </div>
        <div class="field">
          <label for="lsAtao">Atao (mode de cuisson)</label>
          <select id="lsAtao">
            ${DISH_COOKING_MODES.map((m) => `<option value="${m}">${COOKING_MODE_LABELS[m]}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="lsType">Type (ingrédient principal)</label>
          <select id="lsType">
            ${DISH_INGREDIENT_TYPES.map((t) => `<option value="${t}">${DISH_INGREDIENT_TYPE_LABELS[t]}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Fotoana</label>
          <div class="choice-grid" id="lsMoments">
            ${MEAL_MOMENTS.map((m) => `<button type="button" class="choice-chip" data-value="${m}">${MEAL_MOMENT_LABELS[m]}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label for="lsPrice">Prix indicatif</label>
          <div class="input-suffix">
            <input type="number" id="lsPrice" min="0" step="100" value="0">
            <span class="suffix">Ar</span>
          </div>
          <p class="muted small">Prix indicatif — modifiable dans Paramètres.</p>
        </div>
        <div class="field-error hidden" id="lsErr"></div>
        <button type="submit" class="btn btn-primary btn-block">Enregistrer le laoka</button>
        <button type="button" class="btn btn-tertiary btn-block" id="lsSwitchDetail">Passer en mode détaillé pour plus d'options</button>
      </form>
    `);

    const selectedMoments = new Set();
    document.querySelectorAll("#lsMoments .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        if (btn.classList.contains("active")) selectedMoments.add(btn.dataset.value);
        else selectedMoments.delete(btn.dataset.value);
      });
    });

    document.getElementById("lsSwitchDetail").addEventListener("click", () => {
      this.draft.name = document.getElementById("lsName").value.trim();
      this.mode = "detaille";
      this.step = 0;
      this.renderStep();
    });

    document.getElementById("laokaSimpleForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("lsName").value.trim();
      const errEl = document.getElementById("lsErr");
      if (!name) {
        errEl.textContent = "Tsy azo avela ho banga ny anaran'ny laoka.";
        errEl.classList.remove("hidden");
        return;
      }
      if (selectedMoments.size === 0) {
        errEl.textContent = "Safidio farafahakeliny fotoana iray.";
        errEl.classList.remove("hidden");
        return;
      }
      errEl.classList.add("hidden");

      this.draft.name = name;
      this.draft.type = document.getElementById("lsAtao").value;
      this.draft.ingredientType = document.getElementById("lsType").value;
      this.draft.moment = [...selectedMoments];
      this.draft.price = Number(document.getElementById("lsPrice").value) || 0;
      this.draft.dishSubCategory = this.dishSubCategoryFromCookingMode(this.draft.type);

      this.saveDraftAsRecipe();
    });
  },

  dishSubCategoryFromCookingMode(mode) {
    const map = { RITRA: "ritra", RONY: "rony", KETSAKETSA: "ketsaketsa", KIENDY: "kiendy", VOAMAINA: "voamaina" };
    return map[mode] || "laoka_classique";
  },

  /* ------------------- MODE DÉTAILLÉ (wizard 13 étapes) ------------------- */
  renderStep() {
    const stepName = this.STEPS[this.step];
    const renderers = {
      identite: () => this.stepIdentite(),
      ingredient: () => this.stepIngredient(),
      animal: () => this.stepAnimal(),
      fotoana: () => this.stepFotoana(),
      atao: () => this.stepAtao(),
      fangarony: () => this.stepFangarony(),
      sauce_epices: () => this.stepSauceEpices(),
      compatibilite: () => this.stepCompatibilite(),
      quantite_prix: () => this.stepQuantitePrix(),
      regime: () => this.stepRegime(),
      saison: () => this.stepSaison(),
      recette: () => this.stepRecette(),
      recap: () => this.stepRecap(),
    };
    renderers[stepName]();
  },

  /* Étape 3 (animal) est conditionnelle : uniquement pertinente si ingredientType = hena/
     hazan_drano/hazandranomasina, ou dishSubCategory = ambany_tanana. On la saute automatiquement
     sinon, dans les deux sens (Suivant ET Précédent), pour ne jamais bloquer l'utilisateur. */
  isAnimalStepRelevant() {
    const d = this.draft;
    return ["hena", "hazan_drano", "hazandranomasina"].includes(d.ingredientType) || d.dishSubCategory === "ambany_tanana";
  },

  nextStep() {
    this.step += 1;
    if (this.STEPS[this.step] === "animal" && !this.isAnimalStepRelevant()) this.step += 1;
    this.renderStep();
  },
  prevStep() {
    this.step -= 1;
    if (this.STEPS[this.step] === "animal" && !this.isAnimalStepRelevant()) this.step -= 1;
    if (this.step < 0) this.step = 0;
    this.renderStep();
  },

  wizardShell(title, bodyHTML, opts = {}) {
    const progress = Math.round(((this.step + 1) / this.STEPS.length) * 100);
    const el = document.getElementById("profilContent");
    el.innerHTML = `
      <button class="btn-back" id="laokaFormBack">← Retour</button>
      <div class="page-header fade-in">
        <h2>${title}</h2>
        <p class="muted small">Étape ${this.step + 1} / ${this.STEPS.length}</p>
      </div>
      <div class="card fade-in" style="height:6px; padding:0; overflow:hidden;">
        <div style="height:100%; width:${progress}%; background:var(--forest,#2f6b4f); transition:width .2s;"></div>
      </div>
      <form id="wizardStepForm" class="form fade-in">
        ${bodyHTML}
        <div class="field-error hidden" id="wizErr"></div>
        <div class="modal-actions">
          ${this.step > 0 ? `<button type="button" class="btn btn-secondary" id="wizPrev">← Précédent</button>` : `<span></span>`}
          <button type="submit" class="btn btn-primary">${opts.lastLabel || "Suivant →"}</button>
        </div>
      </form>
    `;
    document.getElementById("laokaFormBack").addEventListener("click", () => {
      if (this.step === 0) this.returnFromForm();
      else if (this.editingRecipeId) this.prevStep(); // en édition, pas de mode-choice à revoir
      else this.renderModeChoice();
    });
    const prevBtn = document.getElementById("wizPrev");
    if (prevBtn) prevBtn.addEventListener("click", () => this.prevStep());
  },

  showWizError(msg) {
    const errEl = document.getElementById("wizErr");
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  },

  /* ---- 1. Identité et famille ---- */
  stepIdentite() {
    const d = this.draft;
    const examplesByCategory = {
      voalena: ["Voanjobory lena", "Tsaramaso lena", "autres légumineuses fraîches"],
      ambany_tanana: ["Foza orana", "Museau", "Gôrsa", "Taovany"],
    };
    this.wizardShell("1 — Anarana sy fianakaviana", `
      <div class="field">
        <label for="wName">Anaran'ny laoka</label>
        <input type="text" id="wName" value="${d.name}" required placeholder="ex : Akoho sy voanio">
      </div>
      <div class="field">
        <label for="wPhoto">Photo / emoji (optionnel)</label>
        <input type="text" id="wPhoto" value="${d.photo}" maxlength="4">
      </div>
      <div class="field">
        <label for="wFoodRole">Rôle</label>
        <select id="wFoodRole">
          <option value="laoka" ${d.foodRole==="laoka"?"selected":""}>Laoka</option>
          <option value="condiment" ${d.foodRole==="condiment"?"selected":""}>Condiment</option>
        </select>
      </div>
      <div class="field">
        <label for="wDishSub">Catégorie</label>
        <select id="wDishSub">
          ${DISH_CATEGORIES.map((c) => `<option value="${c}" ${d.dishSubCategory===c?"selected":""}>${DISH_CATEGORY_LABELS[c]}</option>`).join("")}
        </select>
      </div>
      <div class="field" id="wCategoryExamples"></div>
    `);

    const dishSubSelect = document.getElementById("wDishSub");
    const foodRoleSelect = document.getElementById("wFoodRole");
    const examplesEl = document.getElementById("wCategoryExamples");
    const renderExamples = () => {
      const cat = dishSubSelect.value;
      const examples = examplesByCategory[cat];
      examplesEl.innerHTML = examples
        ? `<p class="muted small">Ohatra : ${examples.join(", ")}.</p>`
        : (cat === "ro_mazava" ? `<p class="muted small">Hifandray amin'ny rafitra Ro mazava efa misy.</p>` : "");
      // Achard/Ro mazava impliquent un foodRole cohérent, mais l'utilisateur reste libre de le changer
      if (cat === "achard" && foodRoleSelect.value === "laoka") foodRoleSelect.value = "condiment";
    };
    dishSubSelect.addEventListener("change", renderExamples);
    renderExamples();

    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("wName").value.trim();
      if (!name) return this.showWizError("Tsy azo avela ho banga ny anarana.");
      this.draft.name = name;
      this.draft.photo = document.getElementById("wPhoto").value.trim() || "🍽️";
      this.draft.foodRole = foodRoleSelect.value;
      this.draft.dishSubCategory = dishSubSelect.value;
      this.nextStep();
    });
  },

  /* ---- 2. Ingrédient principal ---- */
  stepIngredient() {
    const d = this.draft;
    this.wizardShell("2 — Akora fototra", `
      <div class="field">
        <label for="wIngType">Karazana akora fototra</label>
        <select id="wIngType">
          ${DISH_INGREDIENT_TYPES.map((t) => `<option value="${t}" ${d.ingredientType===t?"selected":""}>${DISH_INGREDIENT_TYPE_LABELS[t]}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label for="wMainProduct">Akora voalohany indrindra (safidy, tsy voatery)</label>
        <select id="wMainProduct">
          <option value="">— tsy voafaritra —</option>
          ${DATA.state.products
            .filter((p) => p.foodRole !== "menu_principal")
            .map((p) => `<option value="${p.id}" ${d.mainIngredientId===p.id?"selected":""}>${p.name}</option>`)
            .join("")}
        </select>
      </div>
      <div class="field" id="wIngExamples"></div>
    `);
    const typeSelect = document.getElementById("wIngType");
    const examplesEl = document.getElementById("wIngExamples");
    const renderExamples = () => {
      if (typeSelect.value === "voamaina") {
        const isVoalena = d.dishSubCategory === "voalena";
        examplesEl.innerHTML = `<p class="muted small">Ohatra : ${isVoalena ? "Voanjobory lena, Tsaramaso lena" : "Tsaramaso maina, Voanemba, Voanjobory maina, Kabaro/pois du Cap sec, lentilles"}.</p>`;
      } else if (d.dishSubCategory === "ambany_tanana") {
        examplesEl.innerHTML = `<p class="muted small">Ohatra : Foza orana, Museau, Gôrsa, Taovany.</p>`;
      } else {
        examplesEl.innerHTML = "";
      }
    };
    typeSelect.addEventListener("change", renderExamples);
    renderExamples();

    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.draft.ingredientType = typeSelect.value;
      this.draft.mainIngredientId = document.getElementById("wMainProduct").value;
      this.nextStep();
    });
  },

  /* ---- 3. Partie / source animale (conditionnelle) ---- */
  stepAnimal() {
    const d = this.draft;
    this.wizardShell("3 — Karazana biby sy tapany", `
      <div class="field">
        <label for="wAnimalSource">Karazana biby / loharano</label>
        <select id="wAnimalSource">
          <option value="">— tsy voafaritra —</option>
          ${ANIMAL_SOURCES.map((a) => `<option value="${a}" ${d.animalSource===a?"selected":""}>${ANIMAL_SOURCE_LABELS[a]}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label for="wAnimalPart">Tapany</label>
        <select id="wAnimalPart">
          <option value="">— tsy voafaritra —</option>
          ${ANIMAL_PARTS.map((p) => `<option value="${p}" ${d.animalPart===p?"selected":""}>${ANIMAL_PART_LABELS[p]}</option>`).join("")}
        </select>
      </div>
      <p class="muted small">Ny fomba fihinanana (Halal, Sabatista...) dia safidianina any amin'ny dingana manaraka, tsy eto.</p>
    `);
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.draft.animalSource = document.getElementById("wAnimalSource").value;
      this.draft.animalPart = document.getElementById("wAnimalPart").value;
      this.nextStep();
    });
  },

  /* ---- 4. Fotoana ---- */
  stepFotoana() {
    const d = this.draft;
    this.wizardShell("4 — Fotoana", `
      <div class="field">
        <label>Amin'ny fotoana inona no hanaovana an'ity laoka ity ? (safidio maro)</label>
        <div class="choice-grid" id="wMoments">
          ${MEAL_MOMENTS.map((m) => `<button type="button" class="choice-chip ${d.moment.includes(m) ? "active" : ""}" data-value="${m}">${MEAL_MOMENT_LABELS[m]}</button>`).join("")}
        </div>
      </div>
    `);
    document.querySelectorAll("#wMoments .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => btn.classList.toggle("active"));
    });
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const selected = [...document.querySelectorAll("#wMoments .choice-chip.active")].map((b) => b.dataset.value);
      if (selected.length === 0) return this.showWizError("Safidio farafahakeliny fotoana iray.");
      this.draft.moment = selected;
      this.nextStep();
    });
  },

  /* ---- 5. Atao / mode de préparation ---- */
  stepAtao() {
    const d = this.draft;
    const primaryModes = ["RITRA", "RONY", "KETSAKETSA", "KIENDY"];
    const otherModes = DISH_COOKING_MODES.filter((m) => !primaryModes.includes(m));
    this.wizardShell("5 — Atao (fomba fanaovana)", `
      <div class="field">
        <label for="wAtao">Fomba fanaovana</label>
        <select id="wAtao">
          <optgroup label="Fomba fototra">
            ${primaryModes.map((m) => `<option value="${m}" ${d.type===m?"selected":""}>${COOKING_MODE_LABELS[m]}</option>`).join("")}
          </optgroup>
          <optgroup label="Hafa">
            ${otherModes.map((m) => `<option value="${m}" ${d.type===m?"selected":""}>${COOKING_MODE_LABELS[m]}</option>`).join("")}
          </optgroup>
        </select>
      </div>
    `);
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.draft.type = document.getElementById("wAtao").value;
      if (this.draft.dishSubCategory === "laoka_classique") {
        this.draft.dishSubCategory = this.dishSubCategoryFromCookingMode(this.draft.type);
      }
      this.nextStep();
    });
  },

  /* ---- 6. Fangarony ---- */
  stepFangarony() {
    const d = this.draft;
    this.wizardShell("6 — Fangarony", `
      <div class="field">
        <label>Fangarony (safidio maro, na ampio hafa)</label>
        <div class="choice-grid" id="wFangaronyRef">
          ${FANGARONY_REFERENCE.map((f) => `<button type="button" class="choice-chip ${d.fangarony.some(x=>x.id===f.id)?"active":""}" data-id="${f.id}" data-name="${f.name}">${f.name}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>Ampio fangarony hafa (soraty malalaka)</label>
        <div id="wFangaronyCustomList">
          ${d.fangarony.filter((f) => !FANGARONY_REFERENCE.some((r) => r.id === f.id)).map((f) => `<input type="text" class="wFangaronyCustomInput" value="${f.name}" placeholder="ex : sakay maitso">`).join("")}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="wAddFangarony">+ Ampio</button>
      </div>
    `);
    document.querySelectorAll("#wFangaronyRef .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => btn.classList.toggle("active"));
    });
    document.getElementById("wAddFangarony").addEventListener("click", () => {
      document.getElementById("wFangaronyCustomList").insertAdjacentHTML("beforeend",
        `<input type="text" class="wFangaronyCustomInput" value="" placeholder="ex : sakay maitso">`);
    });
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const fromRef = [...document.querySelectorAll("#wFangaronyRef .choice-chip.active")].map((b) => ({ id: b.dataset.id, name: b.dataset.name }));
      const custom = [...document.querySelectorAll(".wFangaronyCustomInput")].map((i) => i.value.trim()).filter(Boolean).map((name, idx) => ({ id: "custom_fang_" + idx, name }));
      this.draft.fangarony = [...fromRef, ...custom];
      this.nextStep();
    });
  },

  /* ---- 7. Sauce / épices / aromates ---- */
  stepSauceEpices() {
    const d = this.draft;
    this.wizardShell("7 — Ro / zava-manitra", `
      <div class="field">
        <label>Sauce / base (safidio maro)</label>
        <div class="choice-grid" id="wSauceRef">
          ${SAUCE_BASE_REFERENCE.map((s) => `<button type="button" class="choice-chip ${d.sauceItems.some(x=>x.id===s.id)?"active":""}" data-id="${s.id}" data-name="${s.name}">${s.name}</button>`).join("")}
        </div>
        <input type="text" id="wSauceOther" placeholder="Sauce hafa (soraty malalaka)" value="${d.sauce}">
      </div>
      <div class="field">
        <label>Épices / zava-manitra (safidio maro)</label>
        <div class="choice-grid" id="wSpiceRef">
          ${SPICES_REFERENCE.map((s) => `<button type="button" class="choice-chip ${d.spiceItems.some(x=>x.id===s.id)?"active":""}" data-id="${s.id}" data-name="${s.name}">${s.name}</button>`).join("")}
        </div>
        <input type="text" id="wSpiceOther" placeholder="Épices hafa (soraty malalaka)" value="${d.spices}">
      </div>
    `);
    document.querySelectorAll("#wSauceRef .choice-chip, #wSpiceRef .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => btn.classList.toggle("active"));
    });
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.draft.sauceItems = [...document.querySelectorAll("#wSauceRef .choice-chip.active")].map((b) => ({ id: b.dataset.id, name: b.dataset.name }));
      this.draft.spiceItems = [...document.querySelectorAll("#wSpiceRef .choice-chip.active")].map((b) => ({ id: b.dataset.id, name: b.dataset.name }));
      this.draft.sauce = document.getElementById("wSauceOther").value.trim();
      this.draft.spices = document.getElementById("wSpiceOther").value.trim();
      this.nextStep();
    });
  },

  /* ---- 8. Compatibilité en pourcentage ----
     Simplifié à la demande : on coche seulement (comme pour "atao la recette"), sans liste
     déroulante par produit à chercher un par un. Les groupes alimentaires génériques
     (DISH_INGREDIENT_TYPES : Legioma, Anana, Voamaina...) remplacent la sélection produit par
     produit — cohérent avec le formulaire Produits (ui-admin.js openProductForm). */
  stepCompatibilite() {
    const d = this.draft;
    const minLines = 4;
    const customLines = d.incompatibleCustom.length >= minLines
      ? d.incompatibleCustom
      : [...d.incompatibleCustom, ...Array(minLines - d.incompatibleCustom.length).fill(null).map(() => ({ text: "", percentage: 100 }))];
    // Rétrocompatibilité : si des incompatibleProducts (ancien format par productId) existent déjà
    // sur ce brouillon (édition d'une recette créée avant ce changement), on les convertit en
    // groupes alimentaires pour l'affichage coché, sans perdre l'information.
    const preselectedGroups = d.incompatibleTypeGroups && d.incompatibleTypeGroups.length
      ? d.incompatibleTypeGroups
      : [...new Set(d.incompatibleProducts.map((ip) => {
          const p = DATA.getProduct(ip.productId);
          return p && p.ingredientType;
        }).filter(Boolean))];
    const preselectedCookingModes = d.incompatibleTypes.map((it) => it.typeId);

    this.wizardShell("8 — Tsy mifanaraka amin'inona", `
      <div class="field">
        <label>Vondrona sakafo tsy mifanaraka (safidio fotsiny)</label>
        <div class="choice-grid" id="wIncGroups">
          ${DISH_INGREDIENT_TYPES.map((t) => `<button type="button" class="choice-chip ${preselectedGroups.includes(t)?"active":""}" data-value="${t}">${DISH_INGREDIENT_TYPE_LABELS[t]}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>Atao (mode de cuisson) tsy mifanaraka (safidio fotsiny)</label>
        <div class="choice-grid" id="wIncCookingModes">
          ${DISH_COOKING_MODES.map((m) => `<button type="button" class="choice-chip ${preselectedCookingModes.includes(m)?"active":""}" data-value="${m}">${COOKING_MODE_LABELS[m]}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label for="wIncPercent">Tahan'ny tsy fifanarahana (%) — mihatra amin'izay voafidy etsy ambony</label>
        <select id="wIncPercent">
          ${COMPATIBILITY_PERCENTAGES.map((p) => `<option value="${p}" ${p===(d.incompatiblePercentage||100)?"selected":""}>${p}%</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Hafa tsy voatanisa (soraty malalaka, farafahakeliny ${minLines} andalana)</label>
        <div id="wIncCustomList">
          ${customLines.map((c, idx) => this.incompatibleCustomRowHTML(c, idx)).join("")}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="wAddCustomLine">+ Ampio andalana</button>
      </div>
      <p class="muted small">100% = tsy azo atao mihitsy ny miaraka. 80% = tena tsy tokony. 50% = antonony. 20% = kely. 0% = fampahalalana fotsiny.</p>
    `);

    const percentOptionsHTML = (selected) => COMPATIBILITY_PERCENTAGES.map((p) => `<option value="${p}" ${p===selected?"selected":""}>${p}%</option>`).join("");
    document.querySelectorAll(".wIncCustomPercent").forEach((sel) => { sel.innerHTML = percentOptionsHTML(Number(sel.dataset.value) || 100); });

    document.querySelectorAll("#wIncGroups .choice-chip, #wIncCookingModes .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => btn.classList.toggle("active"));
    });

    document.getElementById("wAddCustomLine").addEventListener("click", () => {
      const list = document.getElementById("wIncCustomList");
      const idx = list.children.length;
      list.insertAdjacentHTML("beforeend", this.incompatibleCustomRowHTML({ text: "", percentage: 100 }, idx));
      const sel = list.lastElementChild.querySelector(".wIncCustomPercent");
      sel.innerHTML = percentOptionsHTML(100);
    });

    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const percentage = Number(document.getElementById("wIncPercent").value);
      this.draft.incompatiblePercentage = percentage;
      this.draft.incompatibleTypeGroups = [...document.querySelectorAll("#wIncGroups .choice-chip.active")].map((b) => b.dataset.value);
      // Conserve le format de stockage existant (incompatibleProducts: [{productId, percentage}])
      // pour rester compatible avec RECO/incompatibleWith : on y place tous les produits par défaut
      // appartenant aux groupes alimentaires cochés, avec le pourcentage choisi.
      const groupSet = new Set(this.draft.incompatibleTypeGroups);
      this.draft.incompatibleProducts = groupSet.size
        ? DATA.state.products.filter((p) => p.ingredientType && groupSet.has(p.ingredientType)).map((p) => ({ productId: p.id, percentage }))
        : [];
      this.draft.incompatibleTypes = [...document.querySelectorAll("#wIncCookingModes .choice-chip.active")].map((b) => ({ typeId: b.dataset.value, percentage }));
      this.draft.incompatibleCustom = [...document.querySelectorAll("#wIncCustomList .inc-row")].map((row) => ({
        text: row.querySelector(".wIncCustomText").value.trim(),
        percentage: Number(row.querySelector(".wIncCustomPercent").value),
      })).filter((x) => x.text);
      this.nextStep();
    });
  },

  incompatibleCustomRowHTML(c, idx) {
    return `
      <div class="field-row inc-row" data-idx="${idx}">
        <input type="text" class="wIncCustomText" value="${c.text || ""}" placeholder="ex : ronono">
        <select class="wIncCustomPercent" data-value="${c.percentage}"></select>
      </div>
    `;
  },

  /* ---- 9. Quantité, unité et prix ---- */
  stepQuantitePrix() {
    const d = this.draft;
    this.wizardShell("9 — Habetsahana sy vidiny", `
      <div class="field-row">
        <div class="field">
          <label for="wQty">Habetsahana</label>
          <input type="number" id="wQty" min="0.001" step="0.001" value="${d.qty}" required>
          <select id="wFraction" class="fraction-select">
            <option value="">— ou fraction —</option>
            ${FRACTION_PRESETS.map((f) => `<option value="${f.value}">${f.label}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="wUnit">Fomba fandrefesana</label>
          <select id="wUnit">
            ${MEASURE_UNITS.map((u) => `<option value="${u}" ${d.unit===u?"selected":""}>${UNIT_LABELS[u]}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field">
        <label for="wPrice">Vidiny (indicatif, ho an'ny habetsahana voafaritra etsy ambony)</label>
        <div class="input-suffix">
          <input type="number" id="wPrice" min="0" step="50" value="${d.price}" required>
          <span class="suffix">Ar</span>
        </div>
        <p class="muted small">Prix indicatif — modifiable dans Paramètres. ${d.mainIngredientId ? "Le prix de l'ingrédient principal sélectionné pourra être utilisé automatiquement par les calculs." : ""}</p>
      </div>
    `);
    if (d.mainIngredientId && !d.price) {
      const mainProduct = DATA.getProduct(d.mainIngredientId);
      if (mainProduct) {
        document.getElementById("wPrice").value = mainProduct.basePrice;
        document.getElementById("wUnit").value = mainProduct.unit;
      }
    }
    const fractionSelect = document.getElementById("wFraction");
    fractionSelect.addEventListener("change", () => {
      if (fractionSelect.value) document.getElementById("wQty").value = Number(fractionSelect.value);
    });
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const qty = Number(document.getElementById("wQty").value);
      const price = Number(document.getElementById("wPrice").value);
      if (!qty || qty <= 0) return this.showWizError("Tsy azo atao ny habetsahana latsaka zero.");
      if (price < 0) return this.showWizError("Tsy azo atao ny vidiny latsaka zero.");
      this.draft.qty = qty;
      this.draft.unit = document.getElementById("wUnit").value;
      this.draft.priceUnit = this.draft.unit;
      this.draft.price = price;
      this.nextStep();
    });
  },

  /* ---- 10. Régime alimentaire ---- */
  stepRegime() {
    const d = this.draft;
    this.wizardShell("10 — Fomba fihinanana", `
      <div class="field">
        <label>Ho an'iza ity laoka ity ? (safidio maro)</label>
        <div class="choice-grid" id="wDiet">
          ${DIET_OPTIONS.map((r) => `<button type="button" class="choice-chip ${d.diet.includes(r)?"active":""}" data-value="${r}">${DIET_LABELS[r]}</button>`).join("")}
        </div>
      </div>
      <div class="field hidden" id="wDietCustomWrap">
        <label for="wDietCustom">Précision (régime personnalisé)</label>
        <input type="text" id="wDietCustom" value="${d.dietCustom}">
      </div>
      <div class="field">
        <label class="toggle-row">
          <span>Misy henakisoa (porc)</span>
          <input type="checkbox" id="wPork" ${d.containsPork ? "checked" : ""}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    `);
    const customWrap = document.getElementById("wDietCustomWrap");
    const syncCustomVisibility = () => {
      const active = [...document.querySelectorAll("#wDiet .choice-chip.active")].map((b) => b.dataset.value);
      customWrap.classList.toggle("hidden", !active.includes("personnalise"));
    };
    document.querySelectorAll("#wDiet .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => { btn.classList.toggle("active"); syncCustomVisibility(); });
    });
    syncCustomVisibility();
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const selected = [...document.querySelectorAll("#wDiet .choice-chip.active")].map((b) => b.dataset.value);
      this.draft.diet = selected.length ? selected : ["standard"];
      this.draft.dietCustom = document.getElementById("wDietCustom").value.trim();
      this.draft.containsPork = document.getElementById("wPork").checked;
      this.nextStep();
    });
  },

  /* ---- 11. Saison / calendrier ---- */
  stepSaison() {
    const d = this.draft;
    this.wizardShell("11 — Vanim-potoana", `
      <div class="field">
        <label>Amin'ny vanim-potoana inona no mety indrindra an'ity laoka ity ? (tsy voatery hosafidianina, azo avela banga)</label>
        <div class="choice-grid" id="wSeason">
          ${SEASONS.map((s) => `<button type="button" class="choice-chip ${d.season.includes(s)?"active":""}" data-value="${s}">${SEASON_LABELS[s]}</button>`).join("")}
        </div>
      </div>
    `);
    document.querySelectorAll("#wSeason .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => btn.classList.toggle("active"));
    });
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.draft.season = [...document.querySelectorAll("#wSeason .choice-chip.active")].map((b) => b.dataset.value);
      this.nextStep();
    });
  },

  /* ---- 12. Recette complète ---- */
  stepRecette() {
    const d = this.draft;
    const products = DATA.state.products;
    this.wizardShell("12 — Ny fomba fanaovana", `
      <div class="field-row">
        <div class="field">
          <label for="wTime">Faharetan'ny fanaovana (min)</label>
          <input type="number" id="wTime" min="0" value="${d.time}">
        </div>
        <div class="field">
          <label for="wServings">Isan'olona</label>
          <input type="number" id="wServings" min="1" value="${d.servings}">
        </div>
      </div>
      <div class="field">
        <label>Akora ilaina (safidy)</label>
        <div id="wRecipeIngredientsList">
          ${d.recipeIngredients.map((ri, idx) => this.recipeIngredientRowHTML(ri, idx, products)).join("")}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="wAddIngredient">+ Ampio akora</button>
      </div>
      <div class="field">
        <label>Dingana</label>
        <div id="wStepsList">
          ${d.steps.map((s, idx) => `<input type="text" class="wStepInput" data-idx="${idx}" value="${s}" placeholder="Dingana ${idx + 1}">`).join("")}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="wAddStep">+ Ampio dingana</button>
      </div>
      <div class="field">
        <label for="wNotes">Fanamarihana (safidy)</label>
        <input type="text" id="wNotes" value="${d.notes}" placeholder="ex : mahery indrindra amin'ny hariva">
      </div>
    `);
    document.getElementById("wAddIngredient").addEventListener("click", () => {
      const list = document.getElementById("wRecipeIngredientsList");
      const idx = list.children.length;
      list.insertAdjacentHTML("beforeend", this.recipeIngredientRowHTML({ productId: products[0] ? products[0].id : "", qty: 0.1, unit: "kg" }, idx, products));
    });
    document.getElementById("wAddStep").addEventListener("click", () => {
      const list = document.getElementById("wStepsList");
      const idx = list.children.length;
      list.insertAdjacentHTML("beforeend", `<input type="text" class="wStepInput" data-idx="${idx}" value="" placeholder="Dingana ${idx + 1}">`);
    });
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.draft.time = Number(document.getElementById("wTime").value) || 0;
      this.draft.servings = Number(document.getElementById("wServings").value) || 4;
      this.draft.recipeIngredients = [...document.querySelectorAll("#wRecipeIngredientsList .ing-row")].map((row) => ({
        productId: row.querySelector(".wIngProduct").value,
        qty: Number(row.querySelector(".wIngQty").value) || 0,
        unit: row.querySelector(".wIngUnit").value,
      })).filter((x) => x.productId && x.qty > 0);
      this.draft.steps = [...document.querySelectorAll(".wStepInput")].map((i) => i.value.trim()).filter(Boolean);
      this.draft.notes = document.getElementById("wNotes").value.trim();
      this.nextStep();
    });
  },

  recipeIngredientRowHTML(ri, idx, products) {
    return `
      <div class="field-row ing-row" data-idx="${idx}">
        <select class="wIngProduct">
          ${products.map((p) => `<option value="${p.id}" ${ri.productId===p.id?"selected":""}>${p.name}</option>`).join("")}
        </select>
        <input type="number" class="wIngQty" min="0" step="0.01" value="${ri.qty}">
        <select class="wIngUnit">
          ${MEASURE_UNITS.map((u) => `<option value="${u}" ${ri.unit===u?"selected":""}>${UNIT_LABELS[u]}</option>`).join("")}
        </select>
      </div>
    `;
  },

  /* ---- 13. Récapitulatif final ---- */
  stepRecap() {
    const d = this.draft;
    const estimatedCost = d.recipeIngredients.length
      ? d.recipeIngredients.reduce((sum, ri) => {
          const p = DATA.getProduct(ri.productId);
          return sum + (p ? CALC.priceForQty(p, ri.qty, ri.unit) : 0);
        }, 0)
      : d.price;
    this.wizardShell("13 — Hamarina", `
      <div class="card">
        <p><strong>${d.photo} ${d.name}</strong></p>
        <p>Rôle : ${FOOD_ROLE_LABELS[d.foodRole] || d.foodRole} — Catégorie : ${DISH_CATEGORY_LABELS[d.dishSubCategory] || d.dishSubCategory}</p>
        <p>Akora fototra : ${DISH_INGREDIENT_TYPE_LABELS[d.ingredientType] || d.ingredientType}${d.mainIngredientId ? " — " + (DATA.getProduct(d.mainIngredientId)||{}).name : ""}</p>
        ${d.animalSource || d.animalPart ? `<p>Biby/tapany : ${ANIMAL_SOURCE_LABELS[d.animalSource] || "—"} / ${ANIMAL_PART_LABELS[d.animalPart] || "—"}</p>` : ""}
        <p>Fotoana : ${d.moment.map((m) => MEAL_MOMENT_LABELS[m]).join(", ") || "—"}</p>
        <p>Atao : ${COOKING_MODE_LABELS[d.type]}</p>
        <p>Fangarony : ${d.fangarony.map((f) => f.name).join(", ") || "—"}</p>
        <p>Sauce : ${[...d.sauceItems.map((s) => s.name), d.sauce].filter(Boolean).join(", ") || "—"} — Épices : ${[...d.spiceItems.map((s) => s.name), d.spices].filter(Boolean).join(", ") || "—"}</p>
        <p>Tsy mifanaraka : ${[
          ...d.incompatibleProducts.map((ip) => `${(DATA.getProduct(ip.productId) || {}).name || ip.productId} (${ip.percentage}%)`),
          ...d.incompatibleTypes.map((it) => `${COOKING_MODE_LABELS[it.typeId] || it.typeId} (${it.percentage}%)`),
          ...d.incompatibleCustom.filter((c) => c.text).map((c) => `${c.text} (${c.percentage}%)`),
        ].join(", ") || "—"}</p>
        <p>Habetsahana : ${d.qty} ${UNIT_LABELS[d.unit] || d.unit} — Vidiny indicatif : ${CALC.formatAr(d.price)}</p>
        <p class="muted small">Prix indicatif — modifiable dans Paramètres.</p>
        <p>Fomba fihinanana : ${d.diet.map((x) => DIET_LABELS[x] || x).join(", ") || "—"}${d.dietCustom ? " (" + d.dietCustom + ")" : ""}</p>
        <p>Vanim-potoana : ${d.season.map((s) => SEASON_LABELS[s]).join(", ") || "—"}</p>
        ${d.recipeIngredients.length ? `<p>Akora amin'ny recette : ${d.recipeIngredients.length} — Coût estimé : ${CALC.formatAr(estimatedCost)}</p>` : ""}
        ${d.steps.length ? `<p>Dingana : ${d.steps.length}</p>` : ""}
        ${d.notes ? `<p>Fanamarihana : ${d.notes}</p>` : ""}
      </div>
    `, { lastLabel: "✅ Enregistrer le laoka" });
    document.getElementById("wizardStepForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveDraftAsRecipe();
    });
  },

  /* ------------------- SAUVEGARDE ------------------- */
  saveDraftAsRecipe() {
    const d = this.draft;

    let legacyDishCategory = "laoka";
    if (d.dishSubCategory === "achard") legacyDishCategory = "achard";
    // "ro_matsatso" est une sous-catégorie de ro_mazava (bouillon clair) — sans ce cas, une recette
    // Ro Matsatso ajoutée via RO_MAZAVA_UI atterrissait dans DATA.state.recipes au lieu de
    // DATA.state.roMazavaRecipes (corrigé lors de l'audit).
    else if (d.dishSubCategory === "ro_mazava" || d.dishSubCategory === "ro_matsatso") legacyDishCategory = "ro_mazava";
    else if (d.dishSubCategory === "ambany_tanana") legacyDishCategory = "ambany_tanana";

    const recipeData = {
      name: d.name,
      photo: d.photo || "🍽️",
      type: d.type,
      cookingMethod: d.type,
      dishCategory: legacyDishCategory,
      dishSubCategory: d.dishSubCategory,
      foodRole: d.foodRole,
      ingredientType: d.ingredientType,
      mainIngredientId: d.mainIngredientId || null,
      animalSource: d.animalSource || null,
      animalPart: d.animalPart || null,
      moment: d.moment.length ? d.moment : ["atoandro", "hariva"],
      time: d.time,
      servings: d.servings,
      diet: d.diet.length ? d.diet : ["standard"],
      dietCustom: d.dietCustom || null,
      containsPork: d.containsPork,
      season: d.season,
      fangarony: d.fangarony,
      sauceItems: d.sauceItems,
      spiceItems: d.spiceItems,
      sauce: d.sauce,
      spices: d.spices,
      incompatibleWith: {
        products: d.incompatibleProducts,
        types: d.incompatibleTypes,
        custom: d.incompatibleCustom.filter((c) => c.text),
        productIds: d.incompatibleProducts.filter((p) => p.percentage >= 100).map((p) => p.productId),
        typeIds: d.incompatibleTypes.filter((t) => t.percentage >= 100).map((t) => t.typeId),
      },
      incompatibleTypeGroups: d.incompatibleTypeGroups,
      incompatiblePercentage: d.incompatiblePercentage,
      ingredients: d.recipeIngredients.length ? d.recipeIngredients : [],
      steps: d.steps.length ? d.steps : [],
      notes: d.notes || "",
      manualPrice: d.recipeIngredients.length ? null : d.price,
      manualPriceUnit: d.priceUnit,
      manualQty: d.qty,
    };

    // MODE ÉDITION (bouton "Modifier" d'Admin > Recettes) : on met à jour la recette existante en
    // place (même id, même tableau d'origine) au lieu d'en créer une nouvelle. On cherche l'id
    // dans les deux tableaux possibles (recipes / roMazavaRecipes) car la catégorie a pu changer
    // pendant l'édition (ex. un laoka classique requalifié en ro_mazava).
    if (this.editingRecipeId) {
      const id = this.editingRecipeId;
      let idx = DATA.state.recipes.findIndex((r) => r.id === id);
      let list = DATA.state.recipes;
      if (idx === -1) {
        idx = DATA.state.roMazavaRecipes.findIndex((r) => r.id === id);
        list = DATA.state.roMazavaRecipes;
      }
      if (idx === -1) {
        UI.toast("Recette introuvable — impossible d'enregistrer la modification.");
        return;
      }
      const targetListForNewCategory = recipeData.dishCategory === "ro_mazava" ? DATA.state.roMazavaRecipes : DATA.state.recipes;
      if (targetListForNewCategory !== list) {
        // La catégorie a changé pendant l'édition : on retire de l'ancienne liste et on pousse
        // dans la nouvelle, plutôt que de laisser une copie obsolète dans l'ancienne.
        list.splice(idx, 1);
        targetListForNewCategory.push(Object.assign({ id }, recipeData));
      } else {
        Object.assign(list[idx], recipeData);
      }
      DATA.saveData();
      UI.toast(`✅ ${recipeData.name} nohavaozina.`);
      this.returnFromForm();
      return;
    }

    const newRecipe = Object.assign({ id: "r_" + Date.now() }, recipeData);

    if (newRecipe.dishCategory === "ro_mazava") {
      DATA.state.roMazavaRecipes.push(newRecipe);
    } else {
      DATA.state.recipes.push(newRecipe);
    }
    DATA.saveData();
    UI.toast(`✅ ${newRecipe.name} nampidirina.`);
    PROFIL_UI.renderTab("parametres");
  },
};
