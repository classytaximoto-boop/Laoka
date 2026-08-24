/* ============================================================
   LAOKA — ui-laoka-form.js
   Écran « Paramètres > Ajouter un laoka » — composition par cases à cocher.

   RÈGLE : les 13 étapes détaillées (identité, ingrédient, animal, fotoana, atao, fangarony,
   sauce/épices, compatibilité, quantité/prix, régime, saison, recette, récap) vivent désormais
   UNIQUEMENT dans la fiche Produit (Paramètres > Produits > openProductForm, ui-admin.js).
   Cet écran ne fait plus que COMPOSER un laoka à partir de produits déjà enregistrés :
   - Nom du laoka (texte, en haut)
   - Produits à cocher (plusieurs, comme "akora fototra" mais multi-sélection)
   - Mode de cuisson (atao) à cocher (un seul)
   - Fotoana à cocher (inchangé)
   - Sauce à cocher (tirée des produits catégorie sauce / SAUCE_BASE_REFERENCE)
   - Mifanaraka / tsy mifanaraka : hérité automatiquement des produits cochés (inchangé côté
     moteur, juste plus resaisi ici)
   - Étapes : générées automatiquement à partir du mode de cuisson coché (COOKING_MODES_DETAIL),
     jamais retapées à la main
   - Habetsahana : uniquement le nombre de personnes — le prix total est calculé par
     l'application à partir du prix par personne (qtyPerPerson × basePrice) de chaque produit
     coché, jamais ressaisi manuellement.

   RÈGLE (inchangée) : le riz/vary, mangahazo, katsaka, vomanga et saonjo (menu principal) ne
   sont jamais proposés ici comme laoka.
   ============================================================ */

