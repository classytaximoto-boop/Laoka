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
  { id: "taovany_kisoa", name: "Taovany kisoa (abats de porc)", category: "ambany_tanana", unit: "kg", basePrice: 9000, part: "taovany" },
  { id: "taovany_akoho", name: "Taovany akoho (abats de poulet)", category: "ambany_tanana", unit: "kg", basePrice: 7000, part: "taovany" },
  { id: "museau",     name: "Museau (kisoa)",     category: "ambany_tanana", unit: "kg",   basePrice: 8000, part: "museau" },
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
  { id: "voamaina_pois_cap", name: "Voamaina — pois du Cap séché", category: "legumineuses", unit: "kg", basePrice: 5500 },
  { id: "voanjobory_maina",  name: "Voanjobory maina (séché)",     category: "legumineuses", unit: "kg", basePrice: 6800 },
];

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
];

/* ---------- 2b. RO MAZAVA (bouillon clair) ----------
   Catégorie à part, gérée depuis Paramètres > Ro mazava. Liste vide au départ :
   à remplir manuellement plat par plat depuis l'écran dédié.
   Même structure que DEFAULT_RECIPES, avec dishCategory: "ro_mazava" fixe. */
const DEFAULT_RO_MAZAVA_RECIPES = [];

/* ---------- 3. COMPATIBILITÉ DES ALIMENTS ---------- */
/* level: "compatible" | "acceptable" | "peu_recommande" | "incompatible" */
const DEFAULT_COMPATIBILITY = [
  { a: "trondro", b: "menaka", level: "compatible" },
  { a: "akoho", b: "voatabia", level: "compatible" },
  { a: "henakisoa", b: "ravitoto", level: "compatible" },
  { a: "atody", b: "sakay", level: "acceptable" },
  { a: "trondro", b: "aondrana", level: "compatible" },
  { a: "henaomby", b: "laisoa", level: "compatible" },
  { a: "vomanga", b: "sakay", level: "peu_recommande" },
  { a: "atody", b: "aondrana", level: "peu_recommande" },
  { a: "trondro", b: "aondrana_lait_sy_menaka_be", level: "incompatible" }, // exemple structurel
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
