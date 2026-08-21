/* ============================================================
   LAOKA — ui-courses.js
   Écran « Courses » — liste de courses (DATA.state.shoppingList).
   Alimentée par UI.addRecipeToShoppingList (bouton "+ Courses" sur
   une carte recette). Permet de cocher/décocher, modifier la
   quantité, supprimer un article, et affiche le total à dépenser
   (articles non cochés uniquement).
   ============================================================ */

const COURSES_UI = {
  render() {
    const el = document.getElementById("screen-courses");
    const list = DATA.state.shoppingList || [];
    const total = this.calculateTotal(list);

    el.innerHTML = `
      <div class="page-header fade-in">
        <h2>🛒 Courses</h2>
        <p class="muted">Ireo entana tokony hovidiana.</p>
      </div>

      ${
        list.length === 0
          ? `<div class="card empty-state fade-in"><p>Mbola tsy misy entana ao amin'ny listani-bidianao. Ampio avy amin'ny laoka tianao.</p></div>`
          : `
      <div class="card total-card fade-in">
        <div><span>Total hovidiana</span><span>${CALC.formatAr(total)}</span></div>
      </div>
      <div class="shopping-list fade-in" id="shoppingListEl">
        ${list.map((item) => this.itemHTML(item)).join("")}
      </div>
      <button class="btn btn-tertiary btn-block" id="btnClearChecked">Fafao ireo efa voamarina</button>
      `
      }
    `;

    if (list.length === 0) return;

    document.querySelectorAll("#shoppingListEl .shopping-item").forEach((row) => {
      const id = row.dataset.id;
      const checkbox = row.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => this.toggleChecked(id, checkbox.checked));

      const removeBtn = row.querySelector("[data-action='remove']");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.removeItem(id);
        });
      }

      const qtyInput = row.querySelector("[data-action='qty']");
      if (qtyInput) {
        qtyInput.addEventListener("click", (e) => e.stopPropagation());
        qtyInput.addEventListener("change", () => {
          const val = parseFloat(qtyInput.value);
          this.updateQty(id, isNaN(val) || val <= 0 ? 0.01 : val);
        });
      }
    });

    const clearBtn = document.getElementById("btnClearChecked");
    if (clearBtn) clearBtn.addEventListener("click", () => this.clearChecked());
  },

  itemHTML(item) {
    const product = DATA.getProduct(item.productId);
    const name = product ? product.name : item.productId;
    const unitLabel = typeof UNIT_LABELS !== "undefined" ? (UNIT_LABELS[item.unit] || item.unit) : item.unit;
    const price = product ? CALC.priceForQty(product, item.qty, item.unit) : 0;

    return `
      <div class="shopping-item ${item.checked ? "checked" : ""}" data-id="${item.id}">
        <input type="checkbox" ${item.checked ? "checked" : ""} aria-label="Voamarina">
        <div class="shopping-name">
          ${name}
          <div class="muted small">
            <input type="number" class="qty-inline-input" data-action="qty" value="${item.qty}" min="0.01" step="0.01" style="width:60px;">
            ${unitLabel}
          </div>
        </div>
        <span class="shopping-price">${CALC.formatAr(price)}</span>
        <button class="btn-icon danger" data-action="remove" aria-label="Fafao">✕</button>
      </div>
    `;
  },

  /* Total = uniquement les articles non cochés (pas encore achetés) — cohérent avec le sens de
     "Montant à dépenser" utilisé ailleurs dans l'app (CALC.calculateShoppingCost). */
  calculateTotal(list) {
    return CALC.calculateShoppingCost(list.filter((i) => !i.checked));
  },

  toggleChecked(id, checked) {
    const item = DATA.state.shoppingList.find((s) => s.id === id);
    if (!item) return;
    item.checked = checked;
    DATA.saveData();
    this.render();
  },

  updateQty(id, qty) {
    const item = DATA.state.shoppingList.find((s) => s.id === id);
    if (!item) return;
    item.qty = qty;
    DATA.saveData();
    this.render();
  },

  removeItem(id) {
    DATA.state.shoppingList = DATA.state.shoppingList.filter((s) => s.id !== id);
    DATA.saveData();
    this.render();
    UI.toast("Nofafana.");
  },

  clearChecked() {
    const removed = DATA.state.shoppingList.filter((s) => s.checked).length;
    DATA.state.shoppingList = DATA.state.shoppingList.filter((s) => !s.checked);
    DATA.saveData();
    this.render();
    if (removed > 0) UI.toast(`🧹 ${removed} entana nofafana.`);
  },
};
