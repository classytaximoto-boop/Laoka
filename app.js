/* ============================================================
   LAOKA — app.js
   Logique de l'application : DATA / STOCK / CALCUL / RECOMMANDATION / UI / ADMIN
   ============================================================ */

/* ============================================================
   SECTION: DATA — chargement / sauvegarde localStorage
   ============================================================ */
const STORAGE_KEY = "laoka_state_v1";

const DATA = {
  state: null,

  /** Charge l'état depuis localStorage, ou initialise les données de démo */
  loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.state = JSON.parse(raw);
        // Migration douce : s'assurer que toutes les clés existent
        this.state.products = this.state.products || structuredClone(DEFAULT_PRODUCTS);
        this.state.recipes = this.state.recipes || structuredClone(DEFAULT_RECIPES);
        this.state.compatibility = this.state.compatibility || structuredClone(DEFAULT_COMPATIBILITY);
        this.state.pantry = this.state.pantry || [];
        this.state.history = this.state.history || [];
        this.state.profile = this.state.profile || structuredClone(DEFAULT_PROFILE);
        this.state.settings = this.state.settings || structuredClone(DEFAULT_SETTINGS);
        this.state.shoppingList = this.state.shoppingList || [];
        this.state.adminStats = this.state.adminStats || { searches: 0, budgetSum: 0, popularity: {} };

        // --- Migration douce : nouveaux champs (ne renomme rien, ajoute avec fallback) ---
        // Nouvelle catégorie de recettes "ro_mazava" (bouillon clair), séparée de recipes[]
        this.state.roMazavaRecipes = this.state.roMazavaRecipes || structuredClone(DEFAULT_RO_MAZAVA_RECIPES);
        // dishCategory sur les recettes existantes (anciennes recettes = "laoka" par défaut)
        this.state.recipes.forEach((r) => {
          if (!r.dishCategory) r.dishCategory = "laoka";
        });
        // Nouveaux produits ambany_tanana / poissons séchés / fruits de mer / voamaina :
        // fusionner les produits par défaut absents du state existant (sans écraser les prix modifiés par l'utilisateur)
        const existingIds = new Set(this.state.products.map((p) => p.id));
        DEFAULT_PRODUCTS.forEach((p) => {
          if (!existingIds.has(p.id)) this.state.products.push(structuredClone(p));
        });
        // Réglage du ton des messages (Simple / Élégant / Professionnel / Basy vava)
        if (!this.state.settings.tone) this.state.settings.tone = "simple";
        return this.state;
      } catch (e) {
        console.warn("Etat corrompu, réinitialisation.", e);
      }
    }
    this.resetToDemo(false);
    return this.state;
  },

  /** Sauvegarde l'état actuel dans localStorage */
  saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  /** Réinitialise toutes les données aux valeurs de démonstration */
  resetToDemo(persist = true) {
    this.state = {
      products: structuredClone(DEFAULT_PRODUCTS),
      recipes: structuredClone(DEFAULT_RECIPES),
      roMazavaRecipes: structuredClone(DEFAULT_RO_MAZAVA_RECIPES),
      compatibility: structuredClone(DEFAULT_COMPATIBILITY),
      pantry: structuredClone(DEFAULT_PANTRY),
      history: structuredClone(DEFAULT_HISTORY),
      profile: structuredClone(DEFAULT_PROFILE),
      settings: { ...structuredClone(DEFAULT_SETTINGS), tone: "simple" },
      shoppingList: [],
      adminStats: { searches: 0, budgetSum: 0, popularity: {} },
    };
    if (persist) this.saveData();
  },

  getProduct(id) {
    return this.state.products.find((p) => p.id === id);
  },
  getRecipe(id) {
    return this.state.recipes.find((r) => r.id === id);
  },
};

/* ============================================================
   SECTION: CALCUL — conversions d'unités et prix
   ============================================================ */
