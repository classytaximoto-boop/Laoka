/* ============================================================
   LAOKA — data.js
   Données de démonstration : produits, recettes, compatibilité,
   profil de démo, stock de démo, historique de démo.
   Ce sont des PRIX DE DÉMONSTRATION, pas des prix officiels.
   ============================================================ */

/* ---------- 1. PRODUITS / PRIX (source de vérité des prix) ---------- */
/* unit: "kg" | "l" | "piece" | "bunch" | "kapoaka" | "tsongo" | "madco" | "tanana"
   basePrice: prix pour 1 unité complète (1kg, 1L, 1 pièce...)
   part (optionnel) : partie de la viande/poisson/volaille concernée par ce produit (ex: "taovany")
   isIndicativePrice : TOUJOURS true dans les données de démo — ce ne sont jamais des prix
     officiels/actuels du marché, seulement des repères pour faire fonctionner les calculs.
   priceUpdatedAt : date ISO de dernière mise à jour du prix (mise à jour automatiquement
     par Admin/Paramètres quand un prix est modifié).
   animalSource / animalPart (optionnels) : voir section "ARCHITECTURE MENU / LAOKA" plus bas —
     remplacent progressivement le champ historique "part" pour les produits ambany_tanana.
   NOTE PRIX : les prix marqués (fourchette) sont indicatifs, faute de prix de marché fiable
   trouvé en ligne pour Madagascar — à ajuster si vous avez des chiffres réels du marché. */
const DEFAULT_PRODUCTS = [
  { id: "riz",        name: "Vary (riz blanc)",   category: "cereales",     unit: "kg",   basePrice: 3200 },
  { id: "manioc",     name: "Mangahazo (manioc)", category: "legumes",      unit: "kg",   basePrice: 1200 },
  { id: "ovy",        name: "Ovy (pomme de terre)", category: "legumes",    unit: "kg",   basePrice: 2700 },
  { id: "voatabia",   name: "Voatabia (tomate)",  category: "legumes",      unit: "kg",   basePrice: 4000 },
  { id: "tongolo",    name: "Tongolo (oignon)",   category: "legumes",      unit: "kg",   basePrice: 4300 },
  { id: "menaka",     name: "Menaka (huile)",     category: "huiles",       unit: "l",    basePrice: 8500 },
  { id: "atody",      name: "Atody (œuf)",        category: "atody",       unit: "piece", basePrice: 750 },
  { id: "sira",       name: "Sira (sel)",         category: "epices",       unit: "kg",   basePrice: 800 },
  { id: "voanjo",     name: "Voanjo (arachide)",  category: "legumineuses", unit: "kg",   basePrice: 6500 },
  { id: "tsaramaso",  name: "Tsaramaso (haricot)", category: "legumineuses", unit: "kg",  basePrice: 5200 },
  { id: "akoho",      name: "Akoho (poulet)",     category: "viandes",      unit: "kg",   basePrice: 14000 },
  { id: "henakisoa",  name: "Henakisoa (porc)",   category: "viandes",      unit: "kg",   basePrice: 13500 },
  { id: "henaomby",   name: "Henaomby (bœuf)",    category: "viandes",      unit: "kg",   basePrice: 18000 },
  { id: "trondro",    name: "Trondro (poisson)",  category: "poissons",     unit: "kg",   basePrice: 12000 },
  { id: "anana",      name: "Anana (brèdes)",     category: "legumes",      unit: "bunch", basePrice: 1000 },
  { id: "ravitoto",   name: "Ravitoto (feuille manioc pilée)", category: "legumes", unit: "kg", basePrice: 3500 },
  { id: "sakay",      name: "Sakay (piment)",     category: "epices",       unit: "kg",   basePrice: 6000 },
  { id: "sakamalao",  name: "Sakamalao (gingembre)", category: "epices",    unit: "kg",   basePrice: 5000 },
  { id: "voasary",    name: "Voasary (citron)",   category: "autres",       unit: "piece", basePrice: 300 },
  { id: "vomanga",    name: "Vomanga (patate douce)", category: "legumes",  unit: "kg",   basePrice: 1800 },
  { id: "katsaka",    name: "Katsaka (maïs)",     category: "cereales",     unit: "kg",   basePrice: 2200 },
  { id: "lasary",     name: "Karoty (carotte)",   category: "legumes",      unit: "kg",   basePrice: 3000 },
  { id: "kobasira",   name: "Kobasira (petits pois)", category: "legumineuses", unit: "kg", basePrice: 4800 },
  { id: "poivron",    name: "Poivron",            category: "legumes",      unit: "kg",   basePrice: 5500 },
  { id: "laisoa",     name: "Laisoa (chou)",      category: "legumes",      unit: "kg",   basePrice: 2000 },
  { id: "aondrana",   name: "Aondrana (coco râpé)", category: "autres",     unit: "kg",   basePrice: 7000 },

  /* ---- Nouveaux produits "ambany tanana" (abats et laoka populaires) ---- */
  { id: "taovany_kisoa", name: "Taovany kisoa (abats de porc)", category: "ambany_tanana", unit: "kg", basePrice: 9000, part: "taovany", animalSource: "porc", animalPart: "taovany" },
  { id: "taovany_akoho", name: "Taovany akoho (abats de poulet)", category: "ambany_tanana", unit: "kg", basePrice: 7000, part: "taovany", animalSource: "poulet", animalPart: "taovany" },
  { id: "museau",     name: "Museau (kisoa)",     category: "ambany_tanana", unit: "kg",   basePrice: 8000, part: "museau", animalSource: "porc", animalPart: "museau" },
  { id: "gorza",       name: "Gôrza",              category: "ambany_tanana", unit: "kg",   basePrice: 7500 },
  { id: "foza_orana",  name: "Foza orana",         category: "ambany_tanana", unit: "kg",   basePrice: 10000 },

  /* ---- Trondro maina (poisson séché) — prix indicatifs, fourchette 8000-15000 Ar/kg selon variété ---- */
  { id: "trondro_maina_fony",      name: "Trondro maina fony",      category: "poissons", unit: "kg", basePrice: 9000 },
  { id: "trondro_maina_gogo",      name: "Trondro maina gogo",      category: "poissons", unit: "kg", basePrice: 8500 },
  { id: "trondro_maina_karapapaka", name: "Trondro maina karapapaka", category: "poissons", unit: "kg", basePrice: 12000 },
  { id: "trondro_maina_maiky",     name: "Trondro maina maiky (tilapia séché)", category: "poissons", unit: "kg", basePrice: 10000 },

  /* ---- Fruits de mer — prix indicatifs ---- */
  { id: "patsa_crevette", name: "Patsa (crevette)", category: "poissons", unit: "kg", basePrice: 15000 },
  { id: "foza_crabe",     name: "Foza (crabe)",     category: "poissons", unit: "kg", basePrice: 12000 },
  { id: "langosta",       name: "Langosta (langouste)", category: "poissons", unit: "kg", basePrice: 35000 },
  { id: "orita",          name: "Orita (poulpe)",   category: "poissons", unit: "kg", basePrice: 14000 },

  /* ---- Voamaina — légumineuses séchées diverses (cohérent avec tsaramaso 5200, voanjo 6500) ---- */
  { id: "voamaina_pois_cap", name: "Voamaina — pois du Cap séché", category: "legumineuses", unit: "kg", basePrice: 5500, ingredientType: "voamaina" },
  { id: "voanjobory_maina",  name: "Voanjobory maina (séché)",     category: "legumineuses", unit: "kg", basePrice: 6800, ingredientType: "voamaina" },
  { id: "tsaramaso_maina",   name: "Tsaramaso maina (séché)",      category: "legumineuses", unit: "kg", basePrice: 5200, ingredientType: "voamaina" },
  { id: "voanemba",          name: "Voanemba",                     category: "legumineuses", unit: "kg", basePrice: 5800, ingredientType: "voamaina" },
  { id: "lentilles",         name: "Lentilles",                    category: "legumineuses", unit: "kg", basePrice: 6200, ingredientType: "voamaina" },

  /* ---- Voalena — légumineuses/produits frais utilisés comme laoka (dishCategory: "voalena") ---- */
  { id: "voanjobory_lena", name: "Voanjobory lena (frais)", category: "legumineuses", unit: "kg", basePrice: 4500, ingredientType: "voamaina" },
  { id: "tsaramaso_lena",  name: "Tsaramaso lena (frais)",  category: "legumineuses", unit: "kg", basePrice: 4000, ingredientType: "voamaina" },

  /* ---- MENU PRINCIPAL — bases/féculents du repas (foodRole: "menu_principal") ----
     Ces produits ne doivent JAMAIS être proposés comme dishCategory laoka dans le wizard. */
  { id: "vary_fotsy", name: "Vary fotsy (riz blanc)", category: "cereales", unit: "kg", basePrice: 3200, foodRole: "menu_principal" },
  { id: "vary_mena",  name: "Vary mena (riz rouge)",  category: "cereales", unit: "kg", basePrice: 3600, foodRole: "menu_principal" },
  // manioc, vomanga, katsaka existent déjà ci-dessus comme produits — on les référence aussi comme
  // bases du menu principal via MENU_PRINCIPAL_PRODUCT_IDS plus bas, sans dupliquer le produit.
  { id: "saonjo",     name: "Saonjo (taro)",           category: "legumes",  unit: "kg", basePrice: 2100, foodRole: "menu_principal" },

  /* ---- Sauce / base ---- */
  { id: "tongolo_gasy", name: "Tongolo gasy (échalote malgache)", category: "epices", unit: "kg", basePrice: 4600 },
  { id: "tongolo_maitso", name: "Tongolo maitso (oignon vert)", category: "legumes", unit: "bunch", basePrice: 800 },
  { id: "dipoavatra", name: "Dipoavatra (poivre)", category: "epices", unit: "kg", basePrice: 9000 },
  { id: "curry",      name: "Curry",               category: "epices", unit: "kg", basePrice: 8500 },
  { id: "sosety",     name: "Sosety (saucisse)",   category: "viandes", unit: "kg", basePrice: 9500 },
  { id: "saosisy",    name: "Saosisy (saucisson)", category: "viandes", unit: "kg", basePrice: 11000 },
];

