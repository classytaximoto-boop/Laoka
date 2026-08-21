/* ============================================================
   LAOKA — ui-admin.js
   Écran « Admin » (accès via ⚙️ dans l'en-tête) — statistiques
   d'usage (DATA.state.adminStats), gestion des prix des produits
   (DATA.updateProductPrice), et réinitialisation des données de
   démo (DATA.resetToDemo). Rendu dans #adminContent, un conteneur
   injecté sous le bouton "Retour à l'application" déjà présent en
   dur dans #screen-admin (index.html) — ne jamais écraser ce
   bouton en réécrivant tout #screen-admin.innerHTML.
   ============================================================ */

const ADMIN = {
  state: {
    tab: "stats", // "stats" | "prix"
    priceFilter: "",
  },

  render() {
    const section = document.getElementById("screen-admin");
    let container = document.getElementById("adminContent");
    if (!container) {
      container = document.createElement("div");
      container.id = "adminContent";
      section.appendChild(container);
    }
    this.renderTab(this.state.tab);
  },

  renderTab(tab) {
    this.state.tab = tab;
    const container = document.getElementById("adminContent");
    if (!container) return;

    container.innerHTML = `
      <div class="admin-layout fade-in">
        <div class="admin-topbar">
          <h2>⚙️ Admin</h2>
        </div>
        <div class="admin-tabs">
          <button class="admin-tab ${tab === "stats" ? "active" : ""}" data-tab="stats">Statistika</button>
          <button class="admin-tab ${tab === "prix" ? "active" : ""}" data-tab="prix">Vidin'entana</button>
        </div>
        <div id="adminTabContent"></div>
      </div>
    `;

    container.querySelectorAll(".admin-tab").forEach((btn) => {
      btn.addEventListener("click", () => this.renderTab(btn.dataset.tab));
    });

    if (tab === "stats") this.renderStats();
    if (tab === "prix") this.renderPrices();
  },

  /* ------------------- STATISTIQUES ------------------- */
  renderStats() {
    const el = document.getElementById("adminTabContent");
    const stats = DATA.state.adminStats || { searches: 0, budgetSum: 0, popularity: {} };
    const avgBudget = stats.searches > 0 ? Math.round(stats.budgetSum / stats.searches) : 0;

    const popularEntries = Object.entries(stats.popularity || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([recipeId, count]) => {
        const recipe = DATA.getRecipe(recipeId);
        return { name: recipe ? recipe.name : recipeId, count };
      });

    el.innerHTML = `
      <div class="admin-stats-grid">
        <div class="stat-card">
          <span class="stat-value">${stats.searches}</span>
          <span class="stat-label">FIKAROHANA NATAO</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${CALC.formatAr(avgBudget)}</span>
          <span class="stat-label">BUDGET AN'ISAMBOTOANA</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${DATA.state.recipes.length}</span>
          <span class="stat-label">LAOKA AO AMIN'NY DATA</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${DATA.state.products.length}</span>
          <span class="stat-label">ENTANA AO AMIN'NY DATA</span>
        </div>
      </div>

      <h3 class="detail-subtitle">Laoka be mpitady indrindra</h3>
      ${
        popularEntries.length === 0
          ? `<p class="muted small">Mbola tsy misy antontan-kevitra.</p>`
          : `<div class="table-scroll"><table class="admin-table">
              <thead><tr><th>Laoka</th><th>Fikarohana</th></tr></thead>
              <tbody>
                ${popularEntries.map((p) => `<tr><td>${p.name}</td><td>${p.count}</td></tr>`).join("")}
              </tbody>
            </table></div>`
      }

      <button class="btn btn-tertiary btn-block" id="btnResetDemo" style="margin-top:20px;">↺ Averina amin'ny angona demo</button>
    `;

    document.getElementById("btnResetDemo").addEventListener("click", () => this.confirmReset());
  },

  confirmReset() {
    UI.openModal(`
      <div class="modal-header">
        <h2>Averina amin'ny angona demo ?</h2>
        <button class="modal-close" id="closeResetModal" aria-label="Hidiy">✕</button>
      </div>
      <p>Ho very daholo ny angona nampiana (stock, tantara, listani-bidiana, prix novaina...). Tsy azo averina io fihetsika io.</p>
      <div class="recipe-actions">
        <button class="btn btn-tertiary" id="cancelReset">Aoka ihany</button>
        <button class="btn btn-primary" id="confirmReset" style="background:var(--red);">Eny, averina</button>
      </div>
    `);
    document.getElementById("closeResetModal").addEventListener("click", () => UI.closeModal());
    document.getElementById("cancelReset").addEventListener("click", () => UI.closeModal());
    document.getElementById("confirmReset").addEventListener("click", () => {
      DATA.resetToDemo(true);
      UI.closeModal();
      UI.toast("↺ Averina tamin'ny angona demo.");
      this.renderTab("stats");
      UI.renderExpiryBadge();
    });
  },

  /* ------------------- GESTION DES PRIX ------------------- */
  renderPrices() {
    const el = document.getElementById("adminTabContent");
    const filter = this.state.priceFilter.trim().toLowerCase();
    const products = DATA.state.products
      .filter((p) => !filter || p.name.toLowerCase().includes(filter))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    el.innerHTML = `
      <div class="field">
        <input type="search" id="priceFilterInput" placeholder="Hikaroka entana..." value="${this.state.priceFilter}">
      </div>
      <div class="table-scroll">
        <table class="admin-table">
          <thead><tr><th>Entana</th><th>Vidiny</th><th></th></tr></thead>
          <tbody id="priceTableBody">
            ${products.map((p) => this.priceRowHTML(p)).join("")}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById("priceFilterInput").addEventListener("input", (e) => {
      this.state.priceFilter = e.target.value;
      this.renderPrices();
    });

    document.querySelectorAll("#priceTableBody [data-action='save-price']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest("tr");
        const productId = row.dataset.id;
        const input = row.querySelector("input[type='number']");
        const val = parseFloat(input.value);
        if (isNaN(val) || val < 0) {
          UI.toast("Vidiny tsy mety.");
          return;
        }
        DATA.updateProductPrice(productId, Math.round(val));
        UI.toast("✅ Vidiny voaova.");
      });
    });
  },

  priceRowHTML(product) {
    const unitLabel = typeof UNIT_LABELS !== "undefined" ? (UNIT_LABELS[product.unit] || product.unit) : product.unit;
    return `
      <tr data-id="${product.id}">
        <td>${product.name}</td>
        <td>
          <input type="number" value="${product.basePrice}" min="0" step="50" style="width:90px;"> / ${unitLabel}
        </td>
        <td><button class="btn-icon" data-action="save-price">💾</button></td>
      </tr>
    `;
  },
};