const CALC = {
  /** Convertit une quantité (qty, unit) vers l'unité de base du produit et calcule le prix.
   *  basePrice est le prix pour 1 unité complète (1kg, 1L, 1 pièce).
   *  Ex: huile 8500 Ar/L, recette utilise 30 ml -> 8500/1000*30 = 255 Ar (ml -> l : /1000)
   */
  toBaseQty(qty, unit, productUnit) {
    // normalise vers l'unité de base du produit (kg, l, piece, bunch, kapoaka, tsongo, madco, tanana)
    if (productUnit === "kg") {
      if (unit === "g") return qty / 1000;
      return qty; // déjà en kg
    }
    if (productUnit === "l") {
      if (unit === "ml") return qty / 1000;
      return qty; // déjà en L
    }
    // piece / bunch / kapoaka / tsongo / madco / tanana : unités discrètes, pas de sous-unité de conversion fiable
    return qty;
  },

  priceForQty(product, qty, unit) {
    if (!product) return 0;
    const baseQty = this.toBaseQty(qty, unit, product.unit);
    return Math.round(product.basePrice * baseQty);
  },

  /** Calcule le coût détaillé d'une recette en tenant compte du stock disponible.
   *  Retourne : { lines[], totalConsumption, totalToBuy, haveList[], buyList[] }
   *  - totalConsumption = coût total des ingrédients consommés (même si déjà en stock)
   *  - totalToBuy = montant réellement à dépenser au marché (ingrédients manquants uniquement)
   */
  calculateRecipeCost(recipe, pantry) {
    const lines = [];
    let totalConsumption = 0;
    let totalToBuy = 0;
    const haveList = [];
    const buyList = [];

    recipe.ingredients.forEach((ing) => {
      const product = DATA.getProduct(ing.productId);
      if (!product) return;
      const consumptionCost = this.priceForQty(product, ing.qty, ing.unit);
      totalConsumption += consumptionCost;

      const stockQty = STOCK.getAvailableQty(pantry, ing.productId, product.unit);
      const neededBaseQty = this.toBaseQty(ing.qty, ing.unit, product.unit);
      const hasEnough = stockQty >= neededBaseQty;

      let toBuyCost = 0;
      if (!hasEnough) {
        const missingQty = neededBaseQty - stockQty;
        toBuyCost = Math.round(product.basePrice * missingQty);
        totalToBuy += toBuyCost;
        buyList.push({ productId: product.id, name: product.name, missingQty, unit: product.unit });
      } else {
        haveList.push({ productId: product.id, name: product.name });
      }

      lines.push({
        productId: product.id,
        name: product.name,
        qty: ing.qty,
        unit: ing.unit,
        consumptionCost,
        hasEnough,
        toBuyCost,
      });
    });

    return { lines, totalConsumption, totalToBuy, haveList, buyList };
  },

  /** Coût total d'une liste de courses (produits manquants agrégés) */
  calculateShoppingCost(shoppingList) {
    return shoppingList.reduce((sum, item) => {
      const product = DATA.getProduct(item.productId);
      if (!product) return sum;
      return sum + this.priceForQty(product, item.qty, item.unit);
    }, 0);
  },

  formatAr(amount) {
    return Math.round(amount).toLocaleString("fr-FR").replace(/,/g, " ") + " Ar";
  },
};

/* ============================================================
   SECTION: STOCK — gestion du tsopitra (garde-manger)
   ============================================================ */
const STOCK = {
  /** Quantité disponible totale d'un produit dans le stock, exprimée dans l'unité de base du produit */
  getAvailableQty(pantry, productId, productUnit) {
    return pantry
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + CALC.toBaseQty(item.qty, item.unit, productUnit), 0);
  },

  /** Ajoute ou met à jour un article du stock (formulaire "Ajouter au Tsopitra") */
  updatePantry(item) {
    if (item.id) {
      const idx = DATA.state.pantry.findIndex((p) => p.id === item.id);
      if (idx >= 0) DATA.state.pantry[idx] = item;
    } else {
      item.id = "p_" + Date.now();
      DATA.state.pantry.push(item);
    }
    DATA.saveData();
  },

  removePantryItem(id) {
    DATA.state.pantry = DATA.state.pantry.filter((p) => p.id !== id);
    DATA.saveData();
  },

  /** Ajoute un achat ("NOVIDY") : augmente le stock, fusionne si le produit existe déjà */
  addPurchase(productId, qty, unit, price) {
    const existing = DATA.state.pantry.find((p) => p.productId === productId && p.unit === unit);
    const today = new Date().toISOString().slice(0, 10);
    if (existing) {
      existing.qty += qty;
      existing.purchaseDate = today;
      DATA.saveData();
      return { merged: true, item: existing };
    }
    const product = DATA.getProduct(productId);
    const newItem = {
      id: "p_" + Date.now(),
      productId,
      qty,
      unit,
      purchaseDate: today,
      storage: product && product.category === "viandes" ? "Frigo" : "Placard",
    };
    DATA.state.pantry.push(newItem);
    DATA.saveData();
    return { merged: false, item: newItem };
  },

  /** Déduit le stock après avoir cuisiné une recette ("ATAO ANIO") */
  deductForRecipe(recipe) {
    recipe.ingredients.forEach((ing) => {
      const product = DATA.getProduct(ing.productId);
      if (!product) return;
      let remaining = CALC.toBaseQty(ing.qty, ing.unit, product.unit);
      const items = DATA.state.pantry
        .filter((p) => p.productId === ing.productId)
        .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
      for (const item of items) {
        if (remaining <= 0) break;
        const itemBaseQty = CALC.toBaseQty(item.qty, item.unit, product.unit);
        if (itemBaseQty <= remaining) {
          remaining -= itemBaseQty;
          item.qty = 0;
        } else {
          const newBaseQty = itemBaseQty - remaining;
          item.qty = item.unit === "g" || item.unit === "ml" ? newBaseQty * 1000 : newBaseQty;
          remaining = 0;
        }
      }
      DATA.state.pantry = DATA.state.pantry.filter((p) => p.qty > 0.0001);
    });
    DATA.saveData();
  },

  /** Statut de conservation d'un article : "fresh" | "soon" | "warning" */
  getFreshnessStatus(item) {
    const product = DATA.getProduct(item.productId);
    const category = product ? product.category : "autres";
    const shelfDays = SHELF_LIFE_DAYS[category] || 30;
    const purchased = new Date(item.purchaseDate);
    const now = new Date();
    const daysElapsed = Math.floor((now - purchased) / (1000 * 60 * 60 * 24));
    const ratio = daysElapsed / shelfDays;
    if (ratio >= 1) return "warning";
    if (ratio >= 0.7) return "soon";
    return "fresh";
  },

  /** Articles proches de péremption ou dépassés, pour la section "AZA AVELA HO VERY" */
  getItemsToUseSoon() {
    return DATA.state.pantry.filter((item) => {
      const status = this.getFreshnessStatus(item);
      return status === "soon" || status === "warning";
    });
  },

  checkExpiry() {
    return this.getItemsToUseSoon();
  },
};