const LAOKA_FORM_UI = {
  draft: null,
  editingRecipeId: null,

  emptyDraft() {
    return {
      name: "",
      photo: "🍽️",
      // Photo réelle importée par l'utilisateur (image, encodée en base64/data URL), distincte de
      // `photo` (emoji d'icône). null tant qu'aucune photo n'a été importée pour ce laoka — dans
      // ce cas l'emoji continue d'être utilisé partout comme avant. Affichée en plus, en bas de
      // la carte de résultat et de la fiche détail, uniquement pour le laoka qui la possède.
      photoImage: null,
      productIds: [],        // produits cochés composant le laoka
      type: "RITRA",           // atao (cookingMethod), un seul choix
      moment: [],                // fotoana, plusieurs choix
      sauceProductIds: [],         // produits "sauce" cochés (catégorie sauce / SAUCE_BASE_REFERENCE)
      servings: 1,                   // habetsahana = nombre de personnes uniquement
      notes: "",
      // Forçage optionnel de dishSubCategory/dishCategory, utilisé par RO_MAZAVA_UI pour créer un
      // "ro_mazava"/"ro_matsatso" (catégories qui ne se déduisent pas du seul mode de cuisson RONY,
      // partagé avec les rony "laoka classique"). null = déduction normale depuis `type`.
      dishSubCategoryOverride: null,
      // Case à cocher simple du formulaire : "ce laoka est un Lasary". Même principe que
      // Product.forLasary (ADMIN > Produits), mais ici au niveau du plat lui-même. Prioritaire
      // sur dishSubCategoryOverride si les deux sont présents (cas normalement exclusif en pratique).
      isLasary: false,
    };
  },

  /* ------------------- ENTRÉE ------------------- */
  render() {
    this.draft = this.emptyDraft();
    this.editingRecipeId = null;
    this.renderComposition();
  },

  /** Ouvre l'écran de composition pré-rempli avec une recette existante, pour modification
      (bouton "Modifier" d'Admin > Recettes). onDone(optionnel) est rappelé après sauvegarde, en
      mode édition, pour permettre à l'appelant de rafraîchir sa propre vue (ex. ADMIN.renderRecettesTable),
      puisqu'ici on ne retourne pas vers PROFIL_UI comme le fait le flux d'ajout normal. */
  startEdit(recipe, onDone) {
    this.draft = {
      name: recipe.name || "",
      photo: recipe.photo || "🍽️",
      photoImage: recipe.photoImage || null,
      productIds: Array.isArray(recipe.ingredients) ? recipe.ingredients.map((i) => i.productId) : [],
      type: recipe.type || recipe.cookingMethod || "RITRA",
      moment: Array.isArray(recipe.moment) ? [...recipe.moment] : [],
      sauceProductIds: Array.isArray(recipe.sauceProductIds) ? [...recipe.sauceProductIds] : [],
      servings: recipe.servings || 1,
      notes: recipe.notes || "",
      dishSubCategoryOverride: recipe.dishSubCategoryOverride || null,
      isLasary: recipe.dishSubCategory === "lasary",
    };
    this.editingRecipeId = recipe.id;
    this._editReturnCallback = onDone || null;
    // La composition s'affiche dans #profilContent (dans #screen-profil) : on doit d'abord naviguer
    // vers cet écran, même si l'édition a été lancée depuis Admin, sinon aucun conteneur n'existe.
    UI.showScreen("profil");
    PROFIL_UI.render();
    this.renderComposition();
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

  /** Retour arrière commun : en mode édition (ouvert depuis Admin > Recettes), on revient à Admin
      plutôt qu'à Profil > Paramètres, sinon comportement historique inchangé. */
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

  /** Estime le prix total du laoka pour d.servings personnes, à partir des produits cochés :
   *  chaque produit apporte (qtyPerPerson || valeur par défaut selon unité) × servings, valorisé
   *  à son basePrice — sauf si le produit est en mode forfait (product.hasForfait), auquel cas
   *  CALC.priceForQty applique directement le palier correspondant à `servings` personnes.
   *  C'est l'application qui calcule — jamais resaisi manuellement ici.
   *  Sel et huile (CALC.PRICE_EXCLUDED_PRODUCT_IDS) sont exclus du prix : cochés dans "Akora
   *  ampiasaina", ils apparaissent dans la liste des ingrédients de la recette mais ne comptent
   *  jamais dans le coût par plat/par personne. */
  estimateCost(productIds, servings) {
    const defaultQtyPerPerson = { kg: 0.1, l: 0.05, piece: 1, bunch: 0.25, kapoaka: 1, tsongo: 1, madco: 1, tanana: 1 };
    let total = 0;
    const lines = [];
    productIds.forEach((id) => {
      if (CALC.PRICE_EXCLUDED_PRODUCT_IDS.includes(id)) return;
      const p = DATA.getProduct(id);
      if (!p) return;
      const qtyPerPerson = typeof p.qtyPerPerson === "number" && p.qtyPerPerson > 0 ? p.qtyPerPerson : (defaultQtyPerPerson[p.unit] || 0.1);
      const qty = qtyPerPerson * (servings || 1);
      const cost = CALC.priceForQty(p, qty, p.unit, servings);
      total += cost;
      lines.push({ productId: id, name: p.name, qty, unit: p.unit, cost });
    });
    return { total, lines };
  },

  /** Génère un texte d'étapes simple à partir du mode de cuisson coché (COOKING_MODES_DETAIL) et
   *  des produits sélectionnés — jamais retapé à la main, comme demandé.
   *  NOTE "Standard" : ce mode n'a pas de traitement spécial ici — c'est déjà son comportement natif
   *  qui le rend "passe-partout" : COOKING_MODES_DETAIL.STANDARD n'a aucune restriction déclarée
   *  (compatibleTypes couvre tous les groupes alimentaires) et aucune règle cookingCompatibility/
   *  spiceCompatibility n'est définie pour mode="STANDARD" dans data.js — donc une recette Standard
   *  n'est jamais pénalisée/exclue par ces tables (voir DATA.hasForbiddenCookingOrSpice /
   *  getCookingCompatibilityPenalty, qui lisent recipe.cookingMethod). dishSubCategoryFromCookingMode
   *  route STANDARD vers "laoka_classique" (fallback neutre), donc la recette n'apparaît pas non
   *  plus faussement dans les cadres du dashboard Rony/Ritra/Ketsaketsa. */
  generateSteps(type, productIds) {
    const detail = COOKING_MODES_DETAIL[type];
    const productNames = productIds.map((id) => (DATA.getProduct(id) || {}).name).filter(Boolean);
    const steps = [];
    steps.push(`Diovina tsara ny akora rehetra ampiasaina${productNames.length ? " (" + productNames.join(", ") + ")" : ""}.`);
    if (detail && detail.description) {
      steps.push(detail.description);
    }
    steps.push(`Ahandroina araka ny fomba "${(detail && detail.fr) || COOKING_MODE_LABELS[type] || type}" mandra-masaka tsara.`);
    return steps;
  },

  /* ------------------- COMPOSITION (catégories cliquables + cases à cocher) ------------------- */
  renderComposition() {
    const d = this.draft;
    // Filtrage par usageTags (correction #6) : un produit doit être tagué "laoka" pour apparaître
    // dans "Akora ampiasaina" (ingrédients du plat), et tagué "sauce" pour apparaître dans
    // "Ro / sauce". Ce système remplace complètement l'ancien SAUCE_BASE_REFERENCE : la sauce
    // proposée ici est désormais purement déduite des produits eux-mêmes (product.usageTags),
    // plus d'une liste séparée codée en dur.
    // Compatibilité ascendante : un produit sans usageTags du tout (créé avant cette correction)
    // reste visible dans "Akora ampiasaina" comme avant, pour ne rien casser silencieusement —
    // seul un produit explicitement tagué "sauce" (et non "laoka") sort de cette liste.
    const allProductsRaw = DATA.state.products.filter((p) => p.foodRole !== "menu_principal");
    const allProducts = allProductsRaw.filter((p) => !Array.isArray(p.usageTags) || p.usageTags.length === 0 || p.usageTags.includes("laoka"));
    const sauceProducts = allProductsRaw.filter((p) => Array.isArray(p.usageTags) && p.usageTags.includes("sauce"));

    // Regroupement par catégorie (viandes, légumes, poisson...) au lieu d'une seule grille plate :
    // trop d'akora pour scroller une liste unique (voir capture utilisateur, écran illisible).
    // Chaque catégorie devient une colonne repliable ; le nombre coché s'affiche dans l'en-tête
    // pour retrouver ses choix sans tout rouvrir. "Ro / sauce" (usageTags "sauce") est traitée
    // comme une colonne de catégorie à part entière, au même titre que viandes/légumes/etc.
    const byCategory = {};
    allProducts.forEach((p) => {
      const cat = p.category || "autres";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    });
    const categoryOrder = Object.keys(CATEGORY_LABELS);
    const sortedCategories = Object.keys(byCategory).sort((a, b) => {
      const ai = categoryOrder.indexOf(a), bi = categoryOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    const categoryColumnHTML = (catKey, label, products, groupId, checkedIds) => `
      <div class="comp-category" data-category="${catKey}">
        <button type="button" class="comp-category-header" data-toggle-category="${catKey}">
          <span>${label}</span>
          <span class="comp-category-count" data-count-for="${catKey}">${products.filter((p) => checkedIds.includes(p.id)).length || ""}</span>
          <span class="comp-category-chevron">›</span>
        </button>
        <div class="comp-category-body hidden" id="compCat_${catKey}">
          ${products.map((p) => `
            <label class="checkbox-row">
              <input type="checkbox" data-group="${groupId}" data-value="${p.id}" ${checkedIds.includes(p.id) ? "checked" : ""}>
              <span>${p.name}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;

    this.screenShell(this.editingRecipeId ? "Modifier ny laoka" : "Ajouter un laoka", `
      <form id="compositionForm" class="form fade-in">
        <div class="field">
          <label for="compName">Anaran'ny laoka</label>
          <input type="text" id="compName" value="${d.name}" required placeholder="ex : Akoho sy voanio">
        </div>

        <div class="field">
          <label for="compPhotoInput">Sary (safidy fanampiny)</label>
          <div id="compPhotoPreviewWrap" class="${d.photoImage ? "" : "hidden"}" style="margin-bottom:8px;">
            <img id="compPhotoPreview" src="${d.photoImage || ""}" alt="" style="max-width:160px;max-height:160px;border-radius:12px;display:block;">
            <button type="button" class="btn-icon danger" id="compPhotoRemove" style="margin-top:6px;">Esory ny sary</button>
          </div>
          <input type="file" id="compPhotoInput" accept="image/*">
        </div>

        <div class="field">
          <label>Akora ampiasaina (safidio ny sokajy, dia cochez ny akora ao anatiny)</label>
          <div class="comp-category-list" id="compProducts">
            ${sortedCategories.map((cat) => categoryColumnHTML(cat, CATEGORY_LABELS[cat] || cat, byCategory[cat], "product", d.productIds)).join("")}
          </div>
        </div>

        <div class="field">
          <label>Atao (fomba fanaovana)</label>
          <p class="muted small">« Standard » = mifanaraka amin'ny fomba fanaovana rehetra (ritra, rony, sns.), tsy safidy manokana.</p>
          <div class="choice-grid" id="compAtao">
            ${DISH_COOKING_MODES.map((m) => `<button type="button" class="choice-chip ${d.type===m?"active":""}" data-value="${m}">${COOKING_MODE_LABELS[m]}</button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label>Fotoana (safidio maro)</label>
          <div class="choice-grid" id="compMoments">
            ${MEAL_MOMENTS.map((m) => `<button type="button" class="choice-chip ${d.moment.includes(m)?"active":""}" data-value="${m}">${MEAL_MOMENT_LABELS[m]}</button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label>Ro / sauce (safidio maro)</label>
          <div class="comp-category-list" id="compSauce">
            ${categoryColumnHTML("sauce", "🍲 Ro / sauce", sauceProducts, "sauce", d.sauceProductIds)}
          </div>
          <p class="muted small">Ny mifanaraka/tsy mifanaraka dia avy amin'ny fiche « Produits » an'ny akora voafidy etsy ambony, tsy averina eto.</p>
        </div>

        <div class="field">
          <label class="checkbox-label">
            <input type="checkbox" id="compIsLasary" ${d.isLasary ? "checked" : ""}>
            🥗 Ity laoka ity dia Lasary
          </label>
        </div>

        <div class="field">
          <p class="muted small" id="compCostPreview">Vidiny voatombana ho an'olona 1 : —</p>
          <p class="muted small">Ny vidiny dia kajian'ny application avy amin'ny vidin'ny akora tsirairay (sy ny forfait raha misy) — tsy soratana eto intsony ny isan'olona ; ho safidianao mandritra ny fikarohana.</p>
        </div>

        <div class="field-error hidden" id="compErr"></div>
        <button type="submit" class="btn btn-primary btn-block">Enregistrer le laoka</button>
      </form>
    `);

    // Ouverture/fermeture d'une colonne catégorie (accordéon) : une seule à la fois par liste
    // (compProducts / compSauce) pour garder l'écran court sur mobile ; cliquer une catégorie déjà
    // ouverte la referme simplement.
    const bindCategoryToggles = (containerId) => {
      document.querySelectorAll(`#${containerId} [data-toggle-category]`).forEach((header) => {
        header.addEventListener("click", () => {
          const cat = header.dataset.toggleCategory;
          const body = document.getElementById("compCat_" + cat);
          const wasOpen = !body.classList.contains("hidden");
          document.querySelectorAll(`#${containerId} .comp-category-body`).forEach((b) => b.classList.add("hidden"));
          if (!wasOpen) body.classList.remove("hidden");
        });
      });
    };
    bindCategoryToggles("compProducts");
    bindCategoryToggles("compSauce");

    // Compteur par catégorie (nombre d'akora cochés) mis à jour à chaque coche/décoche, pour
    // retrouver en un coup d'œil quelles colonnes contiennent déjà une sélection sans les rouvrir.
    const refreshCategoryCount = (containerId) => {
      document.querySelectorAll(`#${containerId} .comp-category`).forEach((col) => {
        const cat = col.dataset.category;
        const checked = col.querySelectorAll("input[type='checkbox']:checked").length;
        const countEl = document.querySelector(`#${containerId} [data-count-for="${cat}"]`);
        if (countEl) countEl.textContent = checked || "";
      });
    };

    document.querySelectorAll("#compProducts input[type='checkbox'], #compSauce input[type='checkbox']").forEach((cb) => {
      cb.addEventListener("change", () => {
        refreshCategoryCount("compProducts");
        refreshCategoryCount("compSauce");
        updateCostPreview();
      });
    });

    document.querySelectorAll("#compAtao .choice-chip, #compMoments .choice-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        // "Atao" : un seul choix actif à la fois (comme un select), les autres se désactivent —
        // "Standard" suit exactement la même règle de sélection unique, seule sa signification à
        // l'enregistrement diffère (voir saveDraftAsRecipe : Standard = compatible avec tous les
        // modes plutôt qu'un mode exclusif).
        if (btn.closest("#compAtao")) {
          document.querySelectorAll("#compAtao .choice-chip").forEach((b) => b.classList.remove("active"));
        }
        btn.classList.toggle("active");
        updateCostPreview();
      });
    });

    const costPreview = document.getElementById("compCostPreview");
    const updateCostPreview = () => {
      const productIds = [...document.querySelectorAll("#compProducts input[type='checkbox']:checked")].map((b) => b.dataset.value);
      const sauceIds = [...document.querySelectorAll("#compSauce input[type='checkbox']:checked")].map((b) => b.dataset.value);
      // Aperçu affiché pour 1 personne (base de la recette) — le vrai nombre de personnes est
      // choisi plus tard, à la recherche (searchFilters.people), et le prix est alors recalculé
      // et mis à l'échelle automatiquement (avec le forfait pris en compte pour les produits
      // concernés, voir CALC.priceForQty).
      const { total } = this.estimateCost([...productIds, ...sauceIds], 1);
      costPreview.textContent = `Vidiny voatombana ho an'olona 1 : ${CALC.formatAr(total)}`;
    };
    updateCostPreview();

    // Import de photo : lecture du fichier choisi en data URL (base64), stockée dans d.photoImage.
    // Pas de redimensionnement/compression ici — cohérent avec le reste de l'app qui n'a pas de
    // traitement d'image ; à surveiller si les photos importées sont volumineuses (taille du
    // localStorage utilisé par DATA.saveData).
    document.getElementById("compPhotoInput").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        d.photoImage = reader.result;
        const preview = document.getElementById("compPhotoPreview");
        preview.src = d.photoImage;
        document.getElementById("compPhotoPreviewWrap").classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    });
    document.getElementById("compPhotoRemove").addEventListener("click", () => {
      d.photoImage = null;
      document.getElementById("compPhotoInput").value = "";
      document.getElementById("compPhotoPreviewWrap").classList.add("hidden");
    });

    document.getElementById("compositionForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const errEl = document.getElementById("compErr");
      const name = document.getElementById("compName").value.trim();
      const productIds = [...document.querySelectorAll("#compProducts input[type='checkbox']:checked")].map((b) => b.dataset.value);
      const type = (document.querySelector("#compAtao .choice-chip.active") || {}).dataset ? document.querySelector("#compAtao .choice-chip.active").dataset.value : null;
      const moment = [...document.querySelectorAll("#compMoments .choice-chip.active")].map((b) => b.dataset.value);
      const sauceProductIds = [...document.querySelectorAll("#compSauce input[type='checkbox']:checked")].map((b) => b.dataset.value);
      // Habetsahana/servings n'est plus saisi ici : la recette est toujours enregistrée avec une
      // base de 1 personne, le prix par personne étant entièrement déduit des produits cochés
      // (qtyPerPerson × basePrice, ou forfait si activé sur le produit). Le nombre de personnes
      // réel est choisi plus tard, à la recherche.
      const servings = 1;

      if (!name) { errEl.textContent = "Tsy azo avela ho banga ny anaran'ny laoka."; errEl.classList.remove("hidden"); return; }
      if (productIds.length === 0) { errEl.textContent = "Safidio farafahakeliny akora iray."; errEl.classList.remove("hidden"); return; }
      if (!type) { errEl.textContent = "Safidio ny atao (fomba fanaovana)."; errEl.classList.remove("hidden"); return; }
      if (moment.length === 0) { errEl.textContent = "Safidio farafahakeliny fotoana iray."; errEl.classList.remove("hidden"); return; }
      if (d.dishSubCategoryOverride === "ro_matsatso" && typeof ROMATSATSO_RULE !== "undefined") {
        const invalid = productIds.filter((id) => !ROMATSATSO_RULE.allowedAnanaProductIds.includes(id));
        if (invalid.length) {
          errEl.textContent = "Ro matsatso dia anana sy rano fotsiny — esory ny akora hafa.";
          errEl.classList.remove("hidden");
          return;
        }
      }
      errEl.classList.add("hidden");

      this.draft = { name, photo: d.photo || "🍽️", photoImage: d.photoImage || null, productIds, type, moment, sauceProductIds, servings, notes: d.notes || "", dishSubCategoryOverride: d.dishSubCategoryOverride || null, isLasary: document.getElementById("compIsLasary").checked };
      this.saveDraftAsRecipe();
    });
  },

  /* ------------------- SAUVEGARDE ------------------- */
  saveDraftAsRecipe() {
    const d = this.draft;
    const allProductIds = [...d.productIds, ...d.sauceProductIds];

    // Hérite ingredientType / dishSubCategory / foodRole / animalSource / diet / containsPork /
    // incompatibleWith depuis les produits cochés (le wizard 13 étapes vit désormais dans la fiche
    // Produit — voir ui-admin.js openProductForm — donc plus resaisi ici).
    const products = d.productIds.map((id) => DATA.getProduct(id)).filter(Boolean);
    const mainProduct = products[0] || null;
    const ingredientType = mainProduct ? (mainProduct.ingredientType || null) : null;
    const dishSubCategory = d.isLasary ? "lasary" : (d.dishSubCategoryOverride || this.dishSubCategoryFromCookingMode(d.type));
    const containsPork = products.some((p) => p.animalSource === "porc");
    const animalSource = mainProduct ? (mainProduct.animalSource || null) : null;

    // Compatibilité héritée : union des groupes alimentaires incompatibles déclarés sur chacun des
    // produits cochés (fiche Produit — ui-admin.js openProductForm, champ incompatibleTypes =
    // liste de DISH_INGREDIENT_TYPES), au pourcentage le plus élevé rencontré. On reconstruit le
    // format de stockage existant (incompatibleWith.products = [{productId, percentage}]) en
    // listant tous les produits par défaut appartenant à ces groupes, comme pour le wizard step 8.
    const incGroupsMap = {};
    products.forEach((p) => {
      (p.incompatibleTypes || []).forEach((groupId) => {
        const pct = p.incompatiblePercentage || 100;
        if (!incGroupsMap[groupId] || incGroupsMap[groupId] < pct) incGroupsMap[groupId] = pct;
      });
    });
    const incompatibleTypeGroups = Object.keys(incGroupsMap);
    const incompatibleProductsOut = incompatibleTypeGroups.length
      ? DATA.state.products
          .filter((p) => p.ingredientType && incompatibleTypeGroups.includes(p.ingredientType))
          .map((p) => ({ productId: p.id, percentage: incGroupsMap[p.ingredientType] }))
      : [];

    // Cuissons incompatibles héritées des produits cochés (champ notCookableModes de la fiche
    // Produit, valeurs DISH_COOKING_MODES).
    const incCookingModesMap = {};
    products.forEach((p) => {
      (p.notCookableModes || []).forEach((modeId) => {
        const pct = p.incompatiblePercentage || 100;
        if (!incCookingModesMap[modeId] || incCookingModesMap[modeId] < pct) incCookingModesMap[modeId] = pct;
      });
    });

    const { total: estimatedTotalCost, lines: costLines } = this.estimateCost(allProductIds, d.servings);
    const steps = this.generateSteps(d.type, d.productIds);
    const legacyDishCategory = (dishSubCategory === "ro_mazava" || dishSubCategory === "ro_matsatso") ? "ro_mazava" : "laoka";

    const recipeData = {
      name: d.name,
      photo: d.photo || "🍽️",
      photoImage: d.photoImage || null,
      type: d.type,
      cookingMethod: d.type,
      dishCategory: legacyDishCategory,
      dishSubCategory,
      dishSubCategoryOverride: d.dishSubCategoryOverride || null,
      foodRole: "laoka",
      ingredientType,
      mainIngredientId: mainProduct ? mainProduct.id : null,
      animalSource,
      animalPart: null,
      moment: d.moment.length ? d.moment : ["atoandro", "hariva"],
      time: 30,
      servings: d.servings,
      diet: containsPork ? ["standard"] : ["standard", "halal", "mpino", "sabatista"],
      dietCustom: null,
      containsPork,
      season: [],
      fangarony: [],
      sauceProductIds: d.sauceProductIds,
      sauceItems: d.sauceProductIds.map((id) => ({ id, name: (DATA.getProduct(id) || {}).name || id })),
      spiceItems: [],
      sauce: "",
      spices: "",
      incompatibleWith: {
        products: incompatibleProductsOut,
        types: Object.keys(incCookingModesMap).map((typeId) => ({ typeId, percentage: incCookingModesMap[typeId] })),
        custom: [],
        productIds: incompatibleProductsOut.filter((p) => p.percentage >= 100).map((p) => p.productId),
        typeIds: Object.keys(incCookingModesMap).filter((typeId) => incCookingModesMap[typeId] >= 100),
      },
      incompatibleTypeGroups,
      ingredients: allProductIds.map((id) => {
        const line = costLines.find((l) => l.productId === id) || {};
        return { productId: id, qty: line.qty || 0, unit: line.unit || (DATA.getProduct(id) || {}).unit || "kg" };
      }),
      steps,
      notes: d.notes || "",
      manualPrice: null,
      manualPriceUnit: "kg",
      manualQty: 1,
    };

    // MODE ÉDITION (bouton "Modifier" d'Admin > Recettes) : on met à jour la recette existante en
    // place (même id), en cherchant dans les deux listes possibles (recipes / roMazavaRecipes) car
    // la catégorie a pu changer pendant l'édition.
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
      const targetList = legacyDishCategory === "ro_mazava" ? DATA.state.roMazavaRecipes : DATA.state.recipes;
      if (targetList !== list) {
        list.splice(idx, 1);
        targetList.push(Object.assign({ id }, recipeData));
      } else {
        Object.assign(list[idx], recipeData);
      }
      DATA.saveData();
      UI.toast(`✅ ${recipeData.name} nohavaozina.`);
      this.returnFromForm();
      return;
    }

    const newRecipe = Object.assign({ id: "r_" + Date.now() }, recipeData);
    if (legacyDishCategory === "ro_mazava") {
      DATA.state.roMazavaRecipes.push(newRecipe);
    } else {
      DATA.state.recipes.push(newRecipe);
    }
    DATA.saveData();
    UI.toast(`✅ ${newRecipe.name} nampidirina — vidiny voatombana ${CALC.formatAr(estimatedTotalCost)} ho an'olona ${d.servings}.`);
    PROFIL_UI.renderTab("parametres");
  },

  dishSubCategoryFromCookingMode(mode) {
    const map = { RITRA: "ritra", RONY: "rony", KETSAKETSA: "ketsaketsa", KIENDY: "kiendy", VOAMAINA: "voamaina" };
    return map[mode] || "laoka_classique";
  },
};

