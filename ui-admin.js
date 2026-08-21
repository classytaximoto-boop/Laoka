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
                <td>${CALC.formatAr(p.basePrice)}</td>
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

  openProductForm(existing) {
    const isEdit = !!existing;
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
          <label for="prCategory">Catégorie</label>
          <select id="prCategory">
            ${Object.keys(CATEGORY_LABELS).map((c) => `<option value="${c}" ${existing && existing.category===c?"selected":""}>${CATEGORY_LABELS[c]}</option>`).join("")}
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
          <label for="prPrice">Prix (pour 1 unité)</label>
          <div class="input-suffix">
            <input type="number" id="prPrice" min="0" step="50" value="${existing ? existing.basePrice : 1000}" required>
            <span class="suffix">Ar</span>
          </div>
          <p class="muted small">${existing && existing.isIndicativePrice === false ? "Prix déjà modifié manuellement." : "Prix indicatif — modifiable ici à tout moment."}</p>
        </div>
        <div class="field-error hidden" id="prErr"></div>
        <button type="submit" class="btn btn-primary btn-block">Enregistrer</button>
      </form>
      ${!isEdit ? `
      <div class="field" style="margin-top:14px;">
        <button type="button" class="btn btn-secondary btn-block" id="prToggleLaokaWizard">🍽️ Détails laoka (13 étapes) — facultatif ▾</button>
        <p class="muted small">Ho an'ny mpampiasa te hamorona koa ny laoka feno mifandray amin'ity akora ity (sokajy, atao, tsy mifanaraka, sns.) tsy misy dingana hafa.</p>
        <div id="prLaokaWizardDrawer" class="hidden card" style="margin-top:10px;"></div>
      </div>` : ""}
    `);
    document.getElementById("closeProdModal").addEventListener("click", () => UI.closeModal());
    if (!isEdit) this.bindLaokaWizardDrawer();
    document.getElementById("prodForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("prName").value.trim();
      const price = Number(document.getElementById("prPrice").value);
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
      errEl.classList.add("hidden");

      const part = document.getElementById("prPart").value.trim();
      if (isEdit) {
        existing.name = name;
        existing.category = document.getElementById("prCategory").value;
        existing.unit = document.getElementById("prUnit").value;
        if (part) existing.part = part; else delete existing.part;
        // Centralise via DATA.updateProductPrice : marque isIndicativePrice=false + priceUpdatedAt,
        // et garantit que CALC/RECO utilisent immédiatement le nouveau prix (source de vérité unique).
        DATA.updateProductPrice(existing.id, price);
      } else {
        const newProduct = {
          id: "custom_" + Date.now(),
          name,
          category: document.getElementById("prCategory").value,
          unit: document.getElementById("prUnit").value,
          basePrice: price,
          isIndicativePrice: false,
          priceUpdatedAt: new Date().toISOString(),
        };
        if (part) newProduct.part = part;
        DATA.state.products.push(newProduct);
        DATA.saveData();
      }
      UI.closeModal();
      this.renderProduits();
      UI.toast("Prix mis à jour — les recettes se recalculent automatiquement.");
    });
  },

  /** Tiroir facultatif "Détails laoka (13 étapes)" à l'intérieur de "Ajouter un produit".
   *  Déplié : lance LAOKA_FORM_UI en mode "embedded" dans le conteneur du tiroir, pré-rempli
   *  avec le nom/prix/unité déjà saisis dans le formulaire produit (mais reste indépendant :
   *  fermer le tiroir ou soumettre le produit seul n'annule pas le produit lui-même).
   *  Replié à nouveau : le wizard est réinitialisé (pas de conservation d'un brouillon partiel). */
  bindLaokaWizardDrawer() {
    const toggleBtn = document.getElementById("prToggleLaokaWizard");
    const drawer = document.getElementById("prLaokaWizardDrawer");
    let open = false;
    toggleBtn.addEventListener("click", () => {
      open = !open;
      drawer.classList.toggle("hidden", !open);
      toggleBtn.textContent = open ? "🍽️ Détails laoka (13 étapes) — facultatif ▴" : "🍽️ Détails laoka (13 étapes) — facultatif ▾";
      if (open) {
        const name = document.getElementById("prName").value.trim();
        const price = Number(document.getElementById("prPrice").value) || 0;
        const unit = document.getElementById("prUnit").value;
        LAOKA_FORM_UI.renderEmbedded(drawer, {
          prefill: { name, price, unit, priceUnit: unit },
          onExit: () => {
            open = false;
            drawer.classList.add("hidden");
            drawer.innerHTML = "";
            toggleBtn.textContent = "🍽️ Détails laoka (13 étapes) — facultatif ▾";
          },
          onSaved: () => {
            open = false;
            drawer.classList.add("hidden");
            drawer.innerHTML = "";
            toggleBtn.textContent = "🍽️ Détails laoka (13 étapes) — facultatif ▾ (laoka enregistré ✅)";
          },
        });
      } else {
        drawer.innerHTML = "";
      }
    });
  },

  /* ------------------- RECETTES ------------------- */
  renderRecettes() {
    const recipes = DATA.state.recipes;
    document.getElementById("adminBody").innerHTML = `
      <div class="table-scroll fade-in">
        <table class="admin-table">
          <thead><tr><th>Nom</th><th>Type</th><th>Moment</th><th>Temps</th><th>Personnes</th><th>Actions</th></tr></thead>
          <tbody id="recipesTableBody">
            ${recipes.map((r) => `
              <tr data-id="${r.id}">
                <td>${r.photo} ${r.name}</td>
                <td>${r.type}</td>
                <td>${r.moment.join(", ")}</td>
                <td>${r.time} min</td>
                <td>${r.servings}</td>
                <td>
                  <button class="btn-icon" data-action="duplicate">Dupliquer</button>
                  <button class="btn-icon danger" data-action="delete">Supprimer</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    document.querySelectorAll("#recipesTableBody tr").forEach((row) => {
      const id = row.dataset.id;
      row.querySelector("[data-action='duplicate']").addEventListener("click", () => {
        const recipe = DATA.getRecipe(id);
        const copy = structuredClone(recipe);
        copy.id = "r_" + Date.now();
        copy.name = recipe.name + " (copie)";
        DATA.state.recipes.push(copy);
        DATA.saveData();
        this.renderRecettes();
        UI.toast("Recette dupliquée.");
      });
      row.querySelector("[data-action='delete']").addEventListener("click", () => {
        DATA.state.recipes = DATA.state.recipes.filter((r) => r.id !== id);
        DATA.saveData();
        this.renderRecettes();
        UI.toast("Recette supprimée.");
      });
    });
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
