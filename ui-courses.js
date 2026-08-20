/* ============================================================
   LAOKA — ui-courses.js
   Écran « COURSES » : liste de courses (DATA.state.shoppingList)
   Alimentée automatiquement par "+ Courses" sur une recette (ui.js),
   modifiable manuellement ici (ajout / cocher / supprimer / vider).
   ============================================================ */

const COURSES_UI = {
  render() {
    const el = document.getElementById("screen-courses");
    const list = DATA.state.shoppingList;
    const total = CALC.calculateShoppingCost(list.filter((i) => !i.checked));
    const totalAll = CALC.calculateShoppingCost(list);

    el.innerHTML = `
      <div class="page-header fade-in">
        <h2>Courses</h2>
        <p class="muted">Ny hovidiana</p>
      </div>

      <div class="action-row fade-in">
        <button class="btn btn-primary" id="btnAddCourseItem">+ Ajouter</button>
        ${list.length ? `<button class="btn btn-secondary" id="btnClearChecked">Effacer les cochés</button>` : ""}
      </div>

      ${
        list.length === 0
          ? `<div class="card empty-state fade-in"><p>Mbola tsy misy zavatra hovidiana. Ampio ny voalohany, na alao avy amin'ny laoka voafidy.</p></div>`
          : `
            <div class="card total-card fade-in">
              <div><span>Total restant à acheter</span><span>${CALC.formatAr(total)}</span></div>
              <div><span class="muted small">Total liste complète</span><span class="muted small">${CALC.formatAr(totalAll)}</span></div>
            </div>
            <div class="shopping-list fade-in" id="shoppingList">
              ${list.map((item) => this.shoppingItemHTML(item)).join("")}
            </div>
          `
      }
    `;

    document.getElementById("btnAddCourseItem").addEventListener("click", () => this.openAddForm());
    const clearBtn = document.getElementById("btnClearChecked");
    if (clearBtn) clearBtn.addEventListener("click", () => this.clearChecked());

    el.querySelectorAll(".shopping-item").forEach((row) => {
      const id = row.dataset.id;
      const checkbox = row.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => this.toggleChecked(id, checkbox.checked));
      const delBtn = row.querySelector("[data-action='delete']");
      if (delBtn) delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeItem(id);
      });
    });
  },

  shoppingItemHTML(item) {
    const product = DATA.getProduct(item.productId);
    const name = product ? product.name : item.productId;
    const unitLabel = (typeof UNIT_LABELS !== "undefined" && UNIT_LABELS[item.unit]) || item.unit;
    const price = product ? CALC.priceForQty(product, item.qty, item.unit) : 0;
    return `
      <label class="shopping-item ${item.checked ? "checked" : ""}" data-id="${item.id}">
        <input type="checkbox" ${item.checked ? "checked" : ""}>
        <span class="shopping-name">${name} — ${item.qty} ${unitLabel}</span>
        <span class="shopping-price">${CALC.formatAr(price)}</span>
        <button class="btn-icon danger" data-action="delete" aria-label="Supprimer" type="button">✕</button>
      </label>
    `;
  },

  toggleChecked(id, checked) {
    const item = DATA.state.shoppingList.find((i) => i.id === id);
    if (!item) return;
    item.checked = checked;
    DATA.saveData();
    this.render();
  },

  removeItem(id) {
    DATA.state.shoppingList = DATA.state.shoppingList.filter((i) => i.id !== id);
    DATA.saveData();
    this.render();
    UI.toast("Nesorina tao amin'ny lisitra.");
  },

  clearChecked() {
    const hadChecked = DATA.state.shoppingList.some((i) => i.checked);
    if (!hadChecked) return;
    DATA.state.shoppingList = DATA.state.shoppingList.filter((i) => !i.checked);
    DATA.saveData();
    this.render();
    UI.toast("Lisitra voadio.");
  },

  /* ------------------- FORMULAIRE AJOUT MANUEL ------------------- */
  openAddForm() {
    const products = DATA.state.products;
    const units = (typeof MEASURE_UNITS !== "undefined") ? MEASURE_UNITS : ["kg", "l", "piece", "bunch"];
    const unitLabels = (typeof UNIT_LABELS !== "undefined") ? UNIT_LABELS : {};
    const fractions = (typeof FRACTION_PRESETS !== "undefined") ? FRACTION_PRESETS : [];

    const html = `
      <div class="modal-header">
        <h2>Ajouter aux courses</h2>
        <button class="modal-close" id="closeCourseModal" aria-label="Hidiy">✕</button>
      </div>
      <form id="courseForm" class="form">
        <div class="field">
          <label for="cfProduct">Produit</label>
          <select id="cfProduct">
            ${products.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="cfQty">Quantité</label>
            <input type="number" id="cfQty" min="0.001" step="0.001" value="1" required>
            ${fractions.length ? `
              <select id="cfFraction" class="fraction-select">
                <option value="">— ou fraction —</option>
                ${fractions.map((f) => `<option value="${f.value}">${f.label}</option>`).join("")}
              </select>
            ` : ""}
          </div>
          <div class="field">
            <label for="cfUnit">Unité</label>
            <select id="cfUnit">
              ${units.map((u) => `<option value="${u}">${unitLabels[u] || u}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field-error hidden" id="cfErr"></div>
        <button type="submit" class="btn btn-primary btn-block">Ajouter</button>
      </form>
    `;
    UI.openModal(html);
    document.getElementById("closeCourseModal").addEventListener("click", () => UI.closeModal());

    const fractionSelect = document.getElementById("cfFraction");
    if (fractionSelect) {
      fractionSelect.addEventListener("change", () => {
        if (fractionSelect.value) document.getElementById("cfQty").value = Number(fractionSelect.value);
      });
    }

    // Pré-sélectionne l'unité par défaut du produit choisi
    const productSelect = document.getElementById("cfProduct");
    const unitSelect = document.getElementById("cfUnit");
    const syncUnit = () => {
      const product = DATA.getProduct(productSelect.value);
      if (product) unitSelect.value = product.unit;
    };
    productSelect.addEventListener("change", syncUnit);
    syncUnit();

    document.getElementById("courseForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const productId = productSelect.value;
      const qty = Number(document.getElementById("cfQty").value);
      const unit = unitSelect.value;
      const errEl = document.getElementById("cfErr");
      if (!qty || qty <= 0) {
        errEl.textContent = "Tsy azo atao ny habetsahana latsaka zero.";
        errEl.classList.remove("hidden");
        return;
      }
      errEl.classList.add("hidden");

      const existing = DATA.state.shoppingList.find((s) => s.productId === productId && !s.checked);
      if (existing) {
        existing.qty += qty;
      } else {
        DATA.state.shoppingList.push({
          id: "s_" + Date.now() + Math.random().toString(36).slice(2, 6),
          productId,
          qty,
          unit,
          checked: false,
        });
      }
      DATA.saveData();
      UI.closeModal();
      this.render();
      UI.toast("🛒 Nampidirina tao amin'ny HOVIDIANA");
    });
  },
};
