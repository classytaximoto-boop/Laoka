/* ============================================================
   LAOKA — ui-tsopitra.js
   Écran « NY AO AN-TSOPITRA » : stock, ajout, modification, achat
   ============================================================ */

const CATEGORY_LABELS = {
  legumes: "🥬 Légumes",
  viandes: "🥩 Viandes",
  vorona: "🐓 Vorona (volailles)",
  hazandrano: "🐟 Hazandrano (poisson d'eau douce)",
  trondro_maina: "🐟 Trondro maina (poisson séché)",
  hazandranomasina: "🐠 Hazandranomasina (poisson de mer)",
  fruits_de_mer: "🦐 Fruits de mer",
  special_boucher: "🥓 Special Boucher",
  atody: "🥚 Atody",
  huiles: "🛢️ Huiles",
  epices: "🌶️ Épices",
  cereales: "🌾 Céréales",
  legumineuses: "🫘 Légumineuses",
  autres: "📦 Autres",
  ambany_tanana: "🍖 Ambany tanana (abats & spécialités)",
};

const CATEGORY_ICONS = {
  legumes: "🥬", viandes: "🥩", vorona: "🐓",
  hazandrano: "🐟", trondro_maina: "🐟", hazandranomasina: "🐠", fruits_de_mer: "🦐", special_boucher: "🥓",
  atody: "🥚", huiles: "🛢️", epices: "🌶️", cereales: "🌾", legumineuses: "🫘", autres: "📦",
  ambany_tanana: "🍖",
};

const STATUS_LABELS = {
  fresh: { icon: "🟢", label: "Frais" },
  soon: { icon: "🟠", label: "À utiliser bientôt" },
  warning: { icon: "🔴", label: "Attention" },
};

/* Options <option> pour un sélecteur d'unité, basées sur MEASURE_UNITS/UNIT_LABELS (data.js).
   selected : valeur à présélectionner. */
function unitOptionsHTML(selected) {
  return MEASURE_UNITS.map((u) => `<option value="${u}" ${u === selected ? "selected" : ""}>${UNIT_LABELS[u]}</option>`).join("");
}

/* Bloc HTML "quantité" avec un input libre + un sélecteur rapide de fractions courantes.
   idPrefix : préfixe des id (ex: "pf" -> #pfQty, #pfFraction). */
function quantityFieldHTML(idPrefix, value) {
  return `
    <div class="field">
      <label for="${idPrefix}Qty">Quantité</label>
      <input type="number" id="${idPrefix}Qty" min="0.001" step="0.001" value="${value}" required>
      <select id="${idPrefix}Fraction" class="fraction-select">
        <option value="">— ou fraction —</option>
        ${FRACTION_PRESETS.map((f) => `<option value="${f.value}">${f.label}</option>`).join("")}
      </select>
    </div>
  `;
}

/* À appeler après insertion du HTML : quand une fraction est choisie, elle remplit le champ qty. */
function bindQuantityFraction(idPrefix) {
  const fractionSelect = document.getElementById(idPrefix + "Fraction");
  const qtyInput = document.getElementById(idPrefix + "Qty");
  if (!fractionSelect || !qtyInput) return;
  fractionSelect.addEventListener("change", () => {
    if (fractionSelect.value) qtyInput.value = Number(fractionSelect.value);
  });
}