/* ============================================================
   SECTION: HISTORIQUE
   ============================================================ */
const HISTORY = {
  saveMealHistory(recipeId, label) {
    const today = new Date().toISOString().slice(0, 10);
    DATA.state.history.push({ id: "h_" + Date.now(), date: today, recipeId, label });
    DATA.saveData();
  },

  /** Renvoie un message de réaction de LAOKA si le plat a été mangé récemment, sinon null */
  getRepetitionMessage(recipeId) {
    const today = new Date();
    const sorted = [...DATA.state.history]
      .filter((h) => h.recipeId === recipeId)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) return null;
    const last = new Date(sorted[0].date);
    const daysAgo = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (daysAgo <= 1) {
      return {
        type: "repeat_yesterday",
        message: "Vao omaly no nihinananao an'io an! Mankaleo be izany. Sa atao an'izay ihany?",
      };
    }
    if (daysAgo <= 3) {
      return {
        type: "repeat_recent",
        message: "Efa nihinana an'io tato ho ato ianao. Andao hijery hafa?",
      };
    }
    if (daysAgo >= 14) {
      return {
        type: "long_time",
        message: "Elaela tsy nihinana an'io ianao. Andao averina?",
      };
    }
    return null;
  },

  daysSinceLastEaten(recipeId) {
    const sorted = [...DATA.state.history]
      .filter((h) => h.recipeId === recipeId)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) return Infinity;
    const today = new Date();
    const last = new Date(sorted[0].date);
    return Math.floor((today - last) / (1000 * 60 * 60 * 24));
  },
};

/* ============================================================
   SECTION: RECOMMANDATION — moteur principal
   ============================================================ */