/* ---------- 1b. MENU PRINCIPAL — liste de référence (foodRole = "menu_principal") ----------
   Regroupe les ids de produits déjà présents dans DEFAULT_PRODUCTS qui constituent la base/féculent
   du repas malgache : vary, mangahazo, katsaka, vomanga, saonjo. Extensible (ovy, autres tubercules).
   Ces produits NE DOIVENT PAS apparaître comme catégorie de laoka dans le wizard/recherche. */
const MENU_PRINCIPAL_PRODUCT_IDS = ["vary_fotsy", "vary_mena", "manioc", "katsaka", "vomanga", "saonjo", "ovy"];

/* ---------- 1c. FANGARONY — liste de référence extensible ---------- */
const FANGARONY_REFERENCE = [
  { id: "totokena", name: "Totokena" },
];

/* ---------- 1d. SAUCE / ÉPICES — listes de référence ---------- */
const SAUCE_BASE_REFERENCE = [
  { id: "voatabia", name: "Voatabia (tomate)" },
  { id: "tongolo", name: "Tongolo (oignon)" },
  { id: "aondrana", name: "Aondrana (coco râpé)" },
];
const SPICES_REFERENCE = [
  { id: "tongolo_gasy", name: "Tongolo gasy" },
  { id: "tongolo_maitso", name: "Tongolo maitso" },
  { id: "sakamalao", name: "Sakamalao" },
  { id: "sakay", name: "Sakay" },
  { id: "dipoavatra", name: "Dipoavatra" },
  { id: "curry", name: "Curry" },
];

/* ============================================================
   ARCHITECTURE MENU / LAOKA — nouveaux champs métier (prompt 1)
   ============================================================
   RÈGLE FONDAMENTALE :
   - MENU PRINCIPAL = base/féculent du repas (vary, mangahazo, katsaka, vomanga, saonjo...).
   - LAOKA = accompagnement servi avec cette base.
   - CONDIMENT = lasary/achard, sakay, rougail...
   - RO / RONY = bouillons.
   - AMBANY TANANA = famille de laoka populaires/abats (pas un régime, pas un animal).
   Le riz/vary n'est JAMAIS un laoka. Ne pas casser dishCategory/ingredientType historiques
   (laoka | achard | ro_mazava | ambany_tanana ; legumes | anana | hena | voamaina |
   hazan_drano | hazandranomasina) : on les ÉTEND, on ne les renomme pas. */

/* foodRole : rôle du plat dans le repas */
const FOOD_ROLES = ["menu_principal", "laoka", "condiment"];
const FOOD_ROLE_LABELS = {
  menu_principal: "Menu principal (base du repas)",
  laoka: "Laoka (accompagnement)",
  condiment: "Condiment",
};

