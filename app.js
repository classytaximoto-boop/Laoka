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
        // Nouvelles tables prompt 2/4 : cuisson<->aliment, cuisson<->épices. Mergées (pas remplacées)
        // pour ne jamais écraser des règles ajoutées manuellement par l'utilisateur depuis un état
        // déjà sauvegardé (voir mergeNewDefaultRules, même logique que products ci-dessus).
        this.state.cookingCompatibility = this.state.cookingCompatibility || structuredClone(COOKING_COMPATIBILITY);
        this.state.spiceCompatibility = this.state.spiceCompatibility || structuredClone(SPICE_COMPATIBILITY);
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
        // Nouvelles recettes par défaut (ex: sélection Fety, prompt 3/4) : fusionner uniquement les
        // recettes dont l'id n'existe pas encore dans le state sauvegardé — ne modifie et n'écrase
        // jamais une recette déjà présente (même comportement de fusion douce que pour les produits).
        const existingRecipeIds = new Set(this.state.recipes.map((r) => r.id));
        DEFAULT_RECIPES.forEach((r) => {
          if (!existingRecipeIds.has(r.id)) this.state.recipes.push(structuredClone(r));
        });
        // Réglage du ton des messages (Simple / Élégant / Professionnel / Basy vava)
        if (!this.state.settings.tone) this.state.settings.tone = "simple";

        // --- Migration architecture Menu principal / Laoka (prompts 1/3/4) ---
        this.migrateArchitecture();
        return this.state;
      } catch (e) {
        console.warn("Etat corrompu, réinitialisation.", e);
      }
    }
    this.resetToDemo(false);
    return this.state;
  },

  /** Migration douce vers la nouvelle architecture Menu principal / Laoka (prompts 1, 3, 4).
   *  N'écrase JAMAIS une valeur déjà présente (prix personnalisés, recettes modifiées...).
   *  Ajoute uniquement les champs manquants avec un fallback dérivé des données existantes. */
  migrateArchitecture() {
    const st = this.state;

    // 1. Produits : isIndicativePrice / priceUpdatedAt / foodRole (menu principal)
    const menuPrincipalIds = new Set(typeof MENU_PRINCIPAL_PRODUCT_IDS !== "undefined" ? MENU_PRINCIPAL_PRODUCT_IDS : []);
    st.products.forEach((p) => {
      if (p.isIndicativePrice === undefined) p.isIndicativePrice = true;
      if (!p.priceUpdatedAt) p.priceUpdatedAt = null; // null = jamais modifié manuellement depuis Paramètres
      if (!p.foodRole && menuPrincipalIds.has(p.id)) p.foodRole = "menu_principal";
    });

    // 2. Recettes (recipes[] + roMazavaRecipes[]) : foodRole / dishSubCategory / ingredientType /
    //    cookingMethod / incompatibleWith / season — ajoutés uniquement si absents.
    const allRecipeLists = [st.recipes, st.roMazavaRecipes].filter(Boolean);
    allRecipeLists.forEach((list) => {
      list.forEach((r) => this.migrateRecipeFields(r));
    });

    // 3. Compatibilité : percentage dérivé de level si absent (rétrocompat totale)
    const LEVEL_TO_PERCENTAGE = { compatible: 0, acceptable: 10, peu_recommande: 40, incompatible: 100 };
    (st.compatibility || []).forEach((rule) => {
      if (rule.percentage === undefined || rule.percentage === null) {
        rule.percentage = LEVEL_TO_PERCENTAGE[rule.level] !== undefined ? LEVEL_TO_PERCENTAGE[rule.level] : 40;
      }
      if (!rule.level) {
        // dérive un level approximatif depuis percentage pour tout code qui lirait encore `level`
        if (rule.percentage >= 100) rule.level = "incompatible";
        else if (rule.percentage >= 40) rule.level = "peu_recommande";
        else if (rule.percentage >= 10) rule.level = "acceptable";
        else rule.level = "compatible";
      }
    });

    // 4. incompatibleWith sur les recettes : migrer l'ancien format simple ({productIds:[id,...]})
    //    vers le nouveau format avec percentage ({productIds:[{productId,percentage}], ...})
    //    sans jamais fabriquer une incompatibilité fictive : percentage par défaut = 100 (comportement
    //    historique, où toute entrée dans incompatibleWith.productIds/typeIds valait exclusion totale).
    allRecipeLists.forEach((list) => {
      list.forEach((r) => this.migrateIncompatibleWith(r));
    });

    // 5. Nouvelles tables cuisson<->aliment / cuisson<->épices (prompt 2/4) : fusionne les nouvelles
    //    règles par défaut absentes d'un state déjà sauvegardé, sans jamais dupliquer une règle
    //    existante ni écraser une règle modifiée manuellement (comparaison par clé composite).
    if (!st.cookingCompatibility) st.cookingCompatibility = structuredClone(COOKING_COMPATIBILITY);
    else this.mergeMissingRules(st.cookingCompatibility, COOKING_COMPATIBILITY, (r) => `${r.productId}|${r.mode}`);
    if (!st.spiceCompatibility) st.spiceCompatibility = structuredClone(SPICE_COMPATIBILITY);
    else this.mergeMissingRules(st.spiceCompatibility, SPICE_COMPATIBILITY, (r) => `${r.productId}|${r.mode}|${r.spiceId}`);
  },

  /** Ajoute dans `list` (in place) les entrées de `defaults` dont la clé (via keyFn) n'existe pas
   *  déjà dans `list` — ne modifie ni ne supprime jamais une entrée existante. Utilisé pour fusionner
   *  les nouvelles règles par défaut (cuisson/épices) dans un state déjà sauvegardé, sans dupliquer
   *  ni écraser une règle personnalisée. */
  mergeMissingRules(list, defaults, keyFn) {
    const existingKeys = new Set(list.map(keyFn));
    defaults.forEach((rule) => {
      if (!existingKeys.has(keyFn(rule))) {
        list.push(structuredClone(rule));
        existingKeys.add(keyFn(rule));
      }
    });
  },

  /** Ajoute les nouveaux champs métier sur une recette existante, sans écraser ceux déjà présents. */
  migrateRecipeFields(r) {
    // cookingMethod : alias du champ historique `type`
    if (!r.cookingMethod && r.type) r.cookingMethod = r.type;

    // foodRole : dérivé de dishCategory si absent
    if (!r.foodRole) {
      if (r.dishCategory === "achard") r.foodRole = "condiment";
      else r.foodRole = "laoka"; // laoka / ambany_tanana / ro_mazava / laoka historique -> laoka
    }

    // dishSubCategory : dérivé de dishCategory + type (cookingMethod) si absent
    if (!r.dishSubCategory) {
      if (r.dishCategory === "achard") r.dishSubCategory = "achard";
      else if (r.dishCategory === "ro_mazava") r.dishSubCategory = "ro_mazava";
      else if (r.dishCategory === "ambany_tanana") r.dishSubCategory = "ambany_tanana";
      // hanikotrana (collation/goûter à base de mangahazo/vomanga/saonjo nature) : sous-catégorie
      // dédiée, distincte des laoka classiques qui utilisent les mêmes tubercules comme ingrédient.
      else if (r.dishCategory === "hanikotrana") r.dishSubCategory = "hanikotrana";
      else if (r.dishCategory === "bebe") r.dishSubCategory = "bebe";
      else if (r.dishCategory === "gouter") r.dishSubCategory = "gouter";
      else if (r.type === "RONY") r.dishSubCategory = "rony";
      else if (r.type === "RITRA") r.dishSubCategory = "ritra";
      else if (r.type === "KETSAKETSA") r.dishSubCategory = "ketsaketsa";
      else if (r.type === "KIENDY") r.dishSubCategory = "kiendy";
      else if (r.type === "VOAMAINA") r.dishSubCategory = "voamaina";
      else r.dishSubCategory = "laoka_classique";
    }

    // ingredientType : dérivé du premier ingrédient connu si absent (best effort, jamais bloquant)
    if (!r.ingredientType) {
      r.ingredientType = this.guessIngredientType(r);
    }

    // incompatibleWith / season déjà couverts ailleurs dans loadData, mais on s'assure ici aussi
    // (cas d'appel direct à migrateArchitecture sans passer par loadData, ex: après un import).
    if (!r.incompatibleWith) r.incompatibleWith = { productIds: [], typeIds: [], custom: [] };
    if (!r.season) r.season = [];
    if (!r.diet) r.diet = ["standard"];
  },

  /** Devine ingredientType à partir de la catégorie des produits utilisés dans la recette.
   *  Ne fabrique jamais une classification arbitraire : retourne null si aucune correspondance claire.
   *  Depuis l'audit (prompt 1/4), la plupart des produits portent déjà un ingredientType explicite ;
   *  cette table de repli (categoryToType) reste alignée sur les catégories produit désormais
   *  spécifiques (vorona/hazandrano/hazandranomasina/fruits_de_mer/special_boucher/ambany_tanana),
   *  donc la déduction est directe et n'a plus besoin d'heuristique sur le nom du produit. */
  guessIngredientType(r) {
    if (!r.ingredients || !r.ingredients.length) return null;
    const categoryToType = {
      viandes: "hena", vorona: "vorona", legumes: "legumes", legumineuses: "voamaina",
      atody: "atody", ambany_tanana: "ambany_tanana", hazandrano: "hazan_drano",
      trondro_maina: "hazan_drano",
      hazandranomasina: "hazandranomasina", fruits_de_mer: "fruits_de_mer",
      special_boucher: "special_boucher", holatra: "holatra",
    };
    for (const ing of r.ingredients) {
      const product = (DEFAULT_PRODUCTS.find((p) => p.id === ing.productId)) || (this.state && this.state.products || []).find((p) => p.id === ing.productId);
      if (product && product.ingredientType) return product.ingredientType;
      if (product && categoryToType[product.category]) return categoryToType[product.category];
    }
    return null;
  },

  /** Migre incompatibleWith de l'ancien format simple vers {productIds:[{productId,percentage}],...} */
  migrateIncompatibleWith(r) {
    if (!r.incompatibleWith) {
      r.incompatibleWith = { products: [], types: [], custom: [] };
      return;
    }
    const iw = r.incompatibleWith;
    const isLegacyArray = (arr) => Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "string";

    if (isLegacyArray(iw.productIds)) {
      iw.products = iw.productIds.map((productId) => ({ productId, percentage: 100 }));
    } else if (!iw.products) {
      iw.products = [];
    }
    if (isLegacyArray(iw.typeIds)) {
      iw.types = iw.typeIds.map((typeId) => ({ typeId, percentage: 100 }));
    } else if (!iw.types) {
      iw.types = [];
    }
    if (!iw.custom) iw.custom = [];
    else if (typeof iw.custom[0] === "string") {
      iw.custom = iw.custom.filter(Boolean).map((text) => ({ text, percentage: 100 }));
    }
  },

  /** Sauvegarde l'état actuel dans localStorage. Renvoie true en cas de succès, false sinon — les
   *  appelants qui doivent informer l'utilisateur (toast) doivent vérifier ce retour plutôt que de
   *  supposer que la sauvegarde a réussi. Échec le plus courant : quota localStorage dépassé (ex.
   *  accumulation de photos importées en base64 sur les laoka, voir ui-laoka-form.js photoImage). */
  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      return true;
    } catch (err) {
      console.error("DATA.saveData a échoué :", err);
      return false;
    }
  },

  /** Réinitialise toutes les données aux valeurs de démonstration */
  resetToDemo(persist = true) {
    this.state = {
      products: structuredClone(DEFAULT_PRODUCTS),
      recipes: structuredClone(DEFAULT_RECIPES),
      roMazavaRecipes: structuredClone(DEFAULT_RO_MAZAVA_RECIPES),
      compatibility: structuredClone(DEFAULT_COMPATIBILITY),
      cookingCompatibility: structuredClone(COOKING_COMPATIBILITY),
      spiceCompatibility: structuredClone(SPICE_COMPATIBILITY),
      pantry: structuredClone(DEFAULT_PANTRY),
      history: structuredClone(DEFAULT_HISTORY),
      profile: structuredClone(DEFAULT_PROFILE),
      settings: { ...structuredClone(DEFAULT_SETTINGS), tone: "simple" },
      shoppingList: [],
      adminStats: { searches: 0, budgetSum: 0, popularity: {} },
    };
    this.migrateArchitecture();
    if (persist) this.saveData();
  },

  getProduct(id) {
    return this.state.products.find((p) => p.id === id);
  },
  getRecipe(id) {
    return this.state.recipes.find((r) => r.id === id) || this.state.roMazavaRecipes.find((r) => r.id === id);
  },

  /** Met à jour le prix d'un produit (Paramètres/Admin) — source de vérité centralisée.
   *  Les recettes ne stockent jamais un prix figé : elles référencent product.basePrice via
   *  ingredients[].productId, donc le changement est répercuté immédiatement par CALC/RECO. */
  updateProductPrice(productId, newPrice) {
    const product = this.getProduct(productId);
    if (!product) return null;
    product.basePrice = newPrice;
    product.priceUpdatedAt = new Date().toISOString();
    product.isIndicativePrice = false; // un prix modifié manuellement n'est plus "indicatif de démo"
    this.saveData();
    return product;
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

  priceForQty(product, qty, unit, people) {
    if (!product) return 0;
    if (product.hasForfait && Array.isArray(product.forfaitTiers) && product.forfaitTiers.length > 0) {
      const forfaitPrice = this.forfaitPriceForPeople(product.forfaitTiers, people);
      if (forfaitPrice !== null) return forfaitPrice;
      // aucune tranche ne couvre ce nombre de personnes -> on retombe sur le calcul normal
    }
    const baseQty = this.toBaseQty(qty, unit, product.unit);
    return Math.round(product.basePrice * baseQty);
  },

  /** Cherche, parmi les tranches saisies par l'utilisateur (forfaitTiers), celle qui couvre le
   *  nombre de personnes demandé, et renvoie son prix. Une tranche a la forme
   *  { minPeople, maxPeople, price } — maxPeople peut être null/undefined pour représenter
   *  "et plus" (ex: tranche "fête" sans limite haute). Renvoie null si aucune tranche ne
   *  correspond (ex: people non fourni, ou aucune tranche ne couvre ce nombre).
   */
  forfaitPriceForPeople(forfaitTiers, people) {
    const p = Number(people) || 1;
    const tier = forfaitTiers.find((t) => {
      const min = Number(t.minPeople) || 1;
      const max = (t.maxPeople === null || t.maxPeople === undefined || t.maxPeople === "") ? Infinity : Number(t.maxPeople);
      return p >= min && p <= max;
    });
    return tier ? Math.round(Number(tier.price) || 0) : null;
  },

  /** Produits dont le coût n'est jamais compté dans le prix d'un laoka (par plat/par personne), ni
   *  dans la liste de courses, ni déduits du stock lors de "Atao anio" : sel et huile. En cuisine
   *  malgache, quand on dit "sauce" (ex. "chou en sauce"), on parle de tomate/oignon — le sel et
   *  l'huile de cuisson font partie de l'équipement de base du foyer, pas du coût du plat.
   *  Ils restent affichés dans les étapes/texte de la recette (informatif), et un utilisateur peut
   *  toujours les gérer manuellement dans son Tsopitra s'il le souhaite — seule l'économie
   *  automatique de l'app (prix affiché, courses générées, déduction de stock au moment de cuisiner)
   *  les ignore. */
  PRICE_EXCLUDED_PRODUCT_IDS: ["sira", "menaka"],

  /** Quantité minimale réellement achetable au marché, selon l'unité du produit — même si la
   *  recette n'a besoin que d'une plus petite quantité, le prix reflète ce qu'on paie vraiment.
   *  - kg -> 1/4 kg minimum, kapoaka -> 1/2 kapoaka minimum (fractions possibles au marché).
   *  - piece, bunch, tsongo, madco, tanana -> unités discrètes, on ne peut pas acheter une
   *    fraction d'un objet entier : le minimum est TOUJOURS 1 unité entière (arrondi au nombre
   *    entier supérieur dès que la quantité nécessaire est > 0), voir applyMarketMinQty.
   */
  MARKET_MIN_QTY: { kg: 0.25, kapoaka: 0.5 },
  MARKET_DISCRETE_UNITS: ["piece", "bunch", "tsongo", "madco", "tanana"],

  applyMarketMinQty(product, baseQty) {
    if (baseQty <= 0) return baseQty;
    if (this.MARKET_DISCRETE_UNITS.includes(product.unit)) {
      // Unité entière indivisible : on ne peut jamais acheter moins qu'un objet complet, donc on
      // arrondit toujours au nombre entier supérieur (ex: besoin de 0.3 pièce -> on paie 1 pièce).
      return Math.ceil(baseQty);
    }
    const min = this.MARKET_MIN_QTY[product.unit];
    if (min && baseQty < min) return min;
    return baseQty;
  },

  /** Calcule le coût détaillé d'une recette en tenant compte du stock disponible.
   *  Retourne : { lines[], totalConsumption, totalToBuy, forfaitConsumption, forfaitToBuy,
   *               scalableConsumption, scalableToBuy, haveList[], buyList[] }
   *  - totalConsumption = coût total des ingrédients consommés (même si déjà en stock)
   *  - totalToBuy = montant réellement à dépenser au marché (ingrédients manquants uniquement)
   *  - forfaitConsumption / forfaitToBuy = part du total venant de produits en mode forfait
   *    (product.hasForfait) — déjà calculée pour le bon nombre de personnes (people), à NE PAS
   *    remettre à l'échelle ensuite (voir scaleCostForServings).
   *  - scalableConsumption / scalableToBuy = part du total venant de produits en calcul normal
   *    (prorata qty x basePrice, basé sur recipe.servings) — celle-ci doit être mise à l'échelle
   *    proportionnellement quand on cherche pour un nombre de personnes différent.
   *  - sira (sel) et menaka (huile) sont exclus du calcul (voir PRICE_EXCLUDED_PRODUCT_IDS)
   *  - people : nombre de personnes demandé, nécessaire pour les produits en mode forfait
   *    (product.hasForfait) — ignoré pour les produits en calcul normal.
   */
  /** Types d'ingrédients concernés par les modes de portion (economique/normal/robaroba) — voir
   *  PORTION_MODE_GRAMS_PER_PERSON (data.js) et applyPortionMode ci-dessous. Couvre viandes,
   *  volailles, poissons (eau douce/mer), fruits de mer, champignons (holatra), abats. Les légumes,
   *  anana, céréales, légumineuses, épices, etc. restent inchangés — prorata classique sur
   *  recipe.servings comme avant. */
  PROTEIN_INGREDIENT_TYPES: ["hena", "vorona", "hazan_drano", "hazandranomasina", "fruits_de_mer", "holatra", "ambany_tanana", "special_boucher"],

  /** Riz uniquement (vary_fotsy/vary_mena) — PAS les autres féculents (manioc, vomanga, saonjo...),
   *  qui restent au calcul normal. Ratios propres au riz, séparés de la protéine (voir
   *  RICE_PORTION_GRAMS_PER_PERSON dans data.js) : base 2 kapoaka, réparti sur un nombre de
   *  personnes différent par mode (3 en normal, 2 en robaroba, 5 en économique). */
  RICE_PRODUCT_IDS: ["vary_fotsy", "vary_mena"],

  /** Pour un ingrédient protéiné et un mode de portion donné, renvoie la quantité totale ajustée
   *  (en kg) pour `people` personnes — indépendante de recipe.servings, contrairement au calcul
   *  normal par prorata. Ex: mode "normal", 4 personnes -> 4 × (250/3) g = 333g ≈ 0.333 kg, quel
   *  que soit le nombre de personnes de base de la recette. */
  portionAdjustedKg(people, portionMode) {
    const gramsPerPerson = PORTION_MODE_GRAMS_PER_PERSON[portionMode] || PORTION_MODE_GRAMS_PER_PERSON.normal;
    return ((people || 1) * gramsPerPerson) / 1000;
  },

  /** Équivalent de portionAdjustedKg, mais pour le riz — grammage par personne différent
   *  (RICE_PORTION_GRAMS_PER_PERSON, voir data.js), calculé à partir de 2 kapoaka de base. */
  ricePortionAdjustedKg(people, portionMode) {
    const gramsPerPerson = RICE_PORTION_GRAMS_PER_PERSON[portionMode] || RICE_PORTION_GRAMS_PER_PERSON.normal;
    return ((people || 1) * gramsPerPerson) / 1000;
  },

  /** cost, pantry, people : comme calculateRecipeCost. portionMode (optionnel) : "economique" |
   *  "normal" | "robaroba" — si fourni, remplace la quantité des ingrédients protéinés
   *  (PROTEIN_INGREDIENT_TYPES) par le grammage du mode × people, calculé une fois pour toutes
   *  ici (déjà à l'échelle de `people`) plutôt que par le prorata recipe.servings classique.
   *  Ces lignes remontent dans consumption/toBuy directement (bucket portionAdjusted*, jamais
   *  remis à l'échelle par scaleCostForServings en aval — voir getRecommendations). Les autres
   *  ingrédients (légumes, anana...) suivent le calcul normal, inchangé.
   *
   *  Résultat retourné :
   *  - totalConsumption / totalToBuy = somme de TOUT (protéiné + normal), pour affichage direct
   *    (ex: fiche détail à `people` personnes, sans mise à l'échelle supplémentaire nécessaire).
   *  - scalableConsumption / scalableToBuy = part du total venant de produits en calcul normal
   *    (prorata qty x basePrice, basé sur recipe.servings) — celle-ci doit être mise à l'échelle
   *    proportionnellement quand on cherche pour un nombre de personnes différent.
   *  - portionAdjustedConsumption / portionAdjustedToBuy = part venant des ingrédients protéinés
   *    en mode portion — déjà calculée pour `people`, à additionner telle quelle, jamais reproratée.
   *  - sira (sel) et menaka (huile) sont exclus du calcul (voir PRICE_EXCLUDED_PRODUCT_IDS)
   *  - people : nombre de personnes demandé, nécessaire pour les produits en mode forfait
   *    (product.hasForfait) et pour le calcul des ingrédients protéinés en mode portion.
   */
  calculateRecipeCost(recipe, pantry, people, portionMode) {
    const lines = [];
    let totalConsumption = 0;
    let totalToBuy = 0;
    let forfaitConsumption = 0;
    let forfaitToBuy = 0;
    let scalableConsumption = 0;
    let scalableToBuy = 0;
    let portionAdjustedConsumption = 0;
    let portionAdjustedToBuy = 0;
    const haveList = [];
    const buyList = [];

    recipe.ingredients.forEach((ing) => {
      if (this.PRICE_EXCLUDED_PRODUCT_IDS.includes(ing.productId)) return;
      const product = DATA.getProduct(ing.productId);
      if (!product) return;
      const isForfait = product.hasForfait && Array.isArray(product.forfaitTiers) && product.forfaitTiers.length > 0;

      // Mode portion : ingrédients protéinés (grammage protéine) OU riz (grammage riz, ratios
      // différents — voir ricePortionAdjustedKg) — jamais les deux à la fois pour un même produit,
      // et seulement s'ils ne sont pas en forfait (le forfait a sa propre logique de palier par
      // personne, prioritaire).
      const isProtein = this.PROTEIN_INGREDIENT_TYPES.includes(product.ingredientType);
      const isRice = this.RICE_PRODUCT_IDS.includes(product.id);
      const isPortionAdjustable = portionMode && !isForfait && (isProtein || isRice);
      const effectiveQty = isPortionAdjustable
        ? (isRice ? this.ricePortionAdjustedKg(people, portionMode) : this.portionAdjustedKg(people, portionMode))
        : ing.qty;
      const effectiveUnit = isPortionAdjustable ? "kg" : ing.unit;

      const consumptionCost = this.priceForQty(product, effectiveQty, effectiveUnit, people);
      totalConsumption += consumptionCost;
      if (isForfait) forfaitConsumption += consumptionCost;
      else if (isPortionAdjustable) portionAdjustedConsumption += consumptionCost;
      else scalableConsumption += consumptionCost;

      const stockQty = STOCK.getAvailableQty(pantry, ing.productId, product.unit);
      const neededBaseQty = this.toBaseQty(effectiveQty, effectiveUnit, product.unit);
      const hasEnough = stockQty >= neededBaseQty;

      let toBuyCost = 0;
      if (!hasEnough) {
        const missingQty = neededBaseQty - stockQty;
        if (isForfait) {
          // Produit en forfait : le prix ne dépend pas de la quantité manquante, mais du palier
          // de personnes (déjà calculé dans consumptionCost) — on réutilise directement ce montant.
          toBuyCost = consumptionCost;
          forfaitToBuy += toBuyCost;
        } else {
          // Produit hors forfait : le prix reflète le minimum réellement achetable au marché
          // (1/4 kg, 1/2 kapoaka...), même si la quantité manquante est plus petite.
          const buyableQty = this.applyMarketMinQty(product, missingQty);
          toBuyCost = Math.round(product.basePrice * buyableQty);
          if (isPortionAdjustable) portionAdjustedToBuy += toBuyCost;
          else scalableToBuy += toBuyCost;
        }
        totalToBuy += toBuyCost;
        buyList.push({ productId: product.id, name: product.name, missingQty, unit: product.unit });
      } else {
        haveList.push({ productId: product.id, name: product.name });
      }

      lines.push({
        productId: product.id,
        name: product.name,
        qty: effectiveQty,
        unit: effectiveUnit,
        consumptionCost,
        hasEnough,
        toBuyCost,
        isForfait,
        isPortionAdjustable,
      });
    });

    return { lines, totalConsumption, totalToBuy, forfaitConsumption, forfaitToBuy, scalableConsumption, scalableToBuy, portionAdjustedConsumption, portionAdjustedToBuy, haveList, buyList };
  },

  /** Coût total d'une liste de courses (produits manquants agrégés). Sel et huile sont exclus du
   *  total (voir PRICE_EXCLUDED_PRODUCT_IDS) même s'ils ont été ajoutés manuellement à la liste. */
  calculateShoppingCost(shoppingList) {
    return shoppingList.reduce((sum, item) => {
      if (this.PRICE_EXCLUDED_PRODUCT_IDS.includes(item.productId)) return sum;
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
      storage: product && ["viandes", "vorona", "hazandrano", "hazandranomasina", "fruits_de_mer", "special_boucher", "ambany_tanana"].includes(product.category) ? "Frigo" : "Placard",
    };
    DATA.state.pantry.push(newItem);
    DATA.saveData();
    return { merged: false, item: newItem };
  },

  /** Déduit le stock après avoir cuisiné une recette ("ATAO ANIO"). Sel et huile ne sont jamais
   *  déduits (voir CALC.PRICE_EXCLUDED_PRODUCT_IDS) : ils ne font pas partie de l'économie du plat
   *  suivie par l'app, même si physiquement on les utilise en cuisinant. */
  deductForRecipe(recipe) {
    recipe.ingredients.forEach((ing) => {
      if (CALC.PRICE_EXCLUDED_PRODUCT_IDS.includes(ing.productId)) return;
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
    // Menu principal (vary, mangahazo, katsaka, vomanga, saonjo...) n'est JAMAIS mélangé aux
    // résultats de laoka : la recherche standard ne porte que sur les recettes de recipes[]
    // (qui ne contiennent que foodRole "laoka"/"condiment" par construction — le menu principal
    // vit dans DATA.state.products avec foodRole "menu_principal", pas dans recipes[]).
    let candidates = DATA.state.recipes.slice();

    // 0. dishCategory "achard" masqué par défaut de la recherche standard,
    //    sauf si l'utilisateur active explicitement filters.includeAchard.
    //    ("laoka" et "ambany_tanana" restent visibles normalement ; "ro_mazava"
    //    n'est de toute façon pas dans DATA.state.recipes.)
    if (!filters.includeAchard) {
      candidates = candidates.filter((r) => r.dishCategory !== "achard");
    }

    // 0b. Filtre par catégorie de laoka (dishSubCategory) — regroupement demandé par la recherche :
    //     Laoka -> toutes sous-catégories ; Voalena -> uniquement voalena ; Ambany tanana -> uniquement
    //     ambany_tanana ; Voamaina -> uniquement voamaina ; Achard/Lasary -> uniquement achard ; Rony -> rony.
    if (filters.dishSubCategory) {
      candidates = candidates.filter((r) => r.dishSubCategory === filters.dishSubCategory);
    }
    // 0c. Filtre par type d'ingrédient principal (legumes/anana/hena/voamaina/hazan_drano/hazandranomasina/atody)
    if (filters.ingredientType) {
      candidates = candidates.filter((r) => r.ingredientType === filters.ingredientType);
    }
    // 0d. Filtre par saison
    if (filters.season) {
      candidates = candidates.filter((r) => !r.season || r.season.length === 0 || r.season.includes(filters.season));
    }
    // 0e. Filtre par régime alimentaire explicite (diet), indépendant du profil global
    if (filters.diet) {
      candidates = candidates.filter((r) => r.diet && r.diet.includes(filters.diet));
    }

    // 1. Filtrer moment
    if (filters.mealTime) {
      candidates = candidates.filter((r) => r.moment.includes(filters.mealTime));
    }
    // 2. Filtrer par "Karazana laoka" (LAOKA_KIND — catégorie d'ingrédient principal, distincte
    //    du mode de préparation "Atao"/type). VORONA/TRONDRO n'ont pas de champ dédié dans les
    //    recettes : on les déduit best-effort via animalSource/ingredientType, sans jamais exclure
    //    une recette faute de donnée claire (comportement non-bloquant, cf guessIngredientType).
    if (filters.laokaType) {
      candidates = candidates.filter((r) => this.matchesLaokaKind(r, filters.laokaType, filters.trondroState));
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

    // 4. Filtrer recettes incompatibles à 100% (exclusion totale — équivaut à l'ancien level "incompatible").
    //    Les pourcentages < 100 ne sont PAS des exclusions : ils deviennent une pénalité de score
    //    graduelle appliquée plus bas (voir getCompatibilityPenalty), sans casser le comportement
    //    d'exclusion historique pour les règles à 100%/"incompatible".
    candidates = candidates.filter((r) => !this.hasIncompatiblePair(r));

    // 4b. Ro Matsatso : exclusion stricte et automatique de toute recette dishSubCategory="ro_matsatso"
    //     qui ne respecte pas la règle absolue (anana + eau uniquement). Ne filtre QUE les recettes
    //     explicitement marquées ro_matsatso — ne touche jamais un "rony" classique par ailleurs
    //     (prompt 2/4, règle absolue).
    candidates = candidates.filter((r) => r.dishSubCategory !== "ro_matsatso" || this.isValidRoMatsatso(r));

    // 4c. Cuisson/aliment et cuisson/épices marquées "interdit" : exclusion totale, comme le 100%
    //     de compatibilité aliment+aliment. "incompatible" reste une pénalité graduelle (voir 5).
    candidates = candidates.filter((r) => !this.hasForbiddenCookingOrSpice(r));

    // 5. Calculer prix + score pour chaque candidate
    const soonItems = STOCK.getItemsToUseSoon().map((i) => i.productId);
    const scored = candidates.map((recipe) => {
      const cost = CALC.calculateRecipeCost(recipe, pantry, filters.people, filters.portionMode);
      // Le forfait (voatabia/tongolo, etc.) est déjà calculé pour filters.people — on ne le
      // remet pas à l'échelle. Idem pour la part "portion" (viande/poisson/etc. en mode
      // economique/normal/robaroba, voir CALC.calculateRecipeCost) : déjà calculée pour
      // filters.people via le grammage du mode, indépendamment de recipe.servings. Seule la part
      // "normale" restante (légumes, anana...) est mise à l'échelle par rapport à recipe.servings.
      let scaledToBuy = this.scaleCostForServings(cost.scalableToBuy, recipe.servings, filters.people, recipe) + cost.forfaitToBuy + cost.portionAdjustedToBuy;
      let scaledConsumption = this.scaleCostForServings(cost.scalableConsumption, recipe.servings, filters.people, recipe) + cost.forfaitConsumption + cost.portionAdjustedConsumption;
      let displayPeople = filters.people;
      let budgetAdjusted = false;
      let overBudget = filters.budget ? scaledToBuy > filters.budget : false;

      // Ajustement automatique au budget : deux stratégies selon si un mode de portion est actif.
      // - AVEC portionMode : le nombre de personnes ne bouge jamais — c'est le grammage des
      //   ingrédients protéinés qui a déjà été choisi par l'utilisateur (economique/normal/robaroba,
      //   voir calculateRecipeCost). Si ça dépasse quand même le budget, on laisse overBudget tel
      //   quel (message d'avertissement classique), sans réduire displayPeople.
      // - SANS portionMode (comportement historique, rétrocompatible) : on réduit discrètement le
      //   nombre de personnes pour rentrer dans le budget, comme avant.
      if (!filters.portionMode && overBudget && filters.people > 1) {
        const adjusted = this.findMaxPeopleForBudget(recipe, pantry, filters.budget, filters.people);
        if (adjusted && adjusted.people < filters.people) {
          scaledToBuy = adjusted.scaledToBuy;
          scaledConsumption = adjusted.scaledConsumption;
          displayPeople = adjusted.people;
          budgetAdjusted = true;
          overBudget = false;
        }
      }

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
      if (filters.laokaType && this.matchesLaokaKind(recipe, filters.laokaType, filters.trondroState)) score += 1;

      // Pénalité graduelle de compatibilité (0-100%) : contrairement à l'exclusion à 100% déjà
      // appliquée au filtrage (étape 4), les paliers 10-90% pénalisent le score sans exclure la
      // recette, et le résultat explique pourquoi via reasons[].
      const compatPenalty = this.getCompatibilityPenalty(recipe);
      if (compatPenalty.totalPenaltyScore > 0) {
        score -= compatPenalty.totalPenaltyScore;
        compatPenalty.explanations.forEach((msg) => reasons.push(msg));
      }

      // Pénalité graduelle cuisson/aliment + cuisson/épices (prompt 2/4) : "incompatible" pénalise
      // sans exclure (contrairement à "interdit", déjà filtré à l'étape 4c). "rare_traditionnel" et
      // "conditionnel" restent informatifs, sans impact sur le score.
      const cookingPenalty = this.getCookingCompatibilityPenalty(recipe);
      if (cookingPenalty.totalPenaltyScore > 0) {
        score -= cookingPenalty.totalPenaltyScore;
        cookingPenalty.explanations.forEach((msg) => reasons.push(msg));
      }

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
        people: displayPeople,
        budgetAdjusted,
        requestedPeople: filters.people,
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

  /** Facteur de dilution appliqué aux laoka de type Rony : à quantité d'ingrédients égale, un
   *  rony (bouillon) sert environ 3x plus de personnes qu'un ritra équivalent (ex: 500g de bœuf
   *  suffit pour ~7 personnes en ritra, mais peut aller jusqu'à ~15-21 en rony selon la dilution).
   *  Concrètement : pour N personnes demandées, on ne met les ingrédients à l'échelle que pour
   *  N / RONY_DILUTION_FACTOR — donc le coût par personne diminue pour un rony par rapport à un
   *  ritra qui utiliserait les mêmes ingrédients de base. */
  RONY_DILUTION_FACTOR: 3,

  /** cost : montant à mettre à l'échelle. baseServings : nombre de personnes de base de la recette
   *  (recipe.servings). targetServings : nombre de personnes demandé. recipe (optionnel) : si fourni
   *  et que recipe.dishSubCategory === "rony", applique RONY_DILUTION_FACTOR à targetServings avant
   *  le calcul du prorata (voir RONY_DILUTION_FACTOR ci-dessus). */
  scaleCostForServings(cost, baseServings, targetServings, recipe) {
    if (!targetServings || !baseServings) return cost;
    const effectiveTarget = recipe && recipe.dishSubCategory === "rony"
      ? targetServings / this.RONY_DILUTION_FACTOR
      : targetServings;
    return Math.round((cost / baseServings) * effectiveTarget);
  },

  /** Cherche, en partant de requestedPeople et en descendant jusqu'à 1, le plus grand nombre de
   *  personnes pour lequel le prix (scaledToBuy) rentre dans le budget donné. Recalcule
   *  entièrement le coût à chaque essai (via CALC.calculateRecipeCost) car les produits en
   *  forfait ne varient pas linéairement avec le nombre de personnes — un simple prorata du
   *  résultat déjà calculé pour requestedPeople donnerait un montant faux pour eux.
   *  Retourne { people, scaledToBuy, scaledConsumption } ou null si même 1 personne dépasse
   *  le budget (cas limite géré par l'appelant : bandeau d'avertissement classique en dernier
   *  recours). */
  findMaxPeopleForBudget(recipe, pantry, budget, requestedPeople) {
    for (let p = requestedPeople - 1; p >= 1; p--) {
      const cost = CALC.calculateRecipeCost(recipe, pantry, p);
      const scaledToBuy = this.scaleCostForServings(cost.scalableToBuy, recipe.servings, p, recipe) + cost.forfaitToBuy;
      if (scaledToBuy <= budget) {
        const scaledConsumption = this.scaleCostForServings(cost.scalableConsumption, recipe.servings, p, recipe) + cost.forfaitConsumption;
        return { people: p, scaledToBuy, scaledConsumption };
      }
    }
    return null;
  },

  /** Teste si une recette correspond à une valeur de LAOKA_KIND ("Karazana laoka").
   *  Best-effort : ne casse jamais si l'info exacte manque sur la recette (comportement
   *  cohérent avec guessIngredientType, jamais bloquant par excès de zèle).
   *  kind : une valeur de LAOKA_KIND (audit prompt 1/4 : HENA et VORONA sont désormais deux groupes
   *  alimentaires distincts et exclusifs — HENA ne redéduit plus VORONA en excluant le poulet, il
   *  se base directement sur ingredientType="hena", VORONA sur ingredientType="vorona").
   *  trondroState : "maina" | "lena" | null, utilisé pour HAZANDRANO/HAZANDRANOMASINA (poisson). */
  matchesLaokaKind(recipe, kind, trondroState) {
    switch (kind) {
      case "VOAMAINA":
        return recipe.ingredientType === "voamaina" || recipe.dishSubCategory === "voamaina" || recipe.type === "VOAMAINA";
      case "VOALENA":
        return recipe.dishSubCategory === "voalena" || recipe.dishCategory === "voalena";
      case "ANANA":
        return recipe.ingredientType === "anana";
      case "LEGUMES":
        return recipe.ingredientType === "legumes" || recipe.type === "LEGUMES";
      case "HENA":
        return recipe.ingredientType === "hena";
      case "VORONA":
        return recipe.ingredientType === "vorona" || recipe.animalSource === "poulet";
      case "HAZANDRANO":
      case "HAZANDRANOMASINA": {
        const wantType = kind === "HAZANDRANO" ? "hazan_drano" : "hazandranomasina";
        const isMatch = recipe.ingredientType === wantType
          || (!recipe.ingredientType && (recipe.animalSource === "poisson" || recipe.type === "POISSON") && wantType === "hazan_drano");
        if (!isMatch) return false;
        if (!trondroState) return true;
        if (trondroState === "maina") return recipe.type === "MAINA" || /maina/i.test(recipe.name || "");
        if (trondroState === "lena") return recipe.type !== "MAINA" && !/maina/i.test(recipe.name || "");
        return true;
      }
      case "FRUITS_DE_MER":
        return recipe.ingredientType === "fruits_de_mer";
      case "ATODY":
        return recipe.ingredientType === "atody" || recipe.type === "ATODY";
      case "HOLATRA":
        return recipe.ingredientType === "holatra";
      case "AMBANY_TANANA":
        return recipe.ingredientType === "ambany_tanana" || recipe.dishSubCategory === "ambany_tanana" || recipe.dishCategory === "ambany_tanana";
      default:
        return true;
    }
  },

  /** Sélection Fety (prompt 3/4, section 1) : recettes existantes marquées isFety: true, filtrées
   *  optionnellement par occasion (valeur de FETY_OCCASIONS). Fety n'est pas un dishCategory ni un
   *  groupe alimentaire : cette méthode filtre simplement DATA.state.recipes, comme n'importe quel
   *  autre filtre de RECO.getRecommendations, sans jamais créer de deuxième liste de recettes
   *  parallèle (contrairement à roMazavaRecipes, dont la structure est différente). */
  getFetyRecipes(occasion) {
    let list = DATA.state.recipes.filter((r) => r.isFety);
    if (occasion) {
      list = list.filter((r) => (r.festiveOccasions || []).includes(occasion));
    }
    return list;
  },

  hasIncompatiblePair(recipe) {
    const ids = recipe.ingredients.map((i) => i.productId);
    return DATA.state.compatibility.some((rule) => {
      const pct = rule.percentage !== undefined ? rule.percentage : (rule.level === "incompatible" ? 100 : 0);
      if (pct < 100) return false;
      return ids.includes(rule.a) && ids.includes(rule.b);
    });
  },

  /** Calcule la pénalité de score cumulée due aux règles de compatibilité en pourcentage (0-100%,
   *  hors 100% qui exclut déjà la recette au filtrage). Interprétation :
   *  80% = très forte pénalité, 60% = forte, 40% = moyenne, 20% = faible, 0% = aucune (information seule).
   *  Retourne { totalPenaltyScore, explanations[] } — explanations sert à justifier le classement
   *  (prompt 4 : "Le résultat RECO doit expliquer pourquoi une recette est moins bien classée"). */
  getCompatibilityPenalty(recipe) {
    const ids = recipe.ingredients.map((i) => i.productId);
    const explanations = [];
    let totalPenaltyScore = 0;
    DATA.state.compatibility.forEach((rule) => {
      const pct = rule.percentage !== undefined ? rule.percentage : (rule.level === "incompatible" ? 100 : rule.level === "peu_recommande" ? 40 : rule.level === "acceptable" ? 10 : 0);
      if (pct <= 0 || pct >= 100) return; // 0% = pas de pénalité, 100% déjà géré comme exclusion
      if (!(ids.includes(rule.a) && ids.includes(rule.b))) return;
      const pa = DATA.getProduct(rule.a);
      const pb = DATA.getProduct(rule.b);
      // score pénalité proportionnel au pourcentage, borné pour rester lisible dans le tri global
      const penaltyScore = pct / 20; // 20%->1pt, 40%->2pt, 60%->3pt, 80%->4pt
      totalPenaltyScore += penaltyScore;
      explanations.push(
        `Latsaka kokoa satria ${pa ? pa.name : rule.a} sy ${pb ? pb.name : rule.b} dia mifanaraka ${100 - pct}% ihany (tsy mifanaraka ${pct}%).`
      );
    });
    return { totalPenaltyScore, explanations };
  },

  /** Vérifie les paires "peu recommandé" dans une recette pour affichage d'avertissement
   *  (conserve le comportement historique : level "peu_recommande", ou percentage entre 10 et 90). */
  getWarningPairs(recipe) {
    const ids = recipe.ingredients.map((i) => i.productId);
    return DATA.state.compatibility.filter((rule) => {
      const pct = rule.percentage !== undefined ? rule.percentage : (rule.level === "peu_recommande" ? 40 : -1);
      const isWarningLevel = rule.level === "peu_recommande" || (pct > 0 && pct < 100);
      return isWarningLevel && ids.includes(rule.a) && ids.includes(rule.b);
    });
  },

  /** Vérifie qu'une recette dishSubCategory="ro_matsatso" respecte la règle absolue ROMATSATSO_RULE :
   *  uniquement des ingrédients ingredientType="anana" (parmi allowedAnanaProductIds), aucun sel,
   *  aucune huile, aucune viande/poisson, aucune épice, aucun autre légume ni condiment ajouté.
   *  L'eau est implicite (jamais dans ingredients[]), donc non vérifiée ici. */
  isValidRoMatsatso(recipe) {
    const rule = typeof ROMATSATSO_RULE !== "undefined" ? ROMATSATSO_RULE : null;
    if (!rule) return true; // règle absente du build : ne bloque jamais par excès de zèle
    if (!recipe.ingredients || !recipe.ingredients.length) return false; // doit contenir au moins l'anana
    return recipe.ingredients.every((ing) => rule.allowedAnanaProductIds.includes(ing.productId));
  },

  /** Vrai si la recette utilise une combinaison aliment+cuisson ou cuisson+épice marquée "interdit"
   *  dans DATA.state.cookingCompatibility / DATA.state.spiceCompatibility (exclusion totale, prompt 2/4).
   *  "incompatible" n'exclut pas ici : c'est une pénalité graduelle, voir getCookingCompatibilityPenalty. */
  hasForbiddenCookingOrSpice(recipe) {
    const mode = recipe.cookingMethod || recipe.type;
    const ids = recipe.ingredients.map((i) => i.productId);
    const cookingRules = (DATA.state.cookingCompatibility || []);
    const spiceRules = (DATA.state.spiceCompatibility || []);
    const forbiddenCooking = cookingRules.some((rule) => rule.mode === mode && ids.includes(rule.productId) && rule.status === "interdit");
    if (forbiddenCooking) return true;
    const usedSpiceIds = [
      ...(recipe.spiceItems || []).map((s) => s.id),
      ...ids, // certaines épices apparaissent aussi directement dans ingredients[] (ex: sakay, sira)
    ];
    return spiceRules.some((rule) => {
      if (rule.mode !== mode) return false;
      if (rule.productId && !ids.includes(rule.productId)) return false;
      if (!usedSpiceIds.includes(rule.spiceId)) return false;
      return rule.status === "interdit";
    });
  },

  /** Calcule la pénalité de score cumulée due aux statuts "incompatible" de cooking/spice
   *  compatibility (statuts "rare_traditionnel"/"conditionnel"/"compatible" n'ont aucun impact sur
   *  le score, seulement informatifs). Même échelle de lisibilité que getCompatibilityPenalty. */
  getCookingCompatibilityPenalty(recipe) {
    const mode = recipe.cookingMethod || recipe.type;
    const ids = recipe.ingredients.map((i) => i.productId);
    const explanations = [];
    let totalPenaltyScore = 0;
    (DATA.state.cookingCompatibility || []).forEach((rule) => {
      if (rule.mode !== mode || !ids.includes(rule.productId) || rule.status !== "incompatible") return;
      const product = DATA.getProduct(rule.productId);
      const modeLabel = typeof COOKING_MODE_LABELS !== "undefined" ? (COOKING_MODE_LABELS[mode] || mode) : mode;
      totalPenaltyScore += 2;
      explanations.push(`Latsaka kokoa satria ${product ? product.name : rule.productId} sy ny fomba "${modeLabel}" dia tsy mifanaraka tsara.`);
    });
    const usedSpiceIds = new Set([...(recipe.spiceItems || []).map((s) => s.id), ...ids]);
    (DATA.state.spiceCompatibility || []).forEach((rule) => {
      if (rule.mode !== mode || rule.status !== "incompatible") return;
      if (rule.productId && !ids.includes(rule.productId)) return;
      if (!usedSpiceIds.has(rule.spiceId)) return;
      const modeLabel = typeof COOKING_MODE_LABELS !== "undefined" ? (COOKING_MODE_LABELS[mode] || mode) : mode;
      totalPenaltyScore += 1.5;
      explanations.push(`Latsaka kokoa satria ny zava-manitra "${rule.spiceId}" tsy mifanaraka amin'ny fomba "${modeLabel}".`);
    });
    return { totalPenaltyScore, explanations };
  },

  /** Suggestion "LAOKA ANIO" pour l'accueil : meilleur résultat sans filtre de budget strict */
  getTodaySuggestion() {
    const results = this.getRecommendations({ people: 4 });
    return results.length ? results[0] : null;
  },

  /** Variante multiple de getTodaySuggestion, utilisée par le carrousel "Laoka anio" de l'accueil
   *  (ui.js renderHome/bindHomeSuggestionRotation) : renvoie jusqu'à n des meilleurs résultats,
   *  dans le même ordre que getRecommendations (déjà trié par pertinence). */
  getTodaySuggestions(n) {
    const results = this.getRecommendations({ people: 4 });
    return results.slice(0, n || 5);
  },

  /** Détermine si une recette contient de la viande/volaille — critère utilisé par le dashboard
   *  Laoka (tableau de bord par défaut) pour trier "sans viande" avant "avec viande" à l'intérieur
   *  de chaque cadre (Rony/Ritra/Endasina/Ketsaketsa). Règle : ingredientType hena/vorona, OU
   *  containsPork=true, OU animalSource renseigné (couvre aussi les recettes ambany_tanana qui ont
   *  animalSource mais un ingredientType="ambany_tanana" distinct). Non bloquant : une recette dont
   *  aucun de ces champs n'est renseigné est simplement considérée "sans viande" par défaut. */
  recipeHasMeat(recipe) {
    if (!recipe) return false;
    if (recipe.ingredientType === "hena" || recipe.ingredientType === "vorona") return true;
    if (recipe.containsPork) return true;
    if (recipe.animalSource) return true;
    return false;
  },

  /** Regroupe une liste de recettes par ingredientType (ordre suggéré : legumes, anana, voamaina,
   *  voalena, trondro (hazan_drano/hazandranomasina), puis le reste), en plaçant dans chaque groupe
   *  d'abord les plats sans viande puis les plats avec viande (voir recipeHasMeat). Utilisé par le
   *  dashboard Laoka (cadres Rony/Ritra/Endasina/Ketsaketsa) pour l'affichage groupé demandé
   *  (prompt "Refonte de l'écran Laoka en tableau de bord", point 2).
   *  Retourne : [{ ingredientType, label, recipes: [...] }] — groupes non vides seulement. */
  groupRecipesForDashboard(recipes) {
    const order = ["legumes", "anana", "voamaina", "voalena", "hazan_drano", "hazandranomasina"];
    const groups = {};
    recipes.forEach((r) => {
      const key = r.ingredientType || "autre";
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    const orderedKeys = Object.keys(groups).sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return orderedKeys.map((key) => {
      const list = groups[key].slice().sort((a, b) => {
        const am = this.recipeHasMeat(a) ? 1 : 0;
        const bm = this.recipeHasMeat(b) ? 1 : 0;
        return am - bm; // sans viande d'abord, avec viande ensuite
      });
      const label = (typeof DISH_INGREDIENT_TYPE_LABELS !== "undefined" && DISH_INGREDIENT_TYPE_LABELS[key]) || key;
      return { ingredientType: key, label, recipes: list };
    });
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
