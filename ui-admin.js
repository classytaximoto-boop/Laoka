/* ============================================================
   LAOKA — ui-admin.js
   Dashboard Admin : produits, prix, recettes, compatibilité, stats
   ============================================================ */

const ADMIN = {
  currentView: "dashboard",

  render() {
    const el = document.getElementById("screen-admin");
    el.innerHTML = `
      <div class="admin-layout">
        <div class="admin-topbar">
          <h2>Laoka Admin</h2>
        </div>
        <nav class="admin-tabs" id="adminTabs">
          <button class="admin-tab active" data-view="dashboard">Dashboard</button>
          <button class="admin-tab" data-view="produits">Produits</button>
          <button class="admin-tab" data-view="recettes">Recettes</button>
          <button class="admin-tab" data-view="compatibilite">Compatibilité</button>
        </nav>
        <div id="adminBody"></div>
      </div>
    `;
    document.querySelectorAll(".admin-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.renderView(tab.dataset.view);
      });
    });
    this.renderView("dashboard");
  },

  renderView(view) {
    this.currentView = view;
    if (view === "dashboard") return this.renderDashboard();
    if (view === "produits") return this.renderProduits();
    if (view === "recettes") return this.renderRecettes();
    if (view === "compatibilite") return this.renderCompatibilite();
  },

  /* ------------------- DASHBOARD ------------------- */
  renderDashboard() {
    const stats = DATA.state.adminStats;
    const avgBudget = stats.searches > 0 ? Math.round(stats.budgetSum / stats.searches) : 0;
    const popular = Object.entries(stats.popularity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ recipe: DATA.getRecipe(id), count }))
      .filter((x) => x.recipe);

    document.getElementById("adminBody").innerHTML = `
      <div class="admin-stats-grid fade-in">
        <div class="stat-card"><span class="stat-value">1</span><span class="stat-label">Utilisateurs (démo)</span></div>
        <div class="stat-card"><span class="stat-value">${DATA.state.recipes.length}</span><span class="stat-label">Recettes</span></div>
        <div class="stat-card"><span class="stat-value">${DATA.state.products.length}</span><span class="stat-label">Ingrédients / Produits</span></div>
        <div class="stat-card"><span class="stat-value">${stats.searches}</span><span class="stat-label">Recherches</span></div>
        <div class="stat-card"><span class="stat-value">${CALC.formatAr(avgBudget)}</span><span class="stat-label">Budget moyen recherché</span></div>
      </div>
      <section class="section fade-in">
        <h3 class="section-title">Recettes populaires</h3>
        ${
          popular.length === 0
            ? `<p class="muted">Pas encore de données.</p>`
            : `<table class="admin-table"><tbody>
                ${popular.map((p) => `<tr><td>${p.recipe.photo} ${p.recipe.name}</td><td>${p.count} recherches</td></tr>`).join("")}
              </tbody></table>`
        }
      </section>
    `;
  },

  /* ------------------- PRODUITS / PRIX ------------------- */
  renderProduits() {
    const products = DATA.state.products;
    document.getElementById("adminBody").innerHTML = `
      <div class="action-row fade-in">
        <button class="btn btn-primary" id="adminAddProduct">+ Ajouter un produit</button>
      </div>
      <p class="muted small">💡 Prix indicatifs de démonstration — modifiables ici, pris en compte immédiatement par les calculs de coût (CALC) et les recommandations (RECO).</p>
      <div class="table-scroll fade-in">
        <table class="admin-table">
          <thead>
            <tr><th>Produit</th><th>Catégorie</th><th>Unité</th><th>Prix</th><th>Statut</th><th>Ville</th><th>Actions</th></tr>
          </thead>
          <tbody id="productsTableBody">
            ${products.map((p) => `
              <tr data-id="${p.id}">
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.unit}</td>
                <td>${p.hasForfait && p.forfaitTiers && p.forfaitTiers.length
                    ? `🏷️ Forfait<br><span class="muted small">${p.forfaitTiers.map((t) => `${t.minPeople}${t.maxPeople ? "-" + t.maxPeople : "+"} olona: ${CALC.formatAr(t.price)}`).join(" · ")}</span>`
                    : CALC.formatAr(p.basePrice)}</td>
                <td>${p.isIndicativePrice === false ? `✏️ Modifié${p.priceUpdatedAt ? " le " + new Date(p.priceUpdatedAt).toLocaleDateString("fr-FR") : ""}` : "📋 Prix indicatif"}</td>
                <td>Antananarivo</td>
                <td>
                  <button class="btn-icon" data-action="edit">Modifier</button>
                  <button class="btn-icon danger" data-action="delete">Supprimer</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    document.getElementById("adminAddProduct").addEventListener("click", () => this.openProductForm(null));
    document.querySelectorAll("#productsTableBody tr").forEach((row) => {
      const id = row.dataset.id;
      const product = DATA.getProduct(id);
      row.querySelector("[data-action='edit']").addEventListener("click", () => this.openProductForm(product));
      row.querySelector("[data-action='delete']").addEventListener("click", () => {
        DATA.state.products = DATA.state.products.filter((p) => p.id !== id);
        DATA.saveData();
        this.renderProduits();
        UI.toast("Produit supprimé.");
      });
    });
  },

  /** Formulaire produit — aligné sur les conditions du wizard 13 étapes (LAOKA_FORM_UI) :
   *  compatibilité/incompatibilité en %, sauce, cube Jumbo/Maggi conditionnel, quantité+prix
   *  calculés à partir d'1 personne. Les listes "mifanaraka/tsy mifanaraka aminy" utilisent les
   *  groupes alimentaires génériques (DISH_INGREDIENT_TYPES : Legioma, Anana, Voamaina...) à cocher,
   *  PAS une recherche produit par produit — c'est la demande explicite de l'utilisateur, pour éviter
   *  de fouiller toute la liste de produits à chaque fois. */
  openProductForm(existing) {
    const isEdit = !!existing;
    const d = existing || {};
    const compatibleTypes = d.compatibleTypes || [];
    const incompatibleTypes = d.incompatibleTypes || [];
    const cookableModes = d.cookableModes || [];
    const notCookableModes = d.notCookableModes || [];
    const sauceItems = d.sauceItems || [];
    const allowsCube = d.allowsBouillonCube !== undefined ? d.allowsBouillonCube : null; // null = pas encore choisi

    UI.openModal(`
      <div class="modal-header">
        <h2>${isEdit ? "Modifier le produit" : "Ajouter un produit"}</h2>
        <button class="modal-close" id="closeProdModal">✕</button>
      </div>
      <form id="prodForm" class="form">
        <div class="field">
          <label for="prName">Nom</label>
          <input type="text" id="prName" value="${existing ? existing.name : ""}" required>
        </div>
        <div class="field">
          <label>Ho an'inona ity entana ity ? (safidio maro — mamaritra aiza no hisehoan'ity entana ity ao amin'ny application)</label>
          <div class="choice-grid" id="prUsageTags">
            <button type="button" class="choice-chip ${(d.usageTags || []).includes("laoka") ? "active" : ""}" data-value="laoka">Laoka</button>
            <button type="button" class="choice-chip ${(d.usageTags || []).includes("sauce") ? "active" : ""}" data-value="sauce">Ro / Sauce</button>
            <button type="button" class="choice-chip ${(d.usageTags || []).includes("gouter") ? "active" : ""}" data-value="gouter">Goûter</button>
          </div>
        </div>
        <div class="field">
          <label for="prCategory">Catégorie</label>
          <select id="prCategory">
            ${Object.keys(CATEGORY_LABELS).map((c) => `<option value="${c}" ${existing && existing.category===c?"selected":""}>${CATEGORY_LABELS[c]}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="prIngredientType">Vondrona sakafo (ingredientType — ho an'ny cube Jumbo sy fikarohana)</label>
          <select id="prIngredientType">
            <option value="">— tsy voafaritra —</option>
            ${DISH_INGREDIENT_TYPES.map((t) => `<option value="${t}" ${existing && existing.ingredientType===t?"selected":""}>${DISH_INGREDIENT_TYPE_LABELS[t]}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="prUnit">Unité</label>
          <select id="prUnit">
            ${MEASURE_UNITS.map((u) => `<option value="${u}" ${existing && existing.unit===u?"selected":""}>${UNIT_LABELS[u]}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="prPart">Partie (optionnel — abats, morceau...)</label>
          <input type="text" id="prPart" value="${existing && existing.part ? existing.part : ""}" placeholder="ex : taovany, museau, filet...">
        </div>

        <div class="field">
          <label>Mifanaraka amin'ny (safidio ny vondrona sakafo — tsy ilaina mitady produit iray iray)</label>
          <div class="choice-grid" id="prCompatibleTypes">
            ${DISH_INGREDIENT_TYPES.map((t) => `<button type="button" class="choice-chip ${compatibleTypes.includes(t)?"active":""}" data-value="${t}">${DISH_INGREDIENT_TYPE_LABELS[t]}</button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label>Tsy mifanaraka amin'ny (safidio ny vondrona sakafo)</label>
          <div class="choice-grid" id="prIncompatibleTypes">
            ${DISH_INGREDIENT_TYPES.map((t) => `<button type="button" class="choice-chip ${incompatibleTypes.includes(t)?"active":""}" data-value="${t}">${DISH_INGREDIENT_TYPE_LABELS[t]}</button>`).join("")}
          </div>
          <label for="prIncompatiblePercent" class="muted small" style="margin-top:8px;">Tahan'ny tsy fifanarahana (%)</label>
          <select id="prIncompatiblePercent">
            ${COMPATIBILITY_PERCENTAGES.map((p) => `<option value="${p}" ${(existing && existing.incompatiblePercentage===p) || (!existing && p===100) ?"selected":""}>${p}%</option>`).join("")}
          </select>
        </div>

        <div class="field">
          <label>Azo andrahoina amin'ity fomba fanaovana ity (atao)</label>
          <div class="choice-grid" id="prCookable">
            ${DISH_COOKING_MODES.map((m) => `<button type="button" class="choice-chip ${cookableModes.includes(m)?"active":""}" data-value="${m}">${COOKING_MODE_LABELS[m]}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label>Tsy azo andrahoina amin'ity fomba fanaovana ity</label>
          <div class="choice-grid" id="prNotCookable">
            ${DISH_COOKING_MODES.map((m) => `<button type="button" class="choice-chip ${notCookableModes.includes(m)?"active":""}" data-value="${m}">${COOKING_MODE_LABELS[m]}</button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label>Ro / sauce mety hifanaraka (safidio maro)</label>
          <div class="choice-grid" id="prSauce">
            ${SAUCE_BASE_REFERENCE.map((s) => `<button type="button" class="choice-chip ${sauceItems.some(x=>x.id===s.id)?"active":""}" data-id="${s.id}" data-name="${s.name}">${s.name}</button>`).join("")}
          </div>
          <input type="text" id="prSauceOther" placeholder="Sauce hafa (soraty malalaka)" value="${d.sauceOther || ""}">
        </div>

        <div class="field" id="prCubeField">
          <label>Azo asiana Cube Jumbo/Maggi ve ity entana ity ?</label>
          <div class="choice-grid">
            <button type="button" class="choice-chip ${allowsCube === true ? "active" : ""}" id="prCubeYes" data-value="yes">Eny</button>
            <button type="button" class="choice-chip ${allowsCube === false ? "active" : ""}" id="prCubeNo" data-value="no">Tsia</button>
          </div>
          <p class="muted small" id="prCubeHint"></p>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="prQtyPerPerson">Habetsany ho an'olona 1</label>
            <input type="number" id="prQtyPerPerson" min="0.001" step="0.001" value="${existing && existing.qtyPerPerson ? existing.qtyPerPerson : 0.1}" required>
          </div>
          <div class="field">
            <label for="prPrice">Vidiny ho an'ny unité 1 (${existing ? UNIT_LABELS[existing.unit] : "kg"})</label>
            <div class="input-suffix">
              <input type="number" id="prPrice" min="0" step="50" value="${existing ? existing.basePrice : 1000}" required>
              <span class="suffix">Ar</span>
            </div>
            <div class="choice-grid" id="prForfaitToggle" style="margin-top:8px;">
              <button type="button" class="choice-chip ${!d.hasForfait ? "active" : ""}" id="prForfaitNo" data-value="no">Vidiny mahazatra</button>
              <button type="button" class="choice-chip ${d.hasForfait ? "active" : ""}" id="prForfaitYes" data-value="yes">Forfait</button>
            </div>
          </div>
        </div>

        <div class="field" id="prForfaitField" style="${d.hasForfait ? "" : "display:none;"}">
          <label>Sokajy vidiny arakaraky ny isan'olona (forfait) — soraty ny sokajy tianao</label>
          <div id="prForfaitTiers"></div>
          <button type="button" class="btn-icon" id="prForfaitAddTier">+ Ampio sokajy</button>
          <p class="muted small">Ohatra : 1-6 olona = 400 Ar, 7-10 olona = 600 Ar, mihoatra ny 10 = fety (soraty ny vidiny tianao — tsy misy sokajy voafaritra mialoha).</p>
        </div>
        <div class="field">
          <p class="muted small" id="prCalcPreview">Vidiny ho an'olona 1 : —</p>
          <p class="muted small">${existing && existing.isIndicativePrice === false ? "Prix déjà modifié manuellement." : "Prix indicatif — modifiable ici à tout moment."}</p>
        </div>

        <div class="field-error hidden" id="prErr"></div>
        <button type="submit" class="btn btn-primary btn-block">Enregistrer</button>
      </form>
    `);
    document.getElementById("closeProdModal").addEventListener("click", () => UI.closeModal());

    // Chips à bascule simple (mifanaraka / tsy mifanaraka / cuisson / sauce)
    document.querySelectorAll("#prCompatibleTypes .choice-chip, #prIncompatibleTypes .choice-chip, #prCookable .choice-chip, #prNotCookable .choice-chip, #prSauce .choice-chip, #prUsageTags .choice-chip")
      .forEach((btn) => btn.addEventListener("click", () => btn.classList.toggle("active")));

    // Cube Jumbo : bouton binaire Eny/Tsia (un seul actif à la fois)
    const cubeYesBtn = document.getElementById("prCubeYes");
    const cubeNoBtn = document.getElementById("prCubeNo");
    const setCube = (val) => {
      cubeYesBtn.classList.toggle("active", val === true);
      cubeNoBtn.classList.toggle("active", val === false);
    };
    cubeYesBtn.addEventListener("click", () => setCube(true));
    cubeNoBtn.addEventListener("click", () => setCube(false));

    // --- Forfait : bascule Vidiny mahazatra / Forfait + tableau de tranches libre ---
    const forfaitNoBtn = document.getElementById("prForfaitNo");
    const forfaitYesBtn = document.getElementById("prForfaitYes");
    const forfaitField = document.getElementById("prForfaitField");
    const forfaitTiersEl = document.getElementById("prForfaitTiers");
    const forfaitAddTierBtn = document.getElementById("prForfaitAddTier");

    // État initial des tranches : reprend celles déjà enregistrées sur le produit (édition), ou
    // une tranche vide par défaut si on active le forfait pour la première fois.
    let forfaitTiers = (d.forfaitTiers && d.forfaitTiers.length > 0)
      ? d.forfaitTiers.map((t) => ({ ...t }))
      : [{ minPeople: 1, maxPeople: "", price: "" }];

    const renderForfaitTiers = () => {
      forfaitTiersEl.innerHTML = forfaitTiers.map((t, i) => `
        <div class="field-row forfait-tier-row" data-index="${i}" style="align-items:center;">
          <div class="field">
            <label class="muted small">Isan'olona minimum</label>
            <input type="number" min="1" step="1" class="tierMin" value="${t.minPeople ?? 1}">
          </div>
          <div class="field">
            <label class="muted small">Isan'olona maksimum (avelao banga raha "sy mihoatra")</label>
            <input type="number" min="1" step="1" class="tierMax" value="${t.maxPeople ?? ""}" placeholder="ex: fety = banga">
          </div>
          <div class="field">
            <label class="muted small">Vidiny (Ar)</label>
            <input type="number" min="0" step="50" class="tierPrice" value="${t.price ?? ""}">
          </div>
          <button type="button" class="btn-icon danger tierRemove" title="Esory ity sokajy ity">✕</button>
        </div>
      `).join("");

      // Ré-attache les listeners à chaque rendu (le innerHTML a été régénéré)
      forfaitTiersEl.querySelectorAll(".forfait-tier-row").forEach((row) => {
        const idx = Number(row.dataset.index);
        row.querySelector(".tierMin").addEventListener("input", (e) => { forfaitTiers[idx].minPeople = e.target.value; });
        row.querySelector(".tierMax").addEventListener("input", (e) => { forfaitTiers[idx].maxPeople = e.target.value; });
        row.querySelector(".tierPrice").addEventListener("input", (e) => { forfaitTiers[idx].price = e.target.value; });
        row.querySelector(".tierRemove").addEventListener("click", () => {
          if (forfaitTiers.length <= 1) return; // toujours garder au moins une tranche tant que le forfait est actif
          forfaitTiers.splice(idx, 1);
          renderForfaitTiers();
        });
      });
    };
    renderForfaitTiers();

    forfaitAddTierBtn.addEventListener("click", () => {
      const last = forfaitTiers[forfaitTiers.length - 1];
      const nextMin = last && last.maxPeople ? Number(last.maxPeople) + 1 : "";
      forfaitTiers.push({ minPeople: nextMin, maxPeople: "", price: "" });
      renderForfaitTiers();
    });

    const setForfaitMode = (isForfait) => {
      forfaitNoBtn.classList.toggle("active", !isForfait);
      forfaitYesBtn.classList.toggle("active", isForfait);
      forfaitField.style.display = isForfait ? "" : "none";
    };
    forfaitNoBtn.addEventListener("click", () => setForfaitMode(false));
    forfaitYesBtn.addEventListener("click", () => setForfaitMode(true));

    // Suggestion automatique (non bloquante) : rappel de la règle métier existante — le cube n'a de
    // sens que pour les légumes/anana/voamaina, réutilise BOUILLON_CUBE_ALLOWED_INGREDIENT_TYPES.
    const ingTypeSelect = document.getElementById("prIngredientType");
    const cubeHint = document.getElementById("prCubeHint");
    const updateCubeHint = () => {
      const t = ingTypeSelect.value;
      if (t && !BOUILLON_CUBE_ALLOWED_INGREDIENT_TYPES.includes(t) && t !== "voamaina") {
        cubeHint.textContent = "Mazàna tsy ilaina Cube ho an'ity vondrona sakafo ity, fa azonao safidiana ihany raha ilainao.";
      } else {
        cubeHint.textContent = "";
      }
    };
    ingTypeSelect.addEventListener("change", updateCubeHint);
    updateCubeHint();

    // Aperçu du calcul automatique : vidiny ho an'olona 1 = habetsany(olona 1) x vidiny unité.
    // C'est l'application qui calcule — l'utilisateur ne saisit jamais ce total lui-même.
    const qtyInput = document.getElementById("prQtyPerPerson");
    const priceInput = document.getElementById("prPrice");
    const unitSelect = document.getElementById("prUnit");
    const calcPreview = document.getElementById("prCalcPreview");
    const updateCalcPreview = () => {
      const qty = Number(qtyInput.value) || 0;
      const price = Number(priceInput.value) || 0;
      const total = qty * price;
      calcPreview.textContent = `Vidiny ho an'olona 1 : ${CALC.formatAr(Math.round(total))} (${qty} ${UNIT_LABELS[unitSelect.value] || unitSelect.value} × ${CALC.formatAr(price)})`;
    };
    [qtyInput, priceInput, unitSelect].forEach((el) => el.addEventListener("input", updateCalcPreview));
    unitSelect.addEventListener("change", updateCalcPreview);
    updateCalcPreview();

    document.getElementById("prodForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("prName").value.trim();
      const price = Number(document.getElementById("prPrice").value);
      const qtyPerPerson = Number(document.getElementById("prQtyPerPerson").value);
      const errEl = document.getElementById("prErr");
      if (!name) {
        errEl.textContent = "Tsy azo avela ho banga ny anarana.";
        errEl.classList.remove("hidden");
        return;
      }
      if (price < 0) {
        errEl.textContent = "Tsy azo atao ny vidiny latsaka zero.";
        errEl.classList.remove("hidden");
        return;
      }
      if (!qtyPerPerson || qtyPerPerson <= 0) {
        errEl.textContent = "Tsy azo atao ny habetsany latsaka zero.";
        errEl.classList.remove("hidden");
        return;
      }
      const hasForfait = forfaitYesBtn.classList.contains("active");
      let forfaitTiersOut = [];
      if (hasForfait) {
        // Validation : chaque tranche doit avoir un minimum et un prix renseignés.
        const invalidTier = forfaitTiers.find((t) => t.minPeople === "" || t.minPeople === undefined || t.price === "" || t.price === undefined || Number(t.price) < 0);
        if (invalidTier) {
          errEl.textContent = "Feno tsara ny isan'olona minimum sy ny vidiny amin'ny sokajy forfait tsirairay.";
          errEl.classList.remove("hidden");
          return;
        }
        forfaitTiersOut = forfaitTiers.map((t) => ({
          minPeople: Number(t.minPeople),
          maxPeople: (t.maxPeople === "" || t.maxPeople === undefined) ? null : Number(t.maxPeople),
          price: Number(t.price),
        })).sort((a, b) => a.minPeople - b.minPeople);
      }
      errEl.classList.add("hidden");

      const part = document.getElementById("prPart").value.trim();
      const ingredientType = ingTypeSelect.value || undefined;
      const usageTagsOut = [...document.querySelectorAll("#prUsageTags .choice-chip.active")].map((b) => b.dataset.value);
      const compatibleTypesOut = [...document.querySelectorAll("#prCompatibleTypes .choice-chip.active")].map((b) => b.dataset.value);
      const incompatibleTypesOut = [...document.querySelectorAll("#prIncompatibleTypes .choice-chip.active")].map((b) => b.dataset.value);
      const incompatiblePercentage = Number(document.getElementById("prIncompatiblePercent").value);
      const cookableModesOut = [...document.querySelectorAll("#prCookable .choice-chip.active")].map((b) => b.dataset.value);
      const notCookableModesOut = [...document.querySelectorAll("#prNotCookable .choice-chip.active")].map((b) => b.dataset.value);
      const sauceItemsOut = [...document.querySelectorAll("#prSauce .choice-chip.active")].map((b) => ({ id: b.dataset.id, name: b.dataset.name }));
      const sauceOther = document.getElementById("prSauceOther").value.trim();
      const allowsBouillonCube = cubeYesBtn.classList.contains("active") ? true : (cubeNoBtn.classList.contains("active") ? false : null);
      const unit = unitSelect.value;

      const extraFields = {
        usageTags: usageTagsOut,
        compatibleTypes: compatibleTypesOut,
        incompatibleTypes: incompatibleTypesOut,
        incompatiblePercentage,
        cookableModes: cookableModesOut,
        notCookableModes: notCookableModesOut,
        sauceItems: sauceItemsOut,
        sauceOther,
        allowsBouillonCube,
        qtyPerPerson,
        hasForfait,
        forfaitTiers: forfaitTiersOut,
      };

      if (isEdit) {
        existing.name = name;
        existing.category = document.getElementById("prCategory").value;
        existing.unit = unit;
        if (ingredientType) existing.ingredientType = ingredientType; else delete existing.ingredientType;
        if (part) existing.part = part; else delete existing.part;
        Object.assign(existing, extraFields);
        // Centralise via DATA.updateProductPrice : marque isIndicativePrice=false + priceUpdatedAt,
        // et garantit que CALC/RECO utilisent immédiatement le nouveau prix (source de vérité unique).
        DATA.updateProductPrice(existing.id, price);
      } else {
        const newProduct = {
          id: "custom_" + Date.now(),
          name,
          category: document.getElementById("prCategory").value,
          unit,
          basePrice: price,
          isIndicativePrice: false,
          priceUpdatedAt: new Date().toISOString(),
          ...extraFields,
        };
        if (part) newProduct.part = part;
        if (ingredientType) newProduct.ingredientType = ingredientType;
        DATA.state.products.push(newProduct);
        DATA.saveData();
      }
      UI.closeModal();
      this.renderProduits();
      UI.toast("Prix mis à jour — les recettes se recalculent automatiquement.");
    });
  },

  /* ------------------- RECETTES ------------------- */
  renderRecettes() {
    this.recetteSearchQuery = this.recetteSearchQuery || "";
    document.getElementById("adminBody").innerHTML = `
      <div class="field fade-in" style="margin-bottom:12px;">
        <label for="recetteSearchInput">Rechercher un laoka (ex : rony, ritra, akoho...)</label>
        <input type="text" id="recetteSearchInput" placeholder="Karohy anarana na sokajy..." value="${this.recetteSearchQuery}">
      </div>
      <div class="table-scroll fade-in">
        <table class="admin-table">
          <thead><tr><th>Nom</th><th>Type</th><th>Moment</th><th>Temps</th><th>Personnes</th><th>Actions</th></tr></thead>
          <tbody id="recipesTableBody"></tbody>
        </table>
      </div>
    `;
    const searchInput = document.getElementById("recetteSearchInput");
    searchInput.addEventListener("input", () => {
      this.recetteSearchQuery = searchInput.value;
      this.renderRecettesTable();
    });
    this.renderRecettesTable();
  },

  /** Filtre DATA.state.recipes par recetteSearchQuery : recherche insensible à la casse/accents sur
      le nom (ex. "rony" trouve "Ron'akoho", "Ron'omby"...) ET sur le libellé de dishCategory/
      dishSubCategory (ex. "rony" trouve aussi toutes les recettes dont dishSubCategory === "rony",
      même si "rony" n'apparaît pas dans leur nom). */
  renderRecettesTable() {
    const norm = (s) => (s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const query = norm(this.recetteSearchQuery);
    let recipes = DATA.state.recipes;
    if (query) {
      recipes = recipes.filter((r) => {
        const nameMatch = norm(r.name).includes(query);
        const catLabel = DISH_CATEGORY_LABELS[r.dishSubCategory] || DISH_CATEGORY_LABELS[r.dishCategory] || "";
        const catMatch = norm(r.dishSubCategory).includes(query) || norm(r.dishCategory).includes(query) || norm(catLabel).includes(query);
        return nameMatch || catMatch;
      });
    }
    const tbody = document.getElementById("recipesTableBody");
    if (!tbody) return;
    tbody.innerHTML = recipes.length === 0
      ? `<tr><td colspan="6"><p class="muted" style="padding:12px 0;">Tsy nahitana laoka mifanaraka amin'ny "${this.recetteSearchQuery}".</p></td></tr>`
      : recipes.map((r) => `
        <tr data-id="${r.id}">
          <td>${r.photo} ${r.name}</td>
          <td>${r.type}</td>
          <td>${r.moment.join(", ")}</td>
          <td>${r.time} min</td>
          <td>${r.servings}</td>
          <td>
            <button class="btn-icon" data-action="edit">Modifier</button>
            <button class="btn-icon" data-action="duplicate">Dupliquer</button>
            <button class="btn-icon danger" data-action="delete">Supprimer</button>
          </td>
        </tr>
      `).join("");
    document.querySelectorAll("#recipesTableBody tr").forEach((row) => {
      const id = row.dataset.id;
      if (!id) return;
      const editBtn = row.querySelector("[data-action='edit']");
      if (editBtn) editBtn.addEventListener("click", () => this.editRecipe(id));
      row.querySelector("[data-action='duplicate']").addEventListener("click", () => {
        const recipe = DATA.getRecipe(id);
        const copy = structuredClone(recipe);
        copy.id = "r_" + Date.now();
        copy.name = recipe.name + " (copie)";
        DATA.state.recipes.push(copy);
        DATA.saveData();
        this.renderRecettesTable();
        UI.toast("Recette dupliquée.");
      });
      row.querySelector("[data-action='delete']").addEventListener("click", () => {
        DATA.state.recipes = DATA.state.recipes.filter((r) => r.id !== id);
        DATA.saveData();
        this.renderRecettesTable();
        UI.toast("Recette supprimée.");
      });
    });
  },

  /** Ouvre le formulaire d'ajout de laoka (LAOKA_FORM_UI) pré-rempli avec la recette existante,
      pour modification. Réutilise le même formulaire que l'ajout, en mode édition (le formulaire
      remplace la recette existante par son id au lieu d'en créer une nouvelle — voir
      LAOKA_FORM_UI.startDraft/saveDraftAsRecipe pour la logique d'édition côté formulaire). */
  editRecipe(id) {
    const recipe = DATA.getRecipe(id);
    if (!recipe) { UI.toast("Recette introuvable."); return; }
    if (typeof LAOKA_FORM_UI === "undefined" || typeof LAOKA_FORM_UI.startEdit !== "function") {
      UI.toast("Le formulaire d'édition n'est pas disponible.");
      return;
    }
    LAOKA_FORM_UI.startEdit(recipe, () => this.renderRecettesTable());
  },

  /* ------------------- COMPATIBILITÉ (avec pourcentage, prompt 2/3/4) ------------------- */
  renderCompatibilite() {
    const rules = DATA.state.compatibility;
    const products = DATA.state.products;
    document.getElementById("adminBody").innerHTML = `
      <div class="action-row fade-in">
        <button class="btn btn-primary" id="adminAddRule">+ Ajouter une règle</button>
      </div>
      <p class="muted small">100% = exclusion totale (jamais recommandé ensemble) · 80% = très forte pénalité · 60% = forte · 40% = moyenne · 20% = faible · 0% = information sans exclusion.</p>
      <div class="table-scroll fade-in">
        <table class="admin-table">
          <thead><tr><th>Produit A</th><th>Produit B</th><th>Compatibilité</th><th>Actions</th></tr></thead>
          <tbody id="compatTableBody">
            ${rules.map((r, idx) => {
              const pa = products.find((p) => p.id === r.a);
              const pb = products.find((p) => p.id === r.b);
              const pct = r.percentage !== undefined ? r.percentage : 0;
              return `<tr data-idx="${idx}">
                <td>${pa ? pa.name : r.a}</td>
                <td>${pb ? pb.name : r.b}</td>
                <td>${this.compatibilityBadge(pct)}</td>
                <td><button class="btn-icon danger" data-action="delete">Supprimer</button></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
    document.getElementById("adminAddRule").addEventListener("click", () => this.openRuleForm());
    document.querySelectorAll("#compatTableBody tr").forEach((row) => {
      const idx = Number(row.dataset.idx);
      row.querySelector("[data-action='delete']").addEventListener("click", () => {
        DATA.state.compatibility.splice(idx, 1);
        DATA.saveData();
        this.renderCompatibilite();
        UI.toast("Règle supprimée.");
      });
    });
  },

  /** Badge visuel pour un pourcentage d'incompatibilité (0=compatible, 100=exclusion totale) */
  compatibilityBadge(pct) {
    if (pct >= 100) return `🔴 Incompatible à 100% (exclusion totale)`;
    if (pct >= 80) return `🟠 Tsy mifanaraka ${pct}% (très forte pénalité)`;
    if (pct >= 40) return `🟡 Tsy mifanaraka ${pct}% (pénalité moyenne/forte)`;
    if (pct > 0) return `🟢 Tsy mifanaraka ${pct}% (faible pénalité)`;
    return `✅ Compatible (0%)`;
  },

  openRuleForm() {
    const products = DATA.state.products;
    UI.openModal(`
      <div class="modal-header"><h2>Nouvelle règle</h2><button class="modal-close" id="closeRuleModal">✕</button></div>
      <form id="ruleForm" class="form">
        <div class="field">
          <label for="ruleA">Produit A</label>
          <select id="ruleA">${products.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label for="ruleB">Produit B</label>
          <select id="ruleB">${products.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label for="rulePercentage">Pourcentage d'incompatibilité</label>
          <select id="rulePercentage">
            ${COMPATIBILITY_PERCENTAGES.map((p) => `<option value="${p}" ${p===100?"selected":""}>${p}% ${p===100?"— exclusion totale":p===0?"— information seulement":""}</option>`).join("")}
          </select>
          <p class="muted small">100% = ne jamais recommander ensemble. 0% = juste une information, sans effet sur le classement.</p>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Ajouter</button>
      </form>
    `);
    document.getElementById("closeRuleModal").addEventListener("click", () => UI.closeModal());
    document.getElementById("ruleForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const percentage = Number(document.getElementById("rulePercentage").value);
      const level = percentage >= 100 ? "incompatible" : percentage >= 40 ? "peu_recommande" : percentage >= 10 ? "acceptable" : "compatible";
      DATA.state.compatibility.push({
        a: document.getElementById("ruleA").value,
        b: document.getElementById("ruleB").value,
        percentage,
        level, // conservé pour rétrocompatibilité avec tout code lisant encore `level`
      });
      DATA.saveData();
      UI.closeModal();
      this.renderCompatibilite();
      UI.toast("Règle ajoutée.");
    });
  },
};