/* dishCategory : catégorie de plat — étend l'enum historique (laoka | achard | ro_mazava | ambany_tanana)
   sans le casser. "laoka" reste le fallback historique pour les anciennes recettes. Les nouvelles
   sous-catégories de laoka (rony/ritra/ketsaketsa/kiendy/voamaina/voalena) sont informatives : elles
   se combinent avec cookingMethod pour rony/ritra/ketsaketsa/kiendy (mode de préparation) et avec
   ingredientType pour voamaina/voalena (catégorie d'ingrédient), MAIS restent aussi utilisables comme
   dishCategory direct pour le filtrage/recherche groupée demandé (achard/ro_mazava/ambany_tanana/voalena). */
const DISH_CATEGORIES = [
  "laoka_classique", "rony", "ritra", "ketsaketsa", "kiendy",
  "voamaina", "voalena", "ambany_tanana", "achard", "ro_mazava",
];
const DISH_CATEGORY_LABELS = {
  laoka_classique: "Laoka classique",
  rony: "Rony",
  ritra: "Ritra",
  ketsaketsa: "Ketsaketsa",
  kiendy: "Kiendy",
  voamaina: "Voamaina (légumineuses séchées)",
  voalena: "Voalena (légumineuses/produits frais)",
  ambany_tanana: "Ambany tanana (abats, spécialités)",
  achard: "Lasary / Achard",
  ro_mazava: "Ro mazava",
};
/* Table de correspondance : ancien dishCategory (stocké tel quel sur recipe.dishCategory pour
   compat avec le moteur RECO existant) <-> nouvelle DISH_CATEGORIES. "laoka" historique n'a PAS
   d'équivalent unique : il se précise via dishSubCategory (voir plus bas) qui prend une valeur
   parmi DISH_CATEGORIES pour les nouvelles recettes, sans renommer dishCategory. */

/* animalSource / animalPart : indépendants de dishCategory="ambany_tanana" — ne jamais déduire
   l'un à partir de l'autre (ex : ambany_tanana ne veut pas dire "porc"). */
const ANIMAL_SOURCES = ["boeuf", "porc", "poulet", "lapin", "poisson", "crustace", "autre"];
const ANIMAL_SOURCE_LABELS = {
  boeuf: "Bœuf", porc: "Porc", poulet: "Poulet", lapin: "Lapin",
  poisson: "Poisson", crustace: "Crustacé", autre: "Autre",
};
const ANIMAL_PARTS = ["viande", "pied", "tete", "queue", "cervelle", "langue", "museau", "joue", "taovany", "tripes", "autre"];
const ANIMAL_PART_LABELS = {
  viande: "Viande", pied: "Pied", tete: "Tête", queue: "Queue", cervelle: "Cervelle",
  langue: "Langue", museau: "Museau", joue: "Joue", taovany: "Taovany", tripes: "Tripes", autre: "Autre",
};

/* diet : régime alimentaire — champ indépendant d'animalPart (jamais Halal dans animalPart) */
const DIET_OPTIONS = ["standard", "halal", "mpino", "sabatista", "vegetarien", "personnalise"];
const DIET_LABELS = {
  standard: "Standard", halal: "Halal", mpino: "Mpino",
  sabatista: "Sabatista / Adventiste", vegetarien: "Végétarien", personnalise: "Personnalisé",
};

/* Compatibilité en pourcentage — paliers proposés dans le wizard (prompt 2, étape 8) */
const COMPATIBILITY_PERCENTAGES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
/* Interprétation : 100 = exclusion totale ; 80 = très forte pénalité ; 60 = forte pénalité ;
   40 = pénalité moyenne ; 20 = faible pénalité ; 0 = information sans exclusion. */