const TSOPITRA_UI = {
  render() {
    const el = document.getElementById("screen-tsopitra");
    const pantry = DATA.state.pantry;

    const byCategory = {};
    pantry.forEach((item) => {
      const product = DATA.getProduct(item.productId);
      const cat = product ? product.category : "autres";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });

    const soonItems = STOCK.getItemsToUseSoon();

    el.innerHTML = `
      <div class="page-header fade-in">
        <h2>Ny ao an-tsopitra</h2>
        <p class="muted">Inona no mbola misy ao an-trano?</p>
      </div>

      <div class="action-row fade-in">
        <button class="btn btn-primary" id="btnAddPantry">+ Ajouter</button>
        <button class="btn btn-secondary" id="btnNovidy">🛒 Novidy</button>
      </div>

      ${
        soonItems.length > 0
          ? `<div class="card alert-card fade-in">
              <div class="alert-card-title">Aza avela ho very</div>
              ${soonItems.map((i) => {
                const p = DATA.getProduct(i.productId);
                const status = STOCK.getFreshnessStatus(i);
                return `<p>${STATUS_LABELS[status].icon} ${p ? p.name : i.productId} — tandremo, efa ela no notehirizina. Jereo ny fofona, bobongolo, loko ary endriny. Raha misy fiovana mampiahiahy, ario.</p>`;
              }).join("")}
              <button class="btn btn-secondary btn-block" id="btnSearchFromSoon">Mitady laoka amin'izany</button>
            </div>`
          : ""
      }

      <div id="pantryByCategory">
        ${
          Object.keys(byCategory).length === 0
            ? `<div class="card empty-state"><p>Mbola tsy misy zavatra ao an-tsopitra. Ampio ny akora voalohany.</p></div>`
            : Object.entries(byCategory).map(([cat, items]) => `
              <section class="section fade-in">
                <h3 class="section-title">${CATEGORY_LABELS[cat] || cat}</h3>
                <div class="pantry-grid">
                  ${items.map((item) => this.pantryCardHTML(item)).join("")}
                </div>
              </section>
            `).join("")
        }
      </div>
    `;

    document.getElementById("btnAddPantry").addEventListener("click", () => this.openAddForm());
    document.getElementById("btnNovidy").addEventListener("click", () => this.openNovidyForm());
    const soonBtn = document.getElementById("btnSearchFromSoon");
    if (soonBtn) soonBtn.addEventListener("click", () => UI.openSearchForm());

    el.querySelectorAll(".pantry-card").forEach((card) => {
      const id = card.dataset.id;
      const item = pantry.find((p) => p.id === id);
      card.querySelector("[data-action='use']").addEventListener("click", () => this.usePantryItem(item));
      card.querySelector("[data-action='edit']").addEventListener("click", () => this.openEditForm(item));
      card.querySelector("[data-action='delete']").addEventListener("click", () => this.confirmDelete(item));
    });
  },

  pantryCardHTML(item) {
    const product = DATA.getProduct(item.productId);
    const status = STOCK.getFreshnessStatus(item);
    const statusInfo = STATUS_LABELS[status];
    const icon = product ? CATEGORY_ICONS[product.category] : "📦";
    return `
      <div class="pantry-card" data-id="${item.id}">
        <div class="pantry-card-top">
          <span class="pantry-icon">${icon}</span>
          <div>
            <div class="pantry-name">${product ? product.name : item.productId}</div>
            <div class="pantry-qty">${item.qty} ${this.unitLabel(item.unit)}</div>
          </div>
        </div>
        <div class="pantry-meta">
          <span>Acheté : ${this.formatDate(item.purchaseDate)}</span>
          <span class="status-pill">${statusInfo.icon} ${statusInfo.label}</span>
        </div>
        <div class="pantry-actions">
          <button class="btn-icon" data-action="use" aria-label="Utiliser">Utiliser</button>
          <button class="btn-icon" data-action="edit" aria-label="Modifier">Modifier</button>
          <button class="btn-icon danger" data-action="delete" aria-label="Supprimer">Supprimer</button>
        </div>
      </div>
    `;
  },

  unitLabel(unit) {
    return UNIT_LABELS[unit] || unit;
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
  },

  usePantryItem(item) {
    this.confirmAction(
      `Marquer « ${DATA.getProduct(item.productId)?.name || item.productId} » comme utilisé (retiré du stock) ?`,
      () => {
        STOCK.removePantryItem(item.id);
        UI.renderExpiryBadge();
        this.render();
        UI.toast("Nesorina tao amin'ny tsopitra.");
      }
    );
  },

  confirmDelete(item) {
    this.confirmAction(
      `Hamafa ny « ${DATA.getProduct(item.productId)?.name || item.productId} » ?`,
      () => {
        STOCK.removePantryItem(item.id);
        UI.renderExpiryBadge();
        this.render();
        UI.toast("Nofafana.");
      }
    );
  },

  confirmAction(message, onConfirm) {
    UI.openModal(`
      <div class="modal-header"><h2>Hamarina</h2></div>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="confirmNo">Tsia</button>
        <button class="btn btn-primary" id="confirmYes">Eny</button>
      </div>
    `);
    document.getElementById("confirmNo").addEventListener("click", () => UI.closeModal());
    document.getElementById("confirmYes").addEventListener("click", () => {
      UI.closeModal();
      onConfirm();
    });
  },

  /* ------------------- FORMULAIRE AJOUTER / MODIFIER ------------------- */
  openAddForm() {
    this.openPantryForm(null);
  },
  openEditForm(item) {
    this.openPantryForm(item);
  },

  openPantryForm(existing) {
    const products = DATA.state.products;
    const categories = [...new Set(products.map((p) => p.category))];
    const isEdit = !!existing;

    const html = `
      <div class="modal-header">
        <h2>${isEdit ? "Modifier" : "Ajouter au tsopitra"}</h2>
        <button class="modal-close" id="closePantryModal" aria-label="Hidiy">✕</button>
      </div>
      <form id="pantryForm" class="form">
        <div class="field">
          <label for="pfCategory">Catégorie</label>
          <select id="pfCategory">
            ${categories.map((c) => `<option value="${c}">${CATEGORY_LABELS[c] || c}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="pfProduct">Nom de l'aliment</label>
          <select id="pfProduct"></select>
        </div>
        <div class="field-row">
          ${quantityFieldHTML("pf", existing ? existing.qty : 1)}
          <div class="field">
            <label for="pfUnit">Unité</label>
            <select id="pfUnit">
              ${unitOptionsHTML(existing ? existing.unit : "piece")}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="pfDate">Date d'achat</label>
          <input type="date" id="pfDate" value="${existing ? existing.purchaseDate : new Date().toISOString().slice(0,10)}">
        </div>
        <div class="field">
          <label for="pfPrice">Prix payé (optionnel)</label>
          <div class="input-suffix">
            <input type="number" id="pfPrice" min="0" step="100" value="0">
            <span class="suffix">Ar</span>
          </div>
        </div>
        <div class="field">
          <label for="pfStorage">Lieu de stockage</label>
          <select id="pfStorage">
            <option value="Frigo">Frigo</option>
            <option value="Placard">Placard</option>
            <option value="Congélateur">Congélateur</option>
          </select>
        </div>
        <div class="field-error hidden" id="pfErr"></div>
        <button type="submit" class="btn btn-primary btn-block">Enregistrer</button>
      </form>
    `;
    UI.openModal(html);
    document.getElementById("closePantryModal").addEventListener("click", () => UI.closeModal());
    bindQuantityFraction("pf");

    const catSelect = document.getElementById("pfCategory");
    const productSelect = document.getElementById("pfProduct");
    const unitSelect = document.getElementById("pfUnit");
    const storageSelect = document.getElementById("pfStorage");

    const fillProducts = (category) => {
      const filtered = products.filter((p) => p.category === category);
      productSelect.innerHTML = filtered.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
    };

    if (existing) {
      const existingProduct = DATA.getProduct(existing.productId);
      catSelect.value = existingProduct ? existingProduct.category : categories[0];
      fillProducts(catSelect.value);
      productSelect.value = existing.productId;
      unitSelect.value = existing.unit;
      storageSelect.value = existing.storage || "Placard";
    } else {
      fillProducts(catSelect.value);
    }

    catSelect.addEventListener("change", () => fillProducts(catSelect.value));

    document.getElementById("pantryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const qty = Number(document.getElementById("pfQty").value);
      const errEl = document.getElementById("pfErr");
      if (!qty || qty <= 0) {
        errEl.textContent = "Tsy azo atao ny habetsahana latsaka zero.";
        errEl.classList.remove("hidden");
        return;
      }
      errEl.classList.add("hidden");

      const item = {
        id: existing ? existing.id : null,
        productId: productSelect.value,
        qty,
        unit: unitSelect.value,
        purchaseDate: document.getElementById("pfDate").value || new Date().toISOString().slice(0,10),
        storage: storageSelect.value,
      };
      STOCK.updatePantry(item);
      UI.closeModal();
      UI.renderExpiryBadge();
      this.render();
      UI.toast(isEdit ? "Novaozina." : "Nampidirina tao amin'ny tsopitra.");
    });
  },

  /* ------------------- FORMULAIRE NOVIDY (achat rapide) ------------------- */
  openNovidyForm() {
    const products = DATA.state.products;
    const html = `
      <div class="modal-header">
        <h2>Novidy</h2>
        <button class="modal-close" id="closeNovidyModal" aria-label="Hidiy">✕</button>
      </div>
      <form id="novidyForm" class="form">
        <div class="field">
          <label for="nfProduct">Produit</label>
          <select id="nfProduct">
            ${products.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
        <div class="field-row">
          ${quantityFieldHTML("nf", 1)}
          <div class="field">
            <label for="nfUnit">Unité</label>
            <select id="nfUnit">
              ${unitOptionsHTML("piece")}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="nfPrice">Prix</label>
          <div class="input-suffix">
            <input type="number" id="nfPrice" min="0" step="100" value="0">
            <span class="suffix">Ar</span>
          </div>
        </div>
        <p class="muted small">Date : automatique (aujourd'hui)</p>
        <div class="field-error hidden" id="nfErr"></div>
        <button type="submit" class="btn btn-primary btn-block">Enregistrer l'achat</button>
      </form>
    `;
    UI.openModal(html);
    document.getElementById("closeNovidyModal").addEventListener("click", () => UI.closeModal());
    bindQuantityFraction("nf");

    document.getElementById("novidyForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const productId = document.getElementById("nfProduct").value;
      const qty = Number(document.getElementById("nfQty").value);
      const unit = document.getElementById("nfUnit").value;
      const price = Number(document.getElementById("nfPrice").value) || 0;
      const errEl = document.getElementById("nfErr");
      if (!qty || qty <= 0) {
        errEl.textContent = "Tsy azo atao ny habetsahana latsaka zero.";
        errEl.classList.remove("hidden");
        return;
      }
      if (price < 0) {
        errEl.textContent = "Tsy azo atao ny vidiny latsaka zero.";
        errEl.classList.remove("hidden");
        return;
      }
      errEl.classList.add("hidden");

      const existingInPantry = DATA.state.pantry.find((p) => p.productId === productId);
      const finalize = () => {
        STOCK.addPurchase(productId, qty, unit, price);
        UI.closeModal();
        UI.renderExpiryBadge();
        this.render();
        UI.toast("🛒 Novidy voarakitra, nampiana ny stock.");
      };

      if (existingInPantry) {
        const productName = DATA.getProduct(productId)?.name || productId;
        UI.openModal(`
          <div class="modal-header"><h2>Efa misy</h2></div>
          <p>Efa misy ${productName} ao an-tsopitra. Ampiana amin'ny stock ve?</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="novidyNo">Tsia</button>
            <button class="btn btn-primary" id="novidyYes">Eny, ampiana</button>
          </div>
        `);
        document.getElementById("novidyNo").addEventListener("click", () => UI.closeModal());
        document.getElementById("novidyYes").addEventListener("click", finalize);
      } else {
        finalize();
      }
    });
  },
};