const RECO = {
  /** Filtre + score les recettes selon les filtres fournis.
   *  filters: { budget, people, mealTime, laokaType }
   *  Retourne un tableau trié de { recipe, cost, score, reasons[], overBudget }
   */
  getRecommendations(filters) {
    const profile = DATA.state.profile;
    const pantry = DATA.state.pantry;
    let candidates = DATA.state.recipes.slice();

    // 0. dishCategory "achard" masqué par défaut de la recherche standard,
    //    sauf si l'utilisateur active explicitement filters.includeAchard.
    //    ("laoka" et "ambany_tanana" restent visibles normalement ; "ro_mazava"
    //    n'est de toute façon pas dans DATA.state.recipes.)
    if (!filters.includeAchard) {
      candidates = candidates.filter((r) => r.dishCategory !== "achard");
    }

    // 1. Filtrer moment
    if (filters.mealTime) {
      candidates = candidates.filter((r) => r.moment.includes(filters.mealTime));
    }
    // 2. Filtrer type de laoka
    if (filters.laokaType) {
      candidates = candidates.filter((r) => r.type === filters.laokaType);
    }
    // 3. FADY : exclusion totale
    candidates = candidates.filter((r) => {
      return !r.ingredients.some((ing) => profile.fady.includes(ing.productId));
    });
    // 3b. Porc explicite si fady contient henakisoa (déjà couvert), et Halal/Mpino
    if (profile.halal || profile.dietMode === "halal") {
      candidates = candidates.filter((r) => !r.containsPork && r.diet.includes("halal"));
    }
    if (profile.dietMode === "vegetarien") {
      candidates = candidates.filter((r) => r.diet.includes("vegetarien"));
    }
    if (profile.dietMode === "sabatista") {
      candidates = candidates.filter((r) => r.diet.includes("sabatista"));
    }
    if (profile.dietMode === "mpino") {
      candidates = candidates.filter((r) => r.diet.includes("mpino"));
    }

    // 4. Filtrer recettes incompatibles (règles de compatibilité "incompatible")
    candidates = candidates.filter((r) => !this.hasIncompatiblePair(r));

    // 5. Calculer prix + score pour chaque candidate
    const soonItems = STOCK.getItemsToUseSoon().map((i) => i.productId);
    const scored = candidates.map((recipe) => {
      const cost = CALC.calculateRecipeCost(recipe, pantry);
      const scaledToBuy = this.scaleCostForServings(cost.totalToBuy, recipe.servings, filters.people);
      const scaledConsumption = this.scaleCostForServings(cost.totalConsumption, recipe.servings, filters.people);
      const overBudget = filters.budget ? scaledToBuy > filters.budget : false;

      let score = 0;
      const reasons = [];

      if (filters.budget && !overBudget) {
        score += 3;
        reasons.push("Mifanaraka amin'ny budget");
      } else if (overBudget) {
        score -= 4;
      }

      const haveRatio = cost.lines.length ? cost.haveList.length / cost.lines.length : 0;
      score += haveRatio * 3;
      if (haveRatio >= 0.5) reasons.push("Maro ny akora efa ao an-trano");

      const usesSoonItem = recipe.ingredients.some((ing) => soonItems.includes(ing.productId));
      if (usesSoonItem) {
        score += 3;
        reasons.push("Mampiasa akora tokony hoentina haingana");
      }

      if (profile.likes.includes(recipe.id) || recipe.ingredients.some((i) => profile.likes.includes(i.productId))) {
        score += 2;
        reasons.push("Mifanaraka amin'ny tianao");
      }
      if (profile.dislikes.includes(recipe.id) || recipe.ingredients.some((i) => profile.dislikes.includes(i.productId))) {
        score -= 2;
      }

      if (filters.mealTime && recipe.moment.includes(filters.mealTime)) score += 1;
      if (filters.laokaType && recipe.type === filters.laokaType) score += 1;

      const daysSince = HISTORY.daysSinceLastEaten(recipe.id);
      if (daysSince <= 1) score -= 3;
      else if (daysSince <= 3) score -= 1;
      else if (daysSince >= 14) score += 1;

      return {
        recipe,
        cost,
        scaledToBuy,
        scaledConsumption,
        overBudget,
        score,
        reasons,
        repetitionMessage: HISTORY.getRepetitionMessage(recipe.id),
      };
    });

    // 6. Trier par score décroissant
    scored.sort((a, b) => b.score - a.score);

    // Stat admin
    DATA.state.adminStats.searches += 1;
    if (filters.budget) DATA.state.adminStats.budgetSum += filters.budget;
    scored.slice(0, 5).forEach((s) => {
      DATA.state.adminStats.popularity[s.recipe.id] = (DATA.state.adminStats.popularity[s.recipe.id] || 0) + 1;
    });
    DATA.saveData();

    return scored;
  },

  scaleCostForServings(cost, baseServings, targetServings) {
    if (!targetServings || !baseServings) return cost;
    return Math.round((cost / baseServings) * targetServings);
  },

  hasIncompatiblePair(recipe) {
    const ids = recipe.ingredients.map((i) => i.productId);
    return DATA.state.compatibility.some((rule) => {
      if (rule.level !== "incompatible") return false;
      return ids.includes(rule.a) && ids.includes(rule.b);
    });
  },

  /** Vérifie les paires "peu recommandé" dans une recette pour affichage d'avertissement */
  getWarningPairs(recipe) {
    const ids = recipe.ingredients.map((i) => i.productId);
    return DATA.state.compatibility.filter(
      (rule) => rule.level === "peu_recommande" && ids.includes(rule.a) && ids.includes(rule.b)
    );
  },

  /** Suggestion "LAOKA ANIO" pour l'accueil : meilleur résultat sans filtre de budget strict */
  getTodaySuggestion() {
    const results = this.getRecommendations({ people: 4 });
    return results.length ? results[0] : null;
  },
};

/* ============================================================
   Export global (utilisé par ui.js)
   ============================================================ */
window.DATA = DATA;
window.CALC = CALC;
window.STOCK = STOCK;
window.HISTORY = HISTORY;
window.RECO = RECO;