/* ---------- 2. RECETTES DE DÉMONSTRATION ----------
   ingredients: [{productId, qty, unit}] — unit converti vers basePrice via calc.js
   type: RITRA | RONY | KETSAKETSA | KIENDY | MAINA | SAOSY | LASOPY | LEGUMES | POISSON | VIANDE | ATODY
   dishCategory: "laoka" (défaut) | "achard" | "ro_mazava" | "ambany_tanana"
     - "laoka" : plat classique, apparaît dans la recherche standard (comportement historique)
     - "achard" : légumes marinés/crus — MASQUÉ de la recherche standard, affiché seulement
       si l'utilisateur active l'option dédiée dans le formulaire de recherche
     - "ro_mazava" : bouillon clair — catégorie à part, gérée depuis Paramètres > Ro mazava
     - "ambany_tanana" : laoka populaires/abats (museau, gôrza, taovany...) — apparaît dans
       la recherche standard comme le laoka classique (catégorie "mère" au même titre que viande/poisson)
   moment: array de "maraina" | "atoandro" | "hariva"
   diet: array de tags compatibles: "halal","mpino","sabatista","vegetarien","standard"
   containsPork / containsAlcohol flags pour filtrage rapide

   ---- CHAMPS AJOUTÉS (architecture menu/laoka, prompt 1) — tous optionnels, migration douce ----
   foodRole : "menu_principal" | "laoka" | "condiment" — ajouté automatiquement à la migration
     ("laoka" par défaut sauf dishCategory déjà "achard" -> "condiment", voir DATA.loadData).
     Les recettes historiques restent donc correctement classées sans intervention.
   dishSubCategory : une valeur de DISH_CATEGORIES (rony/ritra/ketsaketsa/kiendy/voamaina/voalena/
     laoka_classique/ambany_tanana/achard/ro_mazava) — précise dishCategory sans le remplacer, sert
     au regroupement de la recherche par sous-catégorie de laoka. Fallback : dérivé de `type`
     (cookingMethod historique) si absent, voir DATA.loadData.
   ingredientType : catégorie d'ingrédient principal, valeur parmi DISH_INGREDIENT_TYPES
     (legumes/anana/hena/voamaina/hazan_drano/hazandranomasina/atody) — normalisée sur la recette
     elle-même pour permettre le filtrage RECO par type d'ingrédient.
   cookingMethod : alias du champ historique `type` (RITRA/RONY/KETSAKETSA/KIENDY/...) — même valeur,
     nouveau nom pour coller au vocabulaire du prompt 1 ; `type` n'est PAS supprimé (rétrocompat totale).
   animalSource / animalPart : voir ANIMAL_SOURCES/ANIMAL_PARTS — uniquement pour recettes à base
     de viande/poisson avec une partie spécifique (ambany_tanana notamment). Ne jamais en déduire diet.
   fangarony (optionnel) : [{ id, name, qty?, unit? }] — accompagnements secondaires (ex: totokena).
   sauceItems / spiceItems (optionnels) : listes structurées faisant écho aux champs texte libre
     historiques `sauce`/`spices` (conservés) — [{ id, name }] issus de SAUCE_BASE_REFERENCE / SPICES_REFERENCE.
   region / aliases / notes (optionnels) : une recette peut avoir plusieurs noms/orthographes selon
     la région ; ne jamais présenter une classification régionale comme vérité universelle.
*/
const DEFAULT_RECIPES = [
  {
    id: "r01", name: "Ovy sy atody", photo: "🍳", type: "KIENDY", dishCategory: "laoka", moment: ["maraina","atoandro","hariva"],
    time: 25, servings: 4, diet: ["standard","halal","mpino","sabatista"],
    containsPork: false,
    ingredients: [
      { productId: "ovy", qty: 0.5, unit: "kg" },
      { productId: "atody", qty: 4, unit: "piece" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Handioviana sy hotapahina ny ovy ho sombisombiny madinika.",
      "Atono amin'ny menaka mafana ny ovy mandra-masaka.",
      "Ampiana ny tongolo voatetika, atono kely.",
      "Ampiana ny atody voavily, aharo tsara.",
      "Asio sira, dia vonona ny sakafo.",
    ],
  },
  {
    id: "r02", name: "Akoho ritra", photo: "🍗", type: "RITRA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 45, servings: 4, diet: ["standard","halal","mpino"],
    containsPork: false,
    ingredients: [
      { productId: "akoho", qty: 0.8, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "voatabia", qty: 0.2, unit: "kg" },
      { productId: "menaka", qty: 0.04, unit: "l" },
      { productId: "sakamalao", qty: 0.02, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny akoho.",
      "Atsangano ny tongolo sy sakamalao amin'ny menaka.",
      "Ampidirina ny akoho, atono mandra-mivalana.",
      "Ampiana ny voatabia, ahandroina moramora mandra-maina ny ranony.",
      "Jerena ny tsiro, ampio sira raha ilaina.",
    ],
  },
  {
    id: "r03", name: "Rony anana", photo: "🥬", type: "RONY", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 30, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"],
    containsPork: false,
    ingredients: [
      { productId: "anana", qty: 2, unit: "bunch" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny anana, tapaho madinika.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Ampidirina ny anana, ampio rano kely.",
      "Ahandroina mandra-masaka tsara, asio sira.",
    ],
  },
  {
    id: "r04", name: "Tsaramaso sy henakisoa", photo: "🫘", type: "RONY", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 60, servings: 4, diet: ["standard"], containsPork: true,
    ingredients: [
      { productId: "tsaramaso", qty: 0.3, unit: "kg" },
      { productId: "henakisoa", qty: 0.4, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Alenina ny tsaramaso raha ilaina, dia ahandroina mandra-malemy.",
      "Atsangano ny henakisoa amin'ny tongolo sy voatabia.",
      "Aharoina ny tsaramaso, ampio ranomasaka.",
      "Ahandroina moramora mandra-mety ny ranony.",
    ],
  },
  {
    id: "r05", name: "Trondro sy ravitoto", photo: "🐟", type: "POISSON", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 40, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    ingredients: [
      { productId: "trondro", qty: 0.6, unit: "kg" },
      { productId: "ravitoto", qty: 0.3, unit: "kg" },
      { productId: "aondrana", qty: 0.1, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina ny trondro, asio sira kely.",
      "Ahandroina ny ravitoto mandra-malemy.",
      "Atono ny trondro amin'ny menaka.",
      "Aharoina daholo, ampio aondrana, ahandroina kely.",
    ],
  },
  {
    id: "r06", name: "Henaomby sy voatabia", photo: "🥩", type: "RITRA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 50, servings: 4, diet: ["standard","halal","mpino"], containsPork: false,
    ingredients: [
      { productId: "henaomby", qty: 0.6, unit: "kg" },
      { productId: "voatabia", qty: 0.3, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.04, unit: "l" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Tapaho sombisombiny ny henaomby.",
      "Atsangano amin'ny menaka mandra-mivalana.",
      "Ampiana ny tongolo sy voatabia.",
      "Ahandroina moramora mandra-malemy ny hena.",
    ],
  },
  {
    id: "r07", name: "Voanjo sosoa", photo: "🥜", type: "SAOSY", dishCategory: "laoka", moment: ["maraina"],
    time: 20, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    ingredients: [
      { productId: "voanjo", qty: 0.3, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Endaso ny voanjo mandra-mety.",
      "Ahandroina amin'ny rano mandra-malemy.",
      "Asio sira kely, servy mafana.",
    ],
  },
  {
    id: "r08", name: "Vary sosoa akoho", photo: "🍚", type: "LASOPY", dishCategory: "laoka", moment: ["maraina"],
    time: 35, servings: 4, diet: ["standard","halal","mpino"], containsPork: false,
    ingredients: [
      { productId: "riz", qty: 0.3, unit: "kg" },
      { productId: "akoho", qty: 0.3, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny vary amin'ny rano be.",
      "Ampidirina ny akoho voatetika.",
      "Ahandroina mandra-masaka tsara, asio sira sy tongolo.",
    ],
  },
  {
    id: "r09", name: "Mangahazo maina sy trondro", photo: "🍢", type: "MAINA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 45, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    ingredients: [
      { productId: "manioc", qty: 0.6, unit: "kg" },
      { productId: "trondro", qty: 0.4, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny mangahazo mandra-malemy.",
      "Atono ny trondro amin'ny menaka.",
      "Aharoina daholo, atono kely mandra-maina.",
    ],
  },
  {
    id: "r10", name: "Lasopy legioma", photo: "🍲", type: "LASOPY", dishCategory: "laoka", moment: ["hariva"],
    time: 30, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    ingredients: [
      { productId: "lasary", qty: 0.2, unit: "kg" },
      { productId: "laisoa", qty: 0.2, unit: "kg" },
      { productId: "ovy", qty: 0.2, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Tapaho madinika ny legioma rehetra.",
      "Ahandroina amin'ny rano be mandra-malemy.",
      "Asio sira, servy mafana.",
    ],
  },
  {
    id: "r11", name: "Poivron sy henakisoa", photo: "🫑", type: "KETSAKETSA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 35, servings: 4, diet: ["standard"], containsPork: true,
    ingredients: [
      { productId: "poivron", qty: 0.3, unit: "kg" },
      { productId: "henakisoa", qty: 0.4, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Tapaho sombisombiny ny henakisoa sy poivron.",
      "Atono ny henakisoa amin'ny menaka mafana.",
      "Ampiana ny poivron sy tongolo, atono haingana kely.",
    ],
  },
  {
    id: "r12", name: "Katsaka masaka", photo: "🌽", type: "LEGUMES", dishCategory: "laoka", moment: ["maraina"],
    time: 25, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    ingredients: [
      { productId: "katsaka", qty: 0.6, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Diovina ny katsaka.", "Ahandroina amin'ny rano sy sira mandra-malemy."],
  },
  {
    id: "r13", name: "Vomanga sy atody", photo: "🍠", type: "KIENDY", dishCategory: "laoka", moment: ["maraina","atoandro"],
    time: 25, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    ingredients: [
      { productId: "vomanga", qty: 0.5, unit: "kg" },
      { productId: "atody", qty: 4, unit: "piece" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Ahandroina ny vomanga mandra-malemy.", "Atono ny atody voavily.", "Aharoina, servy mafana."],
  },
  {
    id: "r14", name: "Kobasira sy akoho", photo: "🟢", type: "RONY", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 40, servings: 4, diet: ["standard","halal","mpino"], containsPork: false,
    ingredients: [
      { productId: "kobasira", qty: 0.3, unit: "kg" },
      { productId: "akoho", qty: 0.4, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Atsangano ny akoho amin'ny tongolo sy voatabia.",
      "Ampidirina ny kobasira, ampio rano.",
      "Ahandroina mandra-malemy tsara.",
    ],
  },
  {
    id: "r15", name: "Laisoa sy henaomby", photo: "🥩", type: "RITRA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 45, servings: 4, diet: ["standard","halal","mpino"], containsPork: false,
    ingredients: [
      { productId: "laisoa", qty: 0.4, unit: "kg" },
      { productId: "henaomby", qty: 0.4, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Atono ny henaomby mandra-mivalana.",
      "Ampiana ny laisoa voatetika sy tongolo.",
      "Ahandroina moramora mandra-malemy.",
    ],
  },
  {
    id: "r16", name: "Voasary lasary legioma", photo: "🥗", type: "LEGUMES", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 15, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    ingredients: [
      { productId: "lasary", qty: 0.2, unit: "kg" },
      { productId: "voasary", qty: 2, unit: "piece" },
      { productId: "sira", qty: 0.005, unit: "kg" },
    ],
    steps: ["Tapaho madinika ny karoty.", "Aroso amin'ny ranon-boasary sy sira.", "Ahandroina raha ilaina."],
  },
  {
    id: "r17", name: "Sakay gasy sy atody", photo: "🌶️", type: "ATODY", dishCategory: "laoka", moment: ["maraina","hariva"],
    time: 15, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    ingredients: [
      { productId: "atody", qty: 6, unit: "piece" },
      { productId: "sakay", qty: 0.02, unit: "kg" },
      { productId: "tongolo", qty: 0.08, unit: "kg" },
      { productId: "menaka", qty: 0.02, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Avily ny atody.", "Atono amin'ny menaka mafana miaraka amin'ny tongolo sy sakay.", "Asio sira."],
  },
  {
    id: "r18", name: "Ravitoto sy henakisoa", photo: "🥘", type: "MAINA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 90, servings: 4, diet: ["standard"], containsPork: true,
    ingredients: [
      { productId: "ravitoto", qty: 0.5, unit: "kg" },
      { productId: "henakisoa", qty: 0.5, unit: "kg" },
      { productId: "aondrana", qty: 0.1, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny ravitoto mandra-malemy be (ela).",
      "Ampiana ny henakisoa, ahandroina miaraka.",
      "Ampio aondrana sy sira, ahandroina farany.",
    ],
  },
  {
    id: "r19", name: "Trondro ritra sakamalao", photo: "🐠", type: "RITRA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 35, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    ingredients: [
      { productId: "trondro", qty: 0.6, unit: "kg" },
      { productId: "sakamalao", qty: 0.02, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina ny trondro, asio sira.",
      "Atono amin'ny menaka miaraka amin'ny sakamalao sy tongolo.",
      "Ahandroina mandra-masaka tsara.",
    ],
  },
  {
    id: "r20", name: "Tsaramaso legumes", photo: "🍛", type: "LEGUMES", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 45, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    ingredients: [
      { productId: "tsaramaso", qty: 0.3, unit: "kg" },
      { productId: "voatabia", qty: 0.2, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny tsaramaso mandra-malemy.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Aharoina daholo, ahandroina kely fanampiny.",
    ],
  },

  /* ---- ACHARD (dishCategory: "achard") — masqué de la recherche standard ---- */
  {
    id: "r21", name: "Achard karoty sy laisoa", photo: "🥕", type: "LEGUMES", dishCategory: "achard",
    moment: ["atoandro", "hariva"], time: 15, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    ingredients: [
      { productId: "lasary", qty: 0.3, unit: "kg" },
      { productId: "laisoa", qty: 0.2, unit: "kg" },
      { productId: "voasary", qty: 2, unit: "piece" },
      { productId: "sakay", qty: 0.01, unit: "kg" },
      { productId: "sira", qty: 0.005, unit: "kg" },
    ],
    steps: [
      "Tapaho madinika ny karoty sy laisoa.",
      "Aroso amin'ny ranon-boasary, sakay ary sira.",
      "Avelao hilona ao am-pangatsiahana alohan'ny fanasana.",
    ],
  },

  /* ---- AMBANY TANANA (dishCategory: "ambany_tanana") — visible dans la recherche standard ---- */
  {
    id: "r22", name: "Taovany kisoa sy tongolo", photo: "🍖", type: "RITRA", dishCategory: "ambany_tanana",
    moment: ["atoandro", "hariva"], time: 40, servings: 4,
    diet: ["standard"], containsPork: true,
    ingredients: [
      { productId: "taovany_kisoa", qty: 0.5, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny taovany, ahandroina aloha mandra-madio ny ranony.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Ampidirina ny taovany, ahandroina moramora.",
    ],
  },
  {
    id: "r23", name: "Gôrza ritra sakamalao", photo: "🍢", type: "RITRA", dishCategory: "ambany_tanana",
    moment: ["atoandro", "hariva"], time: 35, servings: 4,
    diet: ["standard"], containsPork: false,
    ingredients: [
      { productId: "gorza", qty: 0.4, unit: "kg" },
      { productId: "sakamalao", qty: 0.02, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina ny gôrza, atono amin'ny menaka mafana.",
      "Ampiana ny sakamalao sy tongolo.",
      "Ahandroina mandra-masaka tsara.",
    ],
  },

  /* ---- FOZA ORANA / TAOVANY — ambany_tanana supplémentaires (prompt 3, section 7) ---- */
  {
    id: "r24", name: "Foza orana ritra", photo: "🦀", type: "RITRA", dishCategory: "ambany_tanana",
    dishSubCategory: "ambany_tanana", foodRole: "laoka", ingredientType: "hena",
    moment: ["atoandro", "hariva"], time: 40, servings: 4,
    diet: ["standard"], containsPork: false,
    ingredients: [
      { productId: "foza_orana", qty: 0.5, unit: "kg" },
      { productId: "tongolo", qty: 0.12, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny foza orana.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Ampidirina ny foza orana, ahandroina moramora.",
    ],
  },
  {
    id: "r25", name: "Taovany akoho sy tongolo maitso", photo: "🍗", type: "KETSAKETSA", dishCategory: "ambany_tanana",
    dishSubCategory: "ambany_tanana", foodRole: "laoka", ingredientType: "hena",
    animalSource: "poulet", animalPart: "taovany",
    moment: ["atoandro", "hariva"], time: 25, servings: 4,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    ingredients: [
      { productId: "taovany_akoho", qty: 0.4, unit: "kg" },
      { productId: "tongolo_maitso", qty: 1, unit: "bunch" },
      { productId: "tongolo", qty: 0.08, unit: "kg" },
      { productId: "menaka", qty: 0.02, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny taovany akoho.",
      "Atono amin'ny menaka mafana miaraka amin'ny tongolo.",
      "Ampiana ny tongolo maitso, atono haingana.",
    ],
  },

  /* ---- VOALENA — légumineuses/produits frais utilisés comme laoka (prompt 3, section 3) ----
     Une recette de Voalena reste un LAOKA ; "voalena" est une sous-catégorie de laoka. */
  {
    id: "r26", name: "Voanjobory lena sy trondro", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "voalena", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 50, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    ingredients: [
      { productId: "voanjobory_lena", qty: 0.4, unit: "kg" },
      { productId: "trondro", qty: 0.4, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "tongolo_gasy", qty: 0.05, unit: "kg" },
      { productId: "curry", qty: 0.01, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
    ],
    steps: [
      "Ahandroina ny voanjobory lena mandra-malemy.",
      "Atsangano ny tongolo, tongolo gasy sy voatabia amin'ny menaka.",
      "Ampiana ny trondro sy ny curry, atono kely.",
      "Aharoina ny voanjobory, ahandroina moramora mandra-mety ny ranony.",
    ],
  },
  {
    id: "r27", name: "Voanjobory lena sy sosety", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "voalena", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 45, servings: 4,
    diet: ["standard"], containsPork: false,
    ingredients: [
      { productId: "voanjobory_lena", qty: 0.4, unit: "kg" },
      { productId: "sosety", qty: 0.3, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "tongolo_gasy", qty: 0.05, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny voanjobory lena mandra-malemy.",
      "Atsangano ny sosety voatapaka amin'ny tongolo sy tongolo gasy.",
      "Aharoina daholo, ahandroina moramora.",
    ],
    notes: "Laoka tsy misy henakisoa, mifanaraka amin'ny fomba fihinanana maro.",
  },
  {
    id: "r28", name: "Tsaramaso lena sy henakisoa", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "voalena", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 60, servings: 4,
    diet: ["standard"], containsPork: true,
    ingredients: [
      { productId: "tsaramaso_lena", qty: 0.4, unit: "kg" },
      { productId: "henakisoa", qty: 0.4, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
    ],
    steps: [
      "Ahandroina ny tsaramaso lena mandra-malemy.",
      "Atsangano ny henakisoa amin'ny tongolo sy voatabia.",
      "Aharoina ny tsaramaso lena, ahandroina moramora mandra-mety ny ranony.",
    ],
  },
  {
    id: "r29", name: "Tsaramaso lena sy saosisy", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "voalena", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 50, servings: 4,
    diet: ["standard"], containsPork: true,
    ingredients: [
      { productId: "tsaramaso_lena", qty: 0.4, unit: "kg" },
      { productId: "saosisy", qty: 0.3, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny tsaramaso lena mandra-malemy.",
      "Atsangano ny saosisy voatapaka amin'ny tongolo sy voatabia.",
      "Aharoina daholo, ahandroina kely fanampiny.",
    ],
  },

  /* ---- VOAMAINA — légumineuses séchées, recettes de démo (prompt 3, section 2) ---- */
  {
    id: "r30", name: "Voanjobory maina sy henakisoa", photo: "🥜", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 70, servings: 4,
    diet: ["standard"], containsPork: true,
    ingredients: [
      { productId: "voanjobory_maina", qty: 0.35, unit: "kg" },
      { productId: "henakisoa", qty: 0.35, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Alenina ny voanjobory maina raha ilaina, ahandroina mandra-malemy.",
      "Atsangano ny henakisoa amin'ny tongolo sy voatabia.",
      "Aharoina daholo, ahandroina moramora.",
    ],
  },
  {
    id: "r31", name: "Voanemba legioma", photo: "🫘", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 55, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    ingredients: [
      { productId: "voanemba", qty: 0.35, unit: "kg" },
      { productId: "voatabia", qty: 0.2, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny voanemba mandra-malemy.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Aharoina daholo, ahandroina kely fanampiny.",
    ],
  },
  {
    id: "r32", name: "Lentilles sy trondro maina", photo: "🥣", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 45, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    ingredients: [
      { productId: "lentilles", qty: 0.3, unit: "kg" },
      { productId: "trondro_maina_fony", qty: 0.2, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.02, unit: "l" },
      { productId: "sira", qty: 0.005, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny lentilles mandra-malemy (haingana kokoa noho ny voamaina hafa).",
      "Ampiana ny trondro maina voadio, ahandroina miaraka.",
      "Asio sira, ahandroina farany.",
    ],
  },
  {
    id: "r33", name: "Pois du Cap sec sy henaomby", photo: "🫛", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 65, servings: 4,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    ingredients: [
      { productId: "voamaina_pois_cap", qty: 0.35, unit: "kg" },
      { productId: "henaomby", qty: 0.35, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Alenina ny pois du Cap raha ilaina, ahandroina mandra-malemy.",
      "Atsangano ny henaomby amin'ny tongolo sy voatabia.",
      "Aharoina daholo, ahandroina moramora mandra-malemy ny hena.",
    ],
  },

  /* ---- RO / RONY — bouillons documentés (prompt 3, section 5) — distincts de roMazavaRecipes ---- */
  {
    id: "r34", name: "Ron'akoho", photo: "🍲", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "hena",
    moment: ["atoandro", "hariva"], time: 40, servings: 4,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    ingredients: [
      { productId: "akoho", qty: 0.5, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny akoho amin'ny rano be.",
      "Ampiana ny tongolo sy voatabia.",
      "Ahandroina moramora mandra-mavesatra tsara ny ronony.",
    ],
  },
  {
    id: "r35", name: "Romatsatso", photo: "🍲", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "legumes",
    moment: ["atoandro", "hariva"], time: 30, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    ingredients: [
      { productId: "anana", qty: 2, unit: "bunch" },
      { productId: "ovy", qty: 0.2, unit: "kg" },
      { productId: "tongolo", qty: 0.08, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina ny anana sy ovy, tapaho madinika.",
      "Ahandroina amin'ny rano be mandra-malemy.",
      "Asio sira, servy mafana toy ny lasopy maivana.",
    ],
    notes: "Rovitra maivana, mitovitovy amin'ny ro mazava fa manana legioma maro kokoa.",
  },

  /* ---- LASARY / ACHARD supplémentaires (prompt 3, section 6) ---- */
  {
    id: "r36", name: "Lasary voatabia", photo: "🍅", type: "LEGUMES", dishCategory: "achard",
    dishSubCategory: "achard", foodRole: "condiment", ingredientType: "legumes",
    moment: ["atoandro", "hariva"], time: 10, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    ingredients: [
      { productId: "voatabia", qty: 0.3, unit: "kg" },
      { productId: "tongolo", qty: 0.08, unit: "kg" },
      { productId: "voasary", qty: 1, unit: "piece" },
      { productId: "sira", qty: 0.005, unit: "kg" },
    ],
    steps: [
      "Tapaho madinika ny voatabia sy tongolo.",
      "Aroso amin'ny ranon-boasary sy sira.",
      "Avelao hilona kely alohan'ny fanasana.",
    ],
  },
  {
    id: "r37", name: "Lasary mangahazo", photo: "🥕", type: "LEGUMES", dishCategory: "achard",
    dishSubCategory: "achard", foodRole: "condiment", ingredientType: "legumes",
    moment: ["atoandro", "hariva"], time: 20, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    ingredients: [
      { productId: "manioc", qty: 0.3, unit: "kg" },
      { productId: "lasary", qty: 0.15, unit: "kg" },
      { productId: "sakay", qty: 0.01, unit: "kg" },
      { productId: "voasary", qty: 1, unit: "piece" },
      { productId: "sira", qty: 0.005, unit: "kg" },
    ],
    steps: [
      "Ahandroina kely ny mangahazo mandra-malefaka fa tsy mety malemy loatra.",
      "Tapaho madinika miaraka amin'ny karoty.",
      "Aroso amin'ny ranon-boasary, sakay ary sira.",
    ],
  },
];

/* ---------- 2b. RO MAZAVA (bouillon clair) ----------
   Catégorie à part, gérée depuis Paramètres > Ro mazava. Liste vide au départ :
   à remplir manuellement plat par plat depuis l'écran dédié.
   Même structure que DEFAULT_RECIPES, avec dishCategory: "ro_mazava" fixe. */
const DEFAULT_RO_MAZAVA_RECIPES = [];

/* ---------- 3. COMPATIBILITÉ DES ALIMENTS ---------- */
/* level: "compatible" | "acceptable" | "peu_recommande" | "incompatible" (historique, conservé)
   percentage (ajouté, prompt 2/3) : 0-100, palier parmi COMPATIBILITY_PERCENTAGES.
     100 = exclusion totale (équivaut à level "incompatible") ; 80 = très forte pénalité ;
     60 = forte pénalité ; 40 = pénalité moyenne ; 20 = faible pénalité ; 0 = information sans exclusion.
   Le champ `percentage` est calculé par migration à partir de `level` quand absent (voir
   DATA.loadData / migrateCompatibilityRule) : compatible->0, acceptable->10, peu_recommande->40,
   incompatible->100. Les nouvelles règles peuvent définir percentage directement sans level. */
const DEFAULT_COMPATIBILITY = [
  { a: "trondro", b: "menaka", level: "compatible", percentage: 0 },
  { a: "akoho", b: "voatabia", level: "compatible", percentage: 0 },
  { a: "henakisoa", b: "ravitoto", level: "compatible", percentage: 0 },
  { a: "atody", b: "sakay", level: "acceptable", percentage: 10 },
  { a: "trondro", b: "aondrana", level: "compatible", percentage: 0 },
  { a: "henaomby", b: "laisoa", level: "compatible", percentage: 0 },
  { a: "vomanga", b: "sakay", level: "peu_recommande", percentage: 40 },
  { a: "atody", b: "aondrana", level: "peu_recommande", percentage: 40 },
  { a: "trondro", b: "aondrana_lait_sy_menaka_be", level: "incompatible", percentage: 100 }, // exemple structurel
  /* ---- Exemples supplémentaires de paliers intermédiaires (prompt 4, test G) ---- */
  { a: "henakisoa", b: "voasary", level: "peu_recommande", percentage: 20 },
  { a: "trondro", b: "ronono", level: "incompatible", percentage: 80 },
  { a: "atody", b: "trondro", level: "peu_recommande", percentage: 60 },
];

/* ---------- 4. PROFIL / STOCK / HISTORIQUE DE DÉMO ---------- */
const DEFAULT_PANTRY = [
  { id: "p1", productId: "menaka", qty: 1, unit: "l", purchaseDate: "2026-08-10", storage: "Placard" },
  { id: "p2", productId: "riz", qty: 2.5, unit: "kg", purchaseDate: "2026-08-12", storage: "Placard" },
  { id: "p3", productId: "voatabia", qty: 3, unit: "piece", purchaseDate: "2026-08-18", storage: "Frigo" },
  { id: "p4", productId: "tongolo", qty: 4, unit: "piece", purchaseDate: "2026-08-14", storage: "Placard" },
  { id: "p5", productId: "atody", qty: 6, unit: "piece", purchaseDate: "2026-08-16", storage: "Frigo" },
  { id: "p6", productId: "ovy", qty: 0.8, unit: "kg", purchaseDate: "2026-08-15", storage: "Placard" },
];

const DEFAULT_HISTORY = [
  { id: "h1", date: "2026-08-13", recipeId: "r02", label: "Akoho ritra" },
  { id: "h2", date: "2026-08-14", recipeId: "r01", label: "Ovy sy atody" },
  { id: "h3", date: "2026-08-15", recipeId: "r03", label: "Rony anana" },
  { id: "h4", date: "2026-08-16", recipeId: "r20", label: "Tsaramaso legumes" },
  { id: "h5", date: "2026-08-19", recipeId: "r02", label: "Akoho ritra" },
];

const DEFAULT_PROFILE = {
  dietMode: "standard", // standard | halal | mpino | sabatista | vegetarien | personnalise
  halal: false,
  fady: ["henakisoa"],
  likes: ["akoho", "trondro"],
  dislikes: [],
};

const DEFAULT_SETTINGS = {
  city: "Antananarivo",
  currency: "Ar",
};

/* Durée indicative de conservation (jours) par catégorie — usage informatif seulement */
const SHELF_LIFE_DAYS = {
  legumes: 6,
  viandes: 2,
  poissons: 2,
  atody: 14,
  huiles: 180,
  epices: 365,
  cereales: 180,
  legumineuses: 180,
  autres: 30,
  ambany_tanana: 2, // abats/museau/gôrza : périssable, comme viandes
};

/* ---------- 4b. NOUVEAUX ENUMS — FORMULAIRE D'AJOUT DE LAOKA (Paramètres) ---------- */

/* "Atao" (mode de cuisson) — étend l'ancien enum type avec VOAMAINA (légumineuses séchées) */
const DISH_COOKING_MODES = ["RITRA", "RONY", "KETSAKETSA", "KIENDY", "MAINA", "SAOSY", "LASOPY", "LEGUMES", "POISSON", "VIANDE", "ATODY", "VOAMAINA"];
const COOKING_MODE_LABELS = {
  RITRA: "Ritra", RONY: "Rony", KETSAKETSA: "Ketsaketsa", KIENDY: "Kiendy",
  MAINA: "Maina", SAOSY: "Saosy", LASOPY: "Lasopy", LEGUMES: "Légumes",
  POISSON: "Poisson", VIANDE: "Viande", ATODY: "Atody",
  VOAMAINA: "Voamaina (légumineuses séchées)",
};

/* "Type" (catégorie d'ingrédient principal) — champ séparé de "Atao". "atody" ajouté (prompt 1/2). */
const DISH_INGREDIENT_TYPES = ["legumes", "anana", "hena", "voamaina", "hazan_drano", "hazandranomasina", "atody"];
const DISH_INGREDIENT_TYPE_LABELS = {
  legumes: "Légumes",
  anana: "Anana (brèdes)",
  hena: "Hena (viande)",
  voamaina: "Voamaina (légumineuses séchées/fraîches)",
  hazan_drano: "Hazan-drano (poisson d'eau douce)",
  hazandranomasina: "Hazandranomasina (poisson de mer)",
  atody: "Atody (œuf)",
};

/* Moments — "gouter" ajouté à la liste existante maraina/atoandro/hariva */
const MEAL_MOMENTS = ["maraina", "atoandro", "hariva", "gouter"];
const MEAL_MOMENT_LABELS = {
  maraina: "🌅 Maraina", atoandro: "☀️ Atoandro", hariva: "🌙 Hariva", gouter: "🍪 Goûter",
};

/* Saisons malgaches traditionnelles (4 saisons) */
const SEASONS = ["lohataona", "fahaina", "fararano", "ririnina"];
const SEASON_LABELS = {
  lohataona: "🌱 Lohataona (printemps, ~sept-nov)",
  fahaina: "☀️ Fahaina (été, ~déc-fév)",
  fararano: "🍂 Fararano (automne/récolte, ~mars-mai)",
  ririnina: "❄️ Ririnina (hiver, ~juin-août)",
};

/* ---------- 5. UNITÉS DE MESURE ----------
   Unités supportées partout où "unit" est utilisé (produits, ingrédients de recette, stock) :
   "kg" | "l" | "piece" | "bunch" | "g" | "ml"  (existantes)
   "kapoaka" (gobelet/tasse de mesure traditionnel)
   "tsongo" (pince — petite quantité, ex. épices)
   "madco" (1/3 de kapoaka, confirmé par l'utilisateur)
   "tanana" (une main — quantité approximative tenue dans la main)
   Ces unités n'ont pas de conversion automatique fiable vers kg/l (dépend du produit) ;
   CALC.toBaseQty les traite comme des unités "discrètes" comme piece/bunch par défaut. */
const MEASURE_UNITS = ["kg", "g", "l", "ml", "piece", "bunch", "kapoaka", "tsongo", "madco", "tanana"];
const UNIT_LABELS = {
  kg: "kg", g: "g", l: "L", ml: "ml",
  piece: "pièce(s)", bunch: "botte(s)",
  kapoaka: "kapoaka", tsongo: "tsongo (pince)", madco: "madco", tanana: "tanana (main)",
};
/* madco = 1/3 de kapoaka (confirmé). Utile si l'app doit un jour convertir entre les deux. */
const MADCO_PER_KAPOAKA = 3;

/* ---------- 6. QUANTITÉS EN FRACTION ----------
   Fractions courantes proposées dans les formulaires de quantité (produit, ingrédient, stock).
   Une quantité en fraction est stockée comme un nombre décimal classique dans qty (ex: 1/4 -> 0.25) ;
   FRACTION_PRESETS sert uniquement à peupler les sélecteurs/rapides d'UI. */
const FRACTION_PRESETS = [
  { label: "1/16", value: 1 / 16 },
  { label: "1/8", value: 1 / 8 },
  { label: "1/4", value: 1 / 4 },
  { label: "1/2", value: 1 / 2 },
  { label: "3/4", value: 3 / 4 },
  { label: "1", value: 1 },
  { label: "1 1/2", value: 1.5 },
  { label: "2", value: 2 },
];
