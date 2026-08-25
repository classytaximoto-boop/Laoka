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
  /* ---- Légumes / Anana ---- */
  { id: "anamalao", name: "Anamalao (brède épicée)", category: "legumes", unit: "bunch", basePrice: 1200, ingredientType: "anana" },
  { id: "anamamy", name: "Anamamy (brède douce)", category: "legumes", unit: "bunch", basePrice: 1200, ingredientType: "anana" },
  { id: "anana", name: "Anana (brèdes)", category: "legumes", unit: "bunch", basePrice: 1000, ingredientType: "anana" },
  { id: "anandrano", name: "Anandrano (brède d'eau)", category: "legumes", unit: "bunch", basePrice: 1200, ingredientType: "anana" },
  { id: "anandrarezina", name: "Anandrarezina (brède amère)", category: "legumes", unit: "bunch", basePrice: 1200, ingredientType: "anana" },
  { id: "haricot_vert", name: "Haricot vert", category: "legumes", unit: "kg", basePrice: 4500, ingredientType: "legumes" },
  { id: "karoty", name: "Karoty (carotte)", category: "legumes", unit: "kg", basePrice: 3000, ingredientType: "legumes" },
  { id: "laisoa", name: "Laisoa (chou)", category: "legumes", unit: "kg", basePrice: 2000, ingredientType: "legumes" },
  { id: "salady_composée_legioma", name: "Legioma fanaovana salady composée", category: "legumes", unit: "kg", basePrice: 3500, ingredientType: "legumes" },
  { id: "manioc", name: "Mangahazo (manioc)", category: "legumes", unit: "kg", basePrice: 1200, ingredientType: "legumes" },
  { id: "ovy", name: "Ovy (pomme de terre)", category: "legumes", unit: "kg", basePrice: 2700, ingredientType: "legumes" },
  { id: "kobasira", name: "Petits pois", category: "legumes", unit: "kg", basePrice: 4800, ingredientType: "legumes" },
  { id: "poivron", name: "Poivron", category: "legumes", unit: "kg", basePrice: 5500, ingredientType: "legumes" },
  { id: "ravimbomanga", name: "Ravimbomanga (feuille de patate douce)", category: "legumes", unit: "bunch", basePrice: 1000, ingredientType: "anana" },
  { id: "ravitoto", name: "Ravitoto (feuille manioc pilée)", category: "legumes", unit: "kg", basePrice: 3500, ingredientType: "anana" },
  { id: "saonjo", name: "Saonjo (taro)", category: "legumes", unit: "kg", basePrice: 2100, foodRole: "menu_principal" },
  { id: "sosety", name: "Sosety (chouchoute/christophine)", category: "legumes", unit: "kg", basePrice: 2500, ingredientType: "legumes" },
  { id: "tongolo", name: "Tongolo (oignon)", category: "legumes", unit: "kg", basePrice: 4300, ingredientType: "legumes", usageTags: ["laoka", "sauce"] },
  { id: "tongolo_maitso", name: "Tongolo maitso (oignon vert)", category: "legumes", unit: "bunch", basePrice: 800, ingredientType: "legumes" },
  { id: "voatabia", name: "Voatabia (tomate)", category: "legumes", unit: "kg", basePrice: 4000, ingredientType: "legumes", usageTags: ["laoka", "sauce"] },
  { id: "vomanga", name: "Vomanga (patate douce)", category: "legumes", unit: "kg", basePrice: 1800, ingredientType: "legumes" },

  /* ---- Huiles ---- */
  { id: "menaka", name: "Menaka (huile)", category: "huiles", unit: "l", basePrice: 8500 },

  /* ---- Atody (œufs) ---- */
  { id: "atody", name: "Atody akoho (œuf de poule)", category: "atody", unit: "piece", basePrice: 750, ingredientType: "atody" },

  /* ---- Épices / Aromates ----
     usageTags: "sauce" marque les produits proposés dans la colonne "Ro / sauce" du formulaire
     de composition (ui-laoka-form.js). Un produit peut porter les deux tags ("laoka" + "sauce")
     s'il sert aussi bien de base de sauce que d'ingrédient principal ailleurs (ex: tongolo,
     voatabia) — voir DATA.loadData / migrateArchitecture pour la rétrocompat des produits sans
     usageTags du tout (traités comme "laoka" par défaut, jamais comme "sauce"). */
  { id: "cube_jumbo", name: "Cube Jumbo (bouillon)", category: "epices", unit: "piece", basePrice: 500, isIndicativePrice: true },
  { id: "cube_maggi", name: "Cube Maggi (bouillon)", category: "epices", unit: "piece", basePrice: 500, isIndicativePrice: true },
  { id: "curry", name: "Curry", category: "epices", unit: "kg", basePrice: 8500, usageTags: ["sauce"] },
  { id: "dipoavatra", name: "Dipoavatra (poivre)", category: "epices", unit: "kg", basePrice: 9000, usageTags: ["sauce"] },
  { id: "kanelina", name: "Kanelina (cannelle)", category: "epices", unit: "kg", basePrice: 12000 },
  { id: "lavanila", name: "Lavanila (vanille)", category: "epices", unit: "piece", basePrice: 2500 },
  { id: "sakamalao", name: "Sakamalao (gingembre)", category: "epices", unit: "kg", basePrice: 5000, usageTags: ["sauce"] },
  { id: "sakamalao_maitso", name: "Sakamalao maitso (gingembre vert / combava)", category: "epices", unit: "kg", basePrice: 6000, usageTags: ["sauce"] },
  { id: "sakay", name: "Sakay (piment)", category: "epices", unit: "kg", basePrice: 6000 },
  { id: "sira", name: "Sira (sel)", category: "epices", unit: "kg", basePrice: 800 },
  { id: "tongolo_gasy", name: "Tongolo gasy (échalote malgache)", category: "epices", unit: "kg", basePrice: 4600 },
  { id: "tongolo_lahy", name: "Tongolo lahy (ail)", category: "epices", unit: "kg", basePrice: 7000, usageTags: ["sauce"] },
  { id: "thym", name: "Thym", category: "epices", unit: "kg", basePrice: 9500, usageTags: ["sauce"] },
  { id: "holatra_mainty", name: "Holatra mainty (champignon noir)", category: "epices", unit: "kg", basePrice: 11000, usageTags: ["sauce"], ingredientType: "holatra" },
  { id: "zava_manitra_telo", name: "Zava-manitra telo (3 épices)", category: "epices", unit: "kg", basePrice: 9000, usageTags: ["sauce"] },

  /* ---- Légumineuses (Voamaina / Voalena) ---- */
  { id: "lentilles", name: "Lentilles", category: "legumineuses", unit: "kg", basePrice: 6200, ingredientType: "voamaina" },
  { id: "tsaramaso", name: "Tsaramaso (haricot)", category: "legumineuses", unit: "kg", basePrice: 5200, ingredientType: "voamaina" },
  { id: "tsaramaso_lena", name: "Tsaramaso lena (frais)", category: "legumineuses", unit: "kg", basePrice: 4000, ingredientType: "voamaina" },
  { id: "tsaramaso_maina", name: "Tsaramaso maina (séché)", category: "legumineuses", unit: "kg", basePrice: 5200, ingredientType: "voamaina" },
  { id: "voamaina_pois_cap", name: "Voamaina — pois du Cap séché", category: "legumineuses", unit: "kg", basePrice: 5500, ingredientType: "voamaina" },
  { id: "voanemba", name: "Voanemba", category: "legumineuses", unit: "kg", basePrice: 5800, ingredientType: "voamaina" },
  { id: "voanjo", name: "Voanjo (arachide)", category: "legumineuses", unit: "kg", basePrice: 6500, ingredientType: "voamaina", usageTags: ["laoka", "sauce"] },
  { id: "voanjobory_lena", name: "Voanjobory lena (frais)", category: "legumineuses", unit: "kg", basePrice: 4500, ingredientType: "voamaina" },
  { id: "voanjobory_maina", name: "Voanjobory maina (séché)", category: "legumineuses", unit: "kg", basePrice: 6800, ingredientType: "voamaina" },

  /* ---- Vorona (volailles) ---- */
  { id: "akoho", name: "Akoho gasy (poulet)", category: "vorona", unit: "kg", basePrice: 14000, ingredientType: "vorona", animalSource: "poulet" },
  { id: "dinde", name: "Dinde", category: "vorona", unit: "kg", basePrice: 16000, ingredientType: "vorona", animalSource: "dinde" },
  { id: "gana", name: "Gana (oie)", category: "vorona", unit: "kg", basePrice: 17000, ingredientType: "vorona", animalSource: "gana" },

  /* ---- Hena (viandes) ---- */
  { id: "henondry", name: "Hen'ondry (mouton)", category: "viandes", unit: "kg", basePrice: 16000, ingredientType: "hena", animalSource: "ondry" },
  { id: "henosy", name: "Hen'osy (chèvre)", category: "viandes", unit: "kg", basePrice: 15000, ingredientType: "hena", animalSource: "osy" },
  { id: "henakisoa", name: "Henakisoa (porc)", category: "viandes", unit: "kg", basePrice: 13500, ingredientType: "hena", animalSource: "porc" },
  { id: "henaomby", name: "Henaomby (bœuf)", category: "viandes", unit: "kg", basePrice: 18000, ingredientType: "hena", animalSource: "boeuf" },

  /* ---- Hazandrano (poisson d'eau douce) ---- */
  { id: "trondro", name: "Trondro (poisson d'eau douce)", category: "hazandrano", unit: "kg", basePrice: 12000, ingredientType: "hazan_drano" },
  { id: "trondro_maina_fony", name: "Trondro maina fony", category: "trondro_maina", unit: "kg", basePrice: 9000, ingredientType: "hazan_drano" },
  { id: "trondro_maina_gogo", name: "Trondro maina gogo", category: "trondro_maina", unit: "kg", basePrice: 8500, ingredientType: "hazan_drano" },
  { id: "trondro_maina_karapapaka", name: "Trondro maina karapapaka", category: "trondro_maina", unit: "kg", basePrice: 12000, ingredientType: "hazan_drano" },
  { id: "trondro_maina_maiky", name: "Trondro maina maiky (tilapia séché)", category: "trondro_maina", unit: "kg", basePrice: 10000, ingredientType: "hazan_drano" },

  /* ---- Autres ---- */
  { id: "aondrana", name: "Aondrana (coco râpé)", category: "autres", unit: "kg", basePrice: 7000 },
  { id: "voasary", name: "Voasary (citron)", category: "autres", unit: "piece", basePrice: 300 },

  /* ---- Céréales / Menu principal ---- */
  { id: "katsaka", name: "Katsaka (maïs)", category: "cereales", unit: "kg", basePrice: 2200 },
  { id: "lafarina", name: "Lafarina (farine)", category: "cereales", unit: "kg", basePrice: 3500 },
  { id: "vary_fotsy", name: "Vary fotsy (riz blanc)", category: "cereales", unit: "kg", basePrice: 3200, foodRole: "menu_principal" },
  { id: "vary_mena", name: "Vary mena (riz rouge)", category: "cereales", unit: "kg", basePrice: 3600, foodRole: "menu_principal" },

  /* ---- Ambany tanana (abats, spécialités) ---- */
  { id: "aty_kisoa", name: "Aty kisoa (foie de porc)", category: "ambany_tanana", unit: "kg", basePrice: 8000, animalSource: "porc", animalPart: "aty", ingredientType: "ambany_tanana" },
  { id: "aty_omby", name: "Aty omby (foie de bœuf)", category: "ambany_tanana", unit: "kg", basePrice: 9000, animalSource: "boeuf", animalPart: "aty", ingredientType: "ambany_tanana" },
  { id: "avalano_ranony_kisoa", name: "Avalano ranony (intestins de porc)", category: "ambany_tanana", unit: "kg", basePrice: 6000, animalSource: "porc", animalPart: "avalano_ranony", ingredientType: "ambany_tanana" },
  { id: "gorza", name: "Gôrsa (gorge, kisoa)", category: "ambany_tanana", unit: "kg", basePrice: 7500, part: "gorsa", animalSource: "porc", animalPart: "gorsa", ingredientType: "ambany_tanana" },
  { id: "lela_omby", name: "Lela omby (langue de bœuf)", category: "ambany_tanana", unit: "kg", basePrice: 9500, animalSource: "boeuf", animalPart: "langue", ingredientType: "ambany_tanana" },
  { id: "lohan_kisoa", name: "Lohan-kisoa (tête de porc)", category: "ambany_tanana", unit: "kg", basePrice: 6500, animalSource: "porc", animalPart: "tete", ingredientType: "ambany_tanana" },
  { id: "lohan_omby", name: "Lohan'omby (tête de bœuf)", category: "ambany_tanana", unit: "kg", basePrice: 6000, animalSource: "boeuf", animalPart: "tete", ingredientType: "ambany_tanana" },
  { id: "lohan_ondry", name: "Lohan'ondry (tête de mouton)", category: "ambany_tanana", unit: "kg", basePrice: 7000, animalSource: "ondry", animalPart: "tete", ingredientType: "ambany_tanana" },
  { id: "museau", name: "Museau (kisoa)", category: "ambany_tanana", unit: "kg", basePrice: 8000, part: "museau", animalSource: "porc", animalPart: "museau", ingredientType: "ambany_tanana" },
  { id: "rambony_kisoa", name: "Rambony kisoa (queue de porc)", category: "ambany_tanana", unit: "kg", basePrice: 6500, animalSource: "porc", animalPart: "queue", ingredientType: "ambany_tanana" },
  { id: "rambony_omby", name: "Rambony omby (queue de bœuf)", category: "ambany_tanana", unit: "kg", basePrice: 7500, animalSource: "boeuf", animalPart: "queue", ingredientType: "ambany_tanana" },
  { id: "silamangany_omby", name: "Silamangany (moelle de bœuf)", category: "ambany_tanana", unit: "kg", basePrice: 9000, animalSource: "boeuf", animalPart: "silamangany", ingredientType: "ambany_tanana" },
  { id: "sofiny_kisoa", name: "Sofiny kisoa (oreille de porc)", category: "ambany_tanana", unit: "kg", basePrice: 5500, animalSource: "porc", animalPart: "sofiny", ingredientType: "ambany_tanana" },
  { id: "taovany_akoho", name: "Taovany akoho (abats de poulet)", category: "ambany_tanana", unit: "kg", basePrice: 7000, part: "taovany", animalSource: "poulet", animalPart: "taovany", ingredientType: "ambany_tanana" },
  { id: "taovany_kisoa", name: "Taovany kisoa (abats de porc)", category: "ambany_tanana", unit: "kg", basePrice: 9000, part: "taovany", animalSource: "porc", animalPart: "taovany", ingredientType: "ambany_tanana" },
  { id: "tongon_kisoa", name: "Tongon-kisoa (pied de porc)", category: "ambany_tanana", unit: "kg", basePrice: 6000, animalSource: "porc", animalPart: "pied", ingredientType: "ambany_tanana" },
  { id: "tongon_omby", name: "Tongon'omby (pied de bœuf)", category: "ambany_tanana", unit: "kg", basePrice: 5500, animalSource: "boeuf", animalPart: "pied", ingredientType: "ambany_tanana" },
  { id: "tongon_ondry", name: "Tongon'ondry (pied de mouton)", category: "ambany_tanana", unit: "kg", basePrice: 6500, animalSource: "ondry", animalPart: "pied", ingredientType: "ambany_tanana" },
  { id: "vavany_omby", name: "Vavany omby (joue de bœuf)", category: "ambany_tanana", unit: "kg", basePrice: 8000, animalSource: "boeuf", animalPart: "vavany", ingredientType: "ambany_tanana" },
  { id: "vavonikena_omby", name: "Vavonikena (estomac de bœuf, tripes)", category: "ambany_tanana", unit: "kg", basePrice: 6500, animalSource: "boeuf", animalPart: "vavonikena", ingredientType: "ambany_tanana" },
  { id: "voa_kisoa", name: "Voa kisoa (reins de porc)", category: "ambany_tanana", unit: "kg", basePrice: 7000, animalSource: "porc", animalPart: "voa", ingredientType: "ambany_tanana" },

  /* ---- Hazandranomasina (poisson de mer) ---- */
  { id: "gogo", name: "Gogo", category: "hazandranomasina", unit: "kg", basePrice: 9500, ingredientType: "hazandranomasina" },
  { id: "trondro_grille_mer", name: "Trondro (poisson de mer, entier, pour grillade)", category: "hazandranomasina", unit: "kg", basePrice: 13000, ingredientType: "hazandranomasina" },
  { id: "vorogne", name: "Vorogne", category: "hazandranomasina", unit: "kg", basePrice: 10000, ingredientType: "hazandranomasina" },

  /* ---- Fruits de mer ---- */
  { id: "foza_crabe", name: "Foza (crabe)", category: "fruits_de_mer", unit: "kg", basePrice: 12000, ingredientType: "fruits_de_mer" },
  { id: "foza_orana", name: "Foza orana", category: "fruits_de_mer", unit: "kg", basePrice: 10000, ingredientType: "fruits_de_mer" },
  { id: "langosta", name: "Langosta (langouste)", category: "fruits_de_mer", unit: "kg", basePrice: 35000, ingredientType: "fruits_de_mer" },
  { id: "orita", name: "Orita (poulpe)", category: "fruits_de_mer", unit: "kg", basePrice: 14000, ingredientType: "fruits_de_mer" },
  { id: "patsa_crevette", name: "Patsa (crevette)", category: "fruits_de_mer", unit: "kg", basePrice: 15000, ingredientType: "fruits_de_mer" },
  { id: "patsa_be", name: "Patsa be maina (crevette séchée)", category: "fruits_de_mer", unit: "kg", basePrice: 18000, ingredientType: "fruits_de_mer" },

  /* ---- Special Boucher ---- */
  { id: "brochette_viande", name: "Akora fanaovana brochette (hena/vorona)", category: "special_boucher", unit: "kg", basePrice: 12000, ingredientType: "special_boucher" },
  { id: "saosisy", name: "Saosisy (saucisse)", category: "special_boucher", unit: "kg", basePrice: 11000, ingredientType: "special_boucher", animalSource: "porc" },
];;

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
  { id: "lavanila", name: "Lavanila" },
  { id: "kanelina", name: "Kanelina" },
];

/* ---------- 1d-bis. CUBE BOUILLON — liste cochable, restreinte à legumes/anana ----------
   Référencée dans le formulaire (comme SPICES_REFERENCE) via un chip cliquable/cochable par
   recette : d.bouillonCubeItems = [{ id, name }]. Productid correspondant dans DEFAULT_PRODUCTS
   (cube_jumbo / cube_maggi), pour que le coût soit calculé comme n'importe quel ingrédient.
   RÈGLE : disponible UNIQUEMENT si ingredientType de la recette est "legumes" ou "anana" — jamais
   pour hena/vorona/hazan_drano/hazandranomasina/fruits_de_mer/atody/voamaina/ambany_tanana/
   special_boucher/holatra (ces plats sont déjà considérés "délicieux" sans besoin d'exhausteur de
   goût industriel — règle explicite de l'utilisateur, pas une règle nutritionnelle). Voir
   BOUILLON_CUBE_ALLOWED_INGREDIENT_TYPES, exploitée par ui-laoka-form.js (affichage conditionnel du
   bloc de chips) — le moteur RECO ne filtre rien ici, c'est une restriction de saisie, pas une
   exclusion de recherche. */
const BOUILLON_CUBE_REFERENCE = [
  { id: "cube_jumbo", name: "Cube Jumbo" },
  { id: "cube_maggi", name: "Cube Maggi" },
];
const BOUILLON_CUBE_ALLOWED_INGREDIENT_TYPES = ["legumes", "anana"];

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
   (laoka | achard | ro_mazava | ambany_tanana ; legumes | anana | hena | vorona | voamaina |
   hazan_drano | hazandranomasina | fruits_de_mer | atody | holatra | ambany_tanana |
   special_boucher) : on les ÉTEND, on ne les renomme pas (audit prompt 1/4 : hena et vorona sont
   désormais deux groupes alimentaires distincts et exclusifs, plus de déduction "hena sauf poulet"). */

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
/* "ro_matsatso" ajouté (prompt 2/4) : sous-catégorie dédiée, distincte de "rony" générique et de
   "ro_mazava" — voir ROMATSATSO_RULE pour la définition stricte (Anana + eau, sans sel ni ajout). */
const DISH_CATEGORIES = [
  "laoka_classique", "rony", "ritra", "ketsaketsa", "saosy", "kitono",
  "voamaina", "voalena", "ambany_tanana", "achard", "lasary", "ro_mazava", "ro_matsatso",
  "hanikotrana",
];
const DISH_CATEGORY_LABELS = {
  laoka_classique: "Laoka classique",
  rony: "Rony",
  ritra: "Ritra",
  ketsaketsa: "Ketsaketsa",
  saosy: "Saosy",
  kitono: "Kitono",
  voamaina: "Voamaina (légumineuses séchées)",
  voalena: "Voalena (légumineuses/produits frais)",
  ambany_tanana: "Ambany tanana (abats, spécialités)",
  achard: "Achard",
  lasary: "Lasary",
  ro_mazava: "Ro mazava",
  ro_matsatso: "Ro matsatso (bouillon d'anana pur)",
  // Ajouté à la demande : mangahazo/vomanga/saonjo servis nature (bouillis/cuits vapeur), sans
  // laoka ni sauce, mangés en hanikotrana (collation/goûter) — distinct du menu_principal (base du
  // repas accompagnée de laoka) et des recettes laoka existantes qui utilisent ces mêmes produits
  // (ex. "Mangahazo maina sy trondro", qui reste un vrai laoka, pas un hanikotrana).
  hanikotrana: "Hanikotrana (collation / goûter)",
};
/* Sous-types de Lasary (dishSubCategory: "lasary" + lasarySubType). Un lasary peut porter n'importe
   lequel de ces sous-types informatifs, au même titre que rony/ritra portent cookingMethod. */
const LASARY_SUB_TYPES = [
  "voatabia", "mangahazo", "concombre", "karaoty", "chou", "voanio", "anana", "mixte",
];
const LASARY_SUB_TYPE_LABELS = {
  voatabia: "Lasary voatabia",
  mangahazo: "Lasary mangahazo",
  concombre: "Lasary concombre",
  karaoty: "Lasary karaoty",
  chou: "Lasary chou",
  voanio: "Lasary voanio",
  anana: "Lasary anana",
  mixte: "Lasary mixte",
};
/* Sous-ensemble affiché dans le wizard de recherche ("Sokajin-tsakafo (fikarohana ampahibemaso)") —
   les 7 familles de laoka du quotidien. Le formulaire d'ajout de laoka (étape 8, incompatibilités)
   utilise lui la liste complète DISH_CATEGORIES (y compris voamaina/voalena/ambany_tanana/achard/
   ro_mazava), car on y choisit un groupe/sokajy entier comme incompatible, jamais un laoka individuel. */
const DISH_CATEGORIES_SEARCH = ["laoka_classique", "rony", "ritra", "ketsaketsa", "saosy", "hanikotrana", "kitono"];
/* Table de correspondance : ancien dishCategory (stocké tel quel sur recipe.dishCategory pour
   compat avec le moteur RECO existant) <-> nouvelle DISH_CATEGORIES. "laoka" historique n'a PAS
   d'équivalent unique : il se précise via dishSubCategory (voir plus bas) qui prend une valeur
   parmi DISH_CATEGORIES pour les nouvelles recettes, sans renommer dishCategory. */

/* animalSource / animalPart : indépendants de dishCategory="ambany_tanana" — ne jamais déduire
   l'un à partir de l'autre (ex : ambany_tanana ne veut pas dire "porc"). "ondry" (mouton) et "osy"
   (chèvre) ajoutés (audit prompt 1/4, section HENA : Hen'ondry/Hen'osy manquaient). "poulet" est
   conservé pour rétrocompat (VORONA en dérive en fallback, voir matchesLaokaKind) même si le poulet
   relève désormais du groupe alimentaire "vorona" et non plus "hena". */
/* "gana" (oie) et "dinde" ajoutés (prompt 2/4) : nécessaires pour les compatibilités cuisson
   "Gana + Ritra" / "Dinde + Ritra" citées explicitement, cohérent avec le groupe "vorona" existant. */
const ANIMAL_SOURCES = ["boeuf", "porc", "poulet", "ondry", "osy", "lapin", "poisson", "crustace", "gana", "dinde", "autre"];
const ANIMAL_SOURCE_LABELS = {
  boeuf: "Bœuf", porc: "Porc", poulet: "Poulet", ondry: "Ondry (mouton)", osy: "Osy (chèvre)", lapin: "Lapin",
  poisson: "Poisson", crustace: "Crustacé", gana: "Gana (oie)", dinde: "Dinde", autre: "Autre",
};
/* Liste étendue (audit prompt 1/4, section 14 AMBANY TANANA) : une partie par attribut animalPart au
   lieu d'une catégorie par animal — ex "tete" + animalSource="omby" plutôt qu'une catégorie "tête de
   bœuf" séparée. Noms malgaches avec le français entre parenthèses dans les labels. */
const ANIMAL_PARTS = [
  "viande", "pied", "tete", "queue", "cervelle", "langue", "museau",
  "taovany", "tripes", "gorsa", "aty", "voa", "avalano_ranony", "vavonikena",
  "sofiny", "vavany", "silamangany", "autre",
];
const ANIMAL_PART_LABELS = {
  viande: "Viande", pied: "Tongony (pied)", tete: "Lohany (tête)", queue: "Rambony (queue)",
  cervelle: "Cervelle", langue: "Lela (langue)", museau: "Museau",
  taovany: "Taovany (viscères)", tripes: "Tripes", gorsa: "Gôrsa (gorge)", aty: "Aty (foie)",
  voa: "Voa (reins)", avalano_ranony: "Avalano ranony (intestins)", vavonikena: "Vavonikena (estomac)",
  sofiny: "Sofiny (oreille)", vavany: "Vavany (joue)", silamangany: "Silamangany (moelle)", autre: "Autre",
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

/* ---------- 1e. FETY — sélection spéciale pour fêtes/grandes occasions (prompt 3/4, section 1) ----------
   IMPORTANT : Fety N'EST PAS un groupe alimentaire ni une catégorie de dishCategory. C'est une
   SÉLECTION de recettes existantes (dishCategory reste "laoka"/"ambany_tanana" comme d'habitude),
   marquées isFety: true sur la recette + festiveOccasions: [...] (tags parmi FETY_OCCASIONS).
   Toutes les recettes ne sont donc jamais automatiquement "Fety" : seule une sélection réellement
   adaptée porte ce flag (voir DEFAULT_RECIPES, recettes r38+). */
const FETY_OCCASIONS = ["noel", "taombaovao", "mariazy", "batisa", "tsingerintaona", "reception", "autre"];
const FETY_OCCASION_LABELS = {
  noel: "🎄 Noël",
  taombaovao: "🎆 Taom-baovao (nouvel an)",
  mariazy: "💍 Mariazy (mariage)",
  batisa: "👶 Batisa (baptême)",
  tsingerintaona: "🎂 Tsingerintaona (anniversaire)",
  reception: "🥂 Réception",
  autre: "✨ Autre grande occasion",
};

/* ---------- 2. RECETTES DE DÉMONSTRATION ----------
   ingredients: [{productId, qty, unit}] — unit converti vers basePrice via calc.js
   type: RITRA | RONY | KETSAKETSA | MAINA | SAOSY | LASOPY | LEGUMES | POISSON | VIANDE | ATODY
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
   cookingMethod : alias du champ historique `type` (RITRA/RONY/KETSAKETSA/...) — même valeur,
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
    id: "r21", name: "Achard karoty sy laisoa", photo: "🥕", type: "LEGUMES", dishCategory: "achard",
    moment: ["atoandro", "hariva"], time: 15, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "karoty", qty: 0.3, unit: "kg" },
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
  {
    id: "r42", name: "Akoho gasy ritra", photo: "🐓", type: "RITRA", dishCategory: "laoka",
    dishSubCategory: "ritra", foodRole: "laoka", ingredientType: "vorona", animalSource: "poulet",
    isFety: true, festiveOccasions: ["mariazy", "batisa", "tsingerintaona", "reception"],
    moment: ["atoandro", "hariva"], time: 60, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "akoho", qty: 1.2, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.25, unit: "kg" },
      { productId: "menaka", qty: 0.05, unit: "l" },
      { productId: "sakamalao", qty: 0.02, unit: "kg" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny akoho gasy.",
      "Atsangano ny tongolo sy sakamalao amin'ny menaka.",
      "Ampidirina ny akoho, atono mandra-mivalana ary ahandroina moramora.",
    ],
  },
  {
    id: "r43", name: "Akoho gasy saosy", photo: "🐓", type: "SAOSY", dishCategory: "laoka",
    dishSubCategory: "saosy", foodRole: "laoka", ingredientType: "vorona", animalSource: "poulet",
    isFety: true, festiveOccasions: ["mariazy", "batisa", "tsingerintaona", "reception"],
    moment: ["atoandro", "hariva"], time: 60, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "akoho", qty: 1.2, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.3, unit: "kg" },
      { productId: "menaka", qty: 0.05, unit: "l" },
      { productId: "curry", qty: 0.01, unit: "kg" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny akoho gasy.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka, ampio curry.",
      "Ampidirina ny akoho, ahandroina mandra-mateza ny sôsy.",
    ],
  },
  {
    id: "r02", name: "Akoho ritra", photo: "🍗", type: "RITRA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 45, servings: 4, diet: ["standard","halal","mpino"],
    containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r38", name: "Dinde ritra", photo: "🦃", type: "RITRA", dishCategory: "laoka",
    dishSubCategory: "ritra", foodRole: "laoka", ingredientType: "vorona", animalSource: "dinde",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "reception"],
    moment: ["atoandro", "hariva"], time: 90, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "dinde", qty: 1.5, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.25, unit: "kg" },
      { productId: "menaka", qty: 0.05, unit: "l" },
      { productId: "sakamalao", qty: 0.02, unit: "kg" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny hena dinde.",
      "Atsangano ny tongolo sy sakamalao amin'ny menaka.",
      "Ampidirina ny dinde, atono mandra-mivalana.",
      "Ampiana ny voatabia, ahandroina moramora mandra-maina ny ranony.",
    ],
  },
  {
    id: "r39", name: "Dinde saosy", photo: "🦃", type: "SAOSY", dishCategory: "laoka",
    dishSubCategory: "saosy", foodRole: "laoka", ingredientType: "vorona", animalSource: "dinde",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "reception"],
    moment: ["atoandro", "hariva"], time: 90, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "dinde", qty: 1.5, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.3, unit: "kg" },
      { productId: "menaka", qty: 0.05, unit: "l" },
      { productId: "curry", qty: 0.01, unit: "kg" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny hena dinde.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka, ampio curry.",
      "Ampidirina ny dinde, ahandroina mandra-mateza ny sôsy.",
    ],
  },
  {
    id: "r24", name: "Foza orana ritra", photo: "🦀", type: "RITRA", dishCategory: "ambany_tanana",
    dishSubCategory: "ambany_tanana", foodRole: "laoka", ingredientType: "fruits_de_mer",
    moment: ["atoandro", "hariva"], time: 40, servings: 4,
    diet: ["standard"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r40", name: "Gana ritra", photo: "🦢", type: "RITRA", dishCategory: "laoka",
    dishSubCategory: "ritra", foodRole: "laoka", ingredientType: "vorona", animalSource: "gana",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "mariazy", "reception"],
    moment: ["atoandro", "hariva"], time: 90, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "gana", qty: 1.5, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.25, unit: "kg" },
      { productId: "menaka", qty: 0.05, unit: "l" },
      { productId: "sakamalao", qty: 0.02, unit: "kg" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny gana.",
      "Atsangano ny tongolo sy sakamalao amin'ny menaka.",
      "Ampidirina ny gana, atono mandra-mivalana ary ahandroina moramora.",
    ],
  },
  {
    id: "r41", name: "Gana saosy", photo: "🦢", type: "SAOSY", dishCategory: "laoka",
    dishSubCategory: "saosy", foodRole: "laoka", ingredientType: "vorona", animalSource: "gana",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "mariazy", "reception"],
    moment: ["atoandro", "hariva"], time: 90, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "gana", qty: 1.5, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.3, unit: "kg" },
      { productId: "menaka", qty: 0.05, unit: "l" },
      { productId: "curry", qty: 0.01, unit: "kg" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny gana.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka, ampio curry.",
      "Ampidirina ny gana, ahandroina mandra-mateza ny sôsy.",
    ],
  },
  {
    id: "r23", name: "Gôrsa ritra sakamalao", photo: "🍢", type: "RITRA", dishCategory: "ambany_tanana",
    moment: ["atoandro", "hariva"], time: 35, servings: 4,
    diet: ["standard"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
  {
    id: "r46", name: "Hen'omby ritra fety", photo: "🥩", type: "RITRA", dishCategory: "laoka",
    dishSubCategory: "ritra", foodRole: "laoka", ingredientType: "hena", animalSource: "boeuf",
    isFety: true, festiveOccasions: ["mariazy", "batisa", "tsingerintaona", "reception"],
    moment: ["atoandro", "hariva"], time: 70, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "henaomby", qty: 1.2, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.2, unit: "kg" },
      { productId: "menaka", qty: 0.04, unit: "l" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny hen'omby.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Ampidirina ny hen'omby, ahandroina mandra-mivalana ny ranony.",
    ],
  },
  {
    id: "r50", name: "Henabaolina", photo: "🍢", type: "GRILLE", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "hena",
    isFety: true, festiveOccasions: ["mariazy", "reception", "autre"],
    moment: ["atoandro", "hariva"], time: 45, servings: 6,
    diet: ["standard"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "henaomby", qty: 1, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hotetehina ho boaty ny hen'omby.",
      "Asio sira sy menaka, aharoina tongolo voatetika.",
      "Grillizina amin'ny vain'afo mandra-masaka.",
    ],
    notes: "A VERIFIER : « Henabaolina » — préparation régionale, orthographe/recette exacte à confirmer localement.",
  },
  {
    id: "r45", name: "Henakisoa ritra fety", photo: "🥩", type: "RITRA", dishCategory: "laoka",
    dishSubCategory: "ritra", foodRole: "laoka", ingredientType: "hena", animalSource: "porc",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "reception"],
    moment: ["atoandro", "hariva"], time: 70, servings: 6,
    diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "henakisoa", qty: 1.2, unit: "kg" },
      { productId: "tongolo", qty: 0.2, unit: "kg" },
      { productId: "voatabia", qty: 0.2, unit: "kg" },
      { productId: "menaka", qty: 0.04, unit: "l" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny henakisoa.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Ampidirina ny henakisoa, ahandroina mandra-mivalana ny ranony.",
    ],
  },
  {
    id: "r06", name: "Henaomby sy voatabia", photo: "🥩", type: "RITRA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 50, servings: 4, diet: ["standard","halal","mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r12", name: "Katsaka masaka", photo: "🌽", type: "LEGUMES", dishCategory: "laoka",
    ingredientType: "legumes", moment: ["maraina"],
    time: 25, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "katsaka", qty: 0.6, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Diovina ny katsaka.", "Ahandroina amin'ny rano sy sira mandra-malemy."],
  },
  {
    id: "r14", name: "Kobasira sy akoho", photo: "🟢", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "vorona",
    moment: ["atoandro","hariva"],
    time: 40, servings: 4, diet: ["standard","halal","mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r54", name: "Langosta natono", photo: "🦞", type: "GRILLE", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "fruits_de_mer",
    isFety: true, festiveOccasions: ["mariazy", "reception"],
    moment: ["atoandro", "hariva"], time: 30, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "langosta", qty: 1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
      { productId: "voasary", qty: 1, unit: "piece" },
    ],
    steps: [
      "Hosasana tsara ny langosta.",
      "Grillizina na atono amin'ny menaka, asio sira sy ranom-boasary.",
    ],
  },
  {
    id: "r37", name: "Lasary mangahazo", photo: "🥕", type: "LEGUMES", dishCategory: "achard",
    dishSubCategory: "achard", foodRole: "condiment", ingredientType: "legumes",
    moment: ["atoandro", "hariva"], time: 20, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "manioc", qty: 0.3, unit: "kg" },
      { productId: "karoty", qty: 0.15, unit: "kg" },
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
  {
    id: "r36", name: "Lasary voatabia", photo: "🍅", type: "LEGUMES", dishCategory: "achard",
    dishSubCategory: "achard", foodRole: "condiment", ingredientType: "legumes",
    moment: ["atoandro", "hariva"], time: 10, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r10", name: "Lasopy legioma", photo: "🍲", type: "LASOPY", dishCategory: "laoka", moment: ["hariva"],
    time: 30, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "karoty", qty: 0.2, unit: "kg" },
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
    id: "r57", name: "Legioma ketsaketsa", photo: "🥦", type: "KETSAKETSA", dishCategory: "laoka",
    dishSubCategory: "ketsaketsa", foodRole: "laoka", ingredientType: "legumes",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "mariazy", "reception"],
    moment: ["atoandro", "hariva"], time: 20, servings: 6,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "haricot_vert", qty: 0.4, unit: "kg" },
      { productId: "karoty", qty: 0.2, unit: "kg" },
      { productId: "poivron", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Hotapahina madinika ny legioma rehetra.",
      "Atono amin'ny menaka mafana miaraka amin'ny tongolo.",
      "Asio sira, atono haingana mba tsy ho matimaty ny legioma.",
    ],
  },
  {
    id: "r32", name: "Lentilles sy trondro maina", photo: "🥣", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 45, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r09", name: "Mangahazo maina sy trondro", photo: "🍢", type: "MAINA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 45, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r66", name: "Mangahazo masaka", photo: "🍢", type: "LEGUMES", dishCategory: "hanikotrana",
    dishSubCategory: "hanikotrana", foodRole: "laoka",
    ingredientType: "legumes", moment: ["maraina","hariva"],
    time: 30, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (mangahazo bouilli nature, collation courante) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "manioc", qty: 0.6, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Diovina sy tsoahina ny hoditry ny mangahazo.", "Ahandroina amin'ny rano sy sira mandra-malemy.", "Servy mafana, hanikotrana tsotra."],
  },
  {
    id: "r51", name: "Masikita", photo: "🍢", type: "GRILLE", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "special_boucher",
    isFety: true, festiveOccasions: ["mariazy", "reception", "autre"],
    moment: ["atoandro", "hariva"], time: 40, servings: 6,
    diet: ["standard"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "brochette_viande", qty: 1, unit: "kg" },
      { productId: "poivron", qty: 0.2, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Hotetehina ho boaty ny hena, fanajariana amin'ny tsato-kazo miaraka amin'ny poivron sy tongolo.",
      "Grillizina amin'ny vain'afo mandra-masaka.",
    ],
  },
  {
    id: "r56", name: "Ovy fety", photo: "🥔", type: "LEGUMES", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "legumes",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "mariazy", "reception"],
    moment: ["atoandro", "hariva"], time: 30, servings: 6,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "ovy", qty: 1, unit: "kg" },
      { productId: "menaka", qty: 0.04, unit: "l" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny ovy.",
      "Atono amin'ny menaka mafana miaraka amin'ny tongolo.",
      "Asio sira, atono mandra-masaka sy mivolon-boasary.",
    ],
  },
  {
    id: "r01", name: "Ovy sy atody", photo: "🍳", type: "ENDASINA", dishCategory: "laoka", moment: ["maraina","atoandro","hariva"],
    time: 25, servings: 4, diet: ["standard","halal","mpino","sabatista"],
    containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    /* Ovy sy patsa be — Patsa-be sec + Ovy, association explicitement demandée par le prompt final
       (section 9). Confirmée par sakafogasy.blogspot.com (menu réel "Mercredi : ovy sy patsa be"). */
    id: "r64", name: "Ovy sy patsa be", photo: "🥔", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "fruits_de_mer",
    moment: ["atoandro", "hariva"], time: 35, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Recherche web — sakafogasy.blogspot.com (menu hebdomadaire réel)",
    ingredients: [
      { productId: "ovy", qty: 0.5, unit: "kg" },
      { productId: "patsa_be", qty: 0.1, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.02, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Hodiovina sy hotapahina ny ovy ho sombisombiny.",
      "Diovina ny patsa be.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Ampidirina ny patsa be, atono kely.",
      "Ampiana ny ovy sy rano kely, ahandroina mandra-malemy.",
      "Asio sira, servy mafana.",
    ],
  },
  {
    /* Patsa be sy sosety — Patsa-be sec + Sosety (chouchoute), confirmée directement par mamina.org
       (liste de laoka réels). Valide au passage la correction sosety=chouchoute (audit section 4). */
    id: "r65", name: "Patsa be sy sosety", photo: "🍲", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "fruits_de_mer",
    moment: ["atoandro", "hariva"], time: 35, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "CONFIRME",
    source: "Recherche web — mamina.org (liste de laoka)",
    ingredients: [
      { productId: "patsa_be", qty: 0.1, unit: "kg" },
      { productId: "sosety", qty: 0.4, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.02, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina ny patsa be.",
      "Hodiovina sy hotapahina ny sosety (chouchoute).",
      "Atsangano ny tongolo amin'ny menaka.",
      "Ampidirina ny patsa be, atono kely.",
      "Ampiana ny sosety sy rano kely, ahandroina mandra-malemy.",
      "Asio sira, servy mafana.",
    ],
  },
  {
    id: "r53", name: "Patsa natono", photo: "🦐", type: "GRILLE", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "fruits_de_mer",
    isFety: true, festiveOccasions: ["mariazy", "reception", "autre"],
    moment: ["atoandro", "hariva"], time: 25, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "patsa_crevette", qty: 0.8, unit: "kg" },
      { productId: "tongolo_gasy", qty: 0.05, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Hodiovina ny patsa (crevette).",
      "Atono amin'ny menaka mafana miaraka amin'ny tongolo gasy.",
      "Asio sira, atono haingana mandra-mivadika mena.",
    ],
  },
  {
    id: "r33", name: "Pois du Cap sec sy henaomby", photo: "🫛", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 65, servings: 4,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
  {
    id: "r11", name: "Poivron sy henakisoa", photo: "🫑", type: "KETSAKETSA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 35, servings: 4, diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    /* Ravimbomanga sy patsa be — manquait, association Anana + Patsa-be demandée par le prompt final
       (section 8/9). Confirmée par les mêmes sources que Patsa-be sec (ranouraii.wordpress.com,
       sakafogasy.blogspot.com) — niveau TRADITIONNEL (recette de blog personnel, pas de source
       institutionnelle, mais concordance entre plusieurs blogs indépendants). */
    id: "r63", name: "Ravimbomanga sy patsa be", photo: "🍲", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "anana",
    moment: ["atoandro", "hariva"], time: 35, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Recherche web — ranouraii.wordpress.com, sakafogasy.blogspot.com (concordance multi-sources, recettes de blogs personnels)",
    ingredients: [
      { productId: "ravimbomanga", qty: 1.5, unit: "bunch" },
      { productId: "patsa_be", qty: 0.15, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.02, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny ravimbomanga, esorina ny tahony mafy.",
      "Diovina ny patsa be, alenina raha ilaina.",
      "Atsangano ny tongolo amin'ny menaka.",
      "Ampidirina ny patsa be, atono kely.",
      "Ampiana ny ravimbomanga sy rano kely, ahandroina mandra-malemy.",
      "Asio sira, servy mafana.",
    ],
  },
  {
    id: "r18", name: "Ravitoto sy henakisoa", photo: "🥘", type: "MAINA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 90, servings: 4, diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r47", name: "Ravitoto sy henakisoa fety", photo: "🥘", type: "MAINA", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "anana",
    isFety: true, festiveOccasions: ["mariazy", "batisa", "tsingerintaona", "reception", "autre"],
    moment: ["atoandro", "hariva"], time: 60, servings: 6,
    diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "ravitoto", qty: 0.6, unit: "kg" },
      { productId: "henakisoa", qty: 0.6, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.04, unit: "l" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny ravitoto mandra-malefaka.",
      "Atsangano ny henakisoa amin'ny tongolo sy menaka.",
      "Aharoina ny ravitoto, ahandroina moramora.",
    ],
  },
  {
    /* CORRIGÉ (audit prompt 2/4) : l'ancienne version contenait ovy/tongolo/sira, ce qui viole la
       règle absolue Ro Matsatso = Anana + eau uniquement, sans sel ni aucun autre ingrédient ajouté.
       dishCategory/dishSubCategory basculés sur "ro_matsatso" (nouvelle sous-catégorie dédiée,
       distincte de "rony" générique) pour que le moteur applique ROMATSATSO_RULE. */
    id: "r35", name: "Ro matsatso", photo: "🍲", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "ro_matsatso", foodRole: "laoka", ingredientType: "anana",
    moment: ["atoandro", "hariva"], time: 15, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    ingredients: [
      { productId: "anana", qty: 2, unit: "bunch" },
    ],
    steps: [
      "Diovina tsara ny anana.",
      "Ahandroina amin'ny rano be, tsy asiana sira na akora hafa.",
      "Servy mafana, toy ny rovitra madio.",
    ],
    notes: "Ro matsatso marina : anana + rano fotsiny, tsy misy sira na akora ampiana.",
  },
  {
    id: "r60", name: "Romazava", photo: "🍲", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "hena",
    moment: ["atoandro", "hariva"], time: 90, servings: 4,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "CONFIRME",
    source: "Recherche web — recettes-papounet.com, artsdelices.com, nkosiagro.com (concordance multi-sources, plat national)",
    ingredients: [
      { productId: "henaomby", qty: 0.8, unit: "kg" },
      { productId: "anamamy", qty: 1, unit: "bunch" },
      { productId: "anamalao", qty: 1, unit: "bunch" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "voatabia", qty: 0.2, unit: "kg" },
      { productId: "sakamalao", qty: 0.02, unit: "kg" },
      { productId: "sira", qty: 0.015, unit: "kg" },
    ],
    steps: [
      "Tapaho sombisombiny ny hen'omby, ahandroina amin'ny rano be.",
      "Ampiana ny tongolo, voatabia ary sakamalao voatoto.",
      "Ahandroina moramora mandritra ny 1 ora eo ho eo mandra-malemy ny hena.",
      "Ampidirina ny anamamy sy anamalao voadio tsara.",
      "Ahandroina fohy fotoana ihany (na dia 5 minitra) mba tsy hihamaty ny anana.",
      "Asio sira, servy mafana miaraka amin'ny vary.",
    ],
    notes: "Ny anamalao dia fantatra koa hoe anamalaho na brède mafana any amin'ny faritra sasany.",
  },
  {
    id: "r34", name: "Ron'akoho", photo: "🍲", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "vorona",
    moment: ["atoandro", "hariva"], time: 40, servings: 4,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r03", name: "Rony anana", photo: "🥬", type: "RONY", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 30, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"],
    containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r58", name: "Rony anandrano", photo: "🥬", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "anana",
    moment: ["atoandro", "hariva"], time: 30, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "anandrano", qty: 2, unit: "bunch" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny anandrano, tapaho madinika.",
      "Atsangano ny tongolo amin'ny menaka.",
      "Ampidirina ny anandrano, ampio rano kely, ahandroina mandra-masaka.",
    ],
  },
  {
    id: "r17", name: "Sakay gasy sy atody", photo: "🌶️", type: "ATODY", dishCategory: "laoka", moment: ["maraina","hariva"],
    time: 15, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r55", name: "Salady legioma voatambatra", photo: "🥗", type: "LEGUMES", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "legumes",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "mariazy", "reception"],
    moment: ["atoandro", "hariva"], time: 20, servings: 6,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "salady_composée_legioma", qty: 0.4, unit: "kg" },
      { productId: "ovy", qty: 0.3, unit: "kg" },
      { productId: "atody", qty: 3, unit: "piece" },
      { productId: "karoty", qty: 0.15, unit: "kg" },
      { productId: "kobasira", qty: 0.15, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny ovy sy atody, dia hotapahina.",
      "Aharoina amin'ny legioma sy karoty voatapaka.",
      "Aroso amin'ny sôs araka ny tiana.",
    ],
  },
  {
    id: "r68", name: "Saonjo masaka", photo: "🍠", type: "LEGUMES", dishCategory: "hanikotrana",
    dishSubCategory: "hanikotrana", foodRole: "laoka",
    ingredientType: "legumes", moment: ["maraina","hariva"],
    time: 35, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (saonjo bouilli nature, collation courante) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "saonjo", qty: 0.6, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Diovina sy tsoahina ny hoditry ny saonjo.", "Ahandroina amin'ny rano sy sira mandra-malemy tsara.", "Servy mafana, hanikotrana tsotra."],
  },
  {
    id: "r25", name: "Taovany akoho sy tongolo maitso", photo: "🍗", type: "KETSAKETSA", dishCategory: "ambany_tanana",
    dishSubCategory: "ambany_tanana", foodRole: "laoka", ingredientType: "ambany_tanana",
    animalSource: "poulet", animalPart: "taovany",
    moment: ["atoandro", "hariva"], time: 25, servings: 4,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
  {
    id: "r22", name: "Taovany kisoa sy tongolo", photo: "🍖", type: "RITRA", dishCategory: "ambany_tanana",
    moment: ["atoandro", "hariva"], time: 40, servings: 4,
    diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    /* Renommé "Akoho rôti" -> "Tono akoho" (audit prompt final, section 2/10) : nom malgache confirmé
       (lekanto.com, "Grillade de poulet à la malgache - Tono akoho"), mode ROTI (français) -> ATONO
       (mode standard du prompt). */
    id: "r44", name: "Tono akoho", photo: "🍗", type: "ATONO", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "vorona", animalSource: "poulet",
    isFety: true, festiveOccasions: ["noel", "taombaovao", "mariazy", "reception"],
    moment: ["atoandro", "hariva"], time: 75, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "CONFIRME",
    source: "Recherche web — lekanto.com (\"Tono akoho\", grillade de poulet à la malgache)",
    ingredients: [
      { productId: "akoho", qty: 1.5, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.04, unit: "l" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Hodiovina ny akoho, asio menaka sy sira eran'ny hena.",
      "Atono any am-patana mandra-masaka tsara sy mivolon-mena ny hoditra.",
    ],
  },
  {
    /* Trondro endasina — manquait alors que c'est l'exemple explicite du prompt final (section 6).
       Source directe malgache (moov.mg, en langue malgache) : sira, dipoavatra, menaka, lafarina,
       jus de citron, marinade 15 min avant friture — niveau CONFIRME. */
    id: "r61", name: "Trondro endasina", photo: "🐟", type: "ENDASINA", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "hazan_drano",
    moment: ["atoandro", "hariva"], time: 25, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "CONFIRME",
    source: "Recherche web — moov.mg (\"Fomba fanaovana trondro endasina\", en malgache)",
    ingredients: [
      { productId: "trondro", qty: 0.6, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
      { productId: "dipoavatra", qty: 0.005, unit: "kg" },
      { productId: "lafarina", qty: 0.1, unit: "kg" },
      { productId: "menaka", qty: 0.1, unit: "l" },
      { productId: "voasary", qty: 1, unit: "piece" },
    ],
    steps: [
      "Diovina ny trondro, esorina ny tsinay sy ny loto rehetra.",
      "Asio sira, dipoavatra ary ranon-boasary, avelao hilona 15 minitra.",
      "Fafana lafarina tsara ny trondro tsirairay.",
      "Afanaina tsara ny menaka anaty vilany, arotsaka ny trondro.",
      "Endasina antonony ny afo mandra-mety ny lafiny iray (5-7 minitra), avadika.",
    ],
  },
  {
    /* Trondro maina sy anamalaho — manquait, alors que le prompt final (section 8) demande
       explicitement de vérifier l'association Anana + Trondro maina. Sources concordantes
       (malagasymiblaogy.over-blog.com, vol-direct.net) : poisson séché (fony ou gogo) + anamalaho,
       bouillon simple sel + huile, brèdes ajoutées 5 min en fin de cuisson — niveau CONFIRME. */
    id: "r62", name: "Trondro maina sy anamalao", photo: "🐟", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "anana",
    moment: ["atoandro", "hariva"], time: 40, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "CONFIRME",
    source: "Recherche web — malagasymiblaogy.over-blog.com, vol-direct.net (concordance multi-sources)",
    ingredients: [
      { productId: "trondro_maina_fony", qty: 0.3, unit: "kg" },
      { productId: "anamalao", qty: 1, unit: "bunch" },
      { productId: "menaka", qty: 0.02, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny trondro maina, esorina ny fasika sy ny loto.",
      "Ahandroina amin'ny rano be mandra-mavo ny ronony.",
      "Asio sira mandritra ny fahandroana.",
      "Rehefa ho vita ny fahandroana, ampio ny menaka.",
      "Ampidirina ny anamalao voadio, ahandroina 5 minitra fanampiny.",
    ],
  },
  {
    id: "r52", name: "Trondro natono", photo: "🐟", type: "GRILLE", dishCategory: "laoka",
    dishSubCategory: "laoka_classique", foodRole: "laoka", ingredientType: "hazandranomasina",
    isFety: true, festiveOccasions: ["mariazy", "reception", "autre"],
    moment: ["atoandro", "hariva"], time: 35, servings: 6,
    diet: ["standard", "halal", "mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "trondro_grille_mer", qty: 1, unit: "kg" },
      { productId: "voasary", qty: 2, unit: "piece" },
      { productId: "sira", qty: 0.015, unit: "kg" },
      { productId: "menaka", qty: 0.02, unit: "l" },
    ],
    steps: [
      "Hodiovina ny trondro, asio sira sy ranom-boasary.",
      "Grillizina amin'ny vain'afo mandra-masaka.",
    ],
  },
  {
    id: "r19", name: "Trondro ritra sakamalao", photo: "🐠", type: "RITRA", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 35, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r05", name: "Trondro sy ravitoto", photo: "🐟", type: "POISSON", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 40, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r20", name: "Tsaramaso legumes", photo: "🍛", type: "LEGUMES", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 45, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
  {
    id: "r28", name: "Tsaramaso lena sy henakisoa", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "voalena", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 60, servings: 4,
    diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
  {
    id: "r49", name: "Tsaramaso sy hena fety", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "voamaina",
    isFety: true, festiveOccasions: ["mariazy", "batisa", "tsingerintaona", "reception"],
    moment: ["atoandro", "hariva"], time: 75, servings: 6,
    diet: ["standard"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "tsaramaso_lena", qty: 0.5, unit: "kg" },
      { productId: "henaomby", qty: 0.6, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny tsaramaso mandra-malefaka.",
      "Atsangano ny hena amin'ny tongolo sy menaka.",
      "Aharoina ny tsaramaso, ahandroina moramora mandra-mateza.",
    ],
  },
  {
    id: "r04", name: "Tsaramaso sy henakisoa", photo: "🫘", type: "RONY", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 60, servings: 4, diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r08", name: "Vary sosoa akoho", photo: "🍚", type: "LASOPY", dishCategory: "laoka", moment: ["maraina"],
    time: 35, servings: 4, diet: ["standard","halal","mpino"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "vary_fotsy", qty: 0.3, unit: "kg" },
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
    id: "r31", name: "Voanemba legioma", photo: "🫘", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 55, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r07", name: "Voanjo sosoa", photo: "🥜", type: "SAOSY", dishCategory: "laoka", moment: ["maraina"],
    time: 20, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r27", name: "Voanjobory lena sy sosety", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "voalena", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 45, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista", "vegetarien"], containsPork: false,
    certaintyLevel: "CONFIRME",
    source: "Recherche web — mamina.org (recette \"Voanjobory sy sosety\")",
    ingredients: [
      { productId: "voanjobory_lena", qty: 0.4, unit: "kg" },
      { productId: "sosety", qty: 0.3, unit: "kg" },
      { productId: "tongolo", qty: 0.1, unit: "kg" },
      { productId: "tongolo_gasy", qty: 0.05, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny voanjobory lena mandra-malemy.",
      "Atsangano ny sosety (chouchoute) voatapaka amin'ny tongolo sy tongolo gasy.",
      "Aharoina daholo, ahandroina moramora.",
    ],
    notes: "Laoka tsy misy hena, sosety eto dia chouchoute/christophine, tsy saosisy (saucisse).",
  },
  {
    id: "r26", name: "Voanjobory lena sy trondro", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "voalena", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 50, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r30", name: "Voanjobory maina sy henakisoa", photo: "🥜", type: "VOAMAINA", dishCategory: "laoka",
    dishSubCategory: "voamaina", foodRole: "laoka", ingredientType: "voamaina",
    moment: ["atoandro", "hariva"], time: 70, servings: 4,
    diet: ["standard"], containsPork: true,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
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
    id: "r48", name: "Voanjobory sy hena fety", photo: "🫘", type: "RONY", dishCategory: "laoka",
    dishSubCategory: "rony", foodRole: "laoka", ingredientType: "voamaina",
    isFety: true, festiveOccasions: ["mariazy", "batisa", "tsingerintaona", "reception"],
    moment: ["atoandro", "hariva"], time: 75, servings: 6,
    diet: ["standard"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "voanjobory_lena", qty: 0.5, unit: "kg" },
      { productId: "henaomby", qty: 0.6, unit: "kg" },
      { productId: "tongolo", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.02, unit: "kg" },
    ],
    steps: [
      "Ahandroina ny voanjobory mandra-malefaka.",
      "Atsangano ny hena amin'ny tongolo sy menaka.",
      "Aharoina ny voanjobory, ahandroina moramora mandra-mateza.",
    ],
  },
  {
    id: "r16", name: "Voasary lasary legioma", photo: "🥗", type: "LEGUMES", dishCategory: "laoka", moment: ["atoandro","hariva"],
    time: 15, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "A_VERIFIER",
    source: "Audit prompt final — classification incohérente détectée (dishCategory=laoka mais contenu type achard), à vérifier manuellement.",
    ingredients: [
      { productId: "karoty", qty: 0.2, unit: "kg" },
      { productId: "voasary", qty: 2, unit: "piece" },
      { productId: "sira", qty: 0.005, unit: "kg" },
    ],
    steps: ["Tapaho madinika ny karoty.", "Aroso amin'ny ranon-boasary sy sira.", "Ahandroina raha ilaina."],
  },
  {
    id: "r67", name: "Vomanga masaka", photo: "🍠", type: "LEGUMES", dishCategory: "hanikotrana",
    dishSubCategory: "hanikotrana", foodRole: "laoka",
    ingredientType: "legumes", moment: ["maraina","hariva"],
    time: 25, servings: 4, diet: ["standard","halal","mpino","sabatista","vegetarien"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (vomanga bouilli nature, collation courante) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "vomanga", qty: 0.6, unit: "kg" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Diovina ny vomanga.", "Ahandroina amin'ny rano sy sira mandra-malemy.", "Servy mafana, hanikotrana tsotra."],
  },
  {
    id: "r13", name: "Vomanga sy atody", photo: "🍠", type: "ENDASINA", dishCategory: "laoka", moment: ["maraina","atoandro"],
    time: 25, servings: 4, diet: ["standard","halal","mpino","sabatista"], containsPork: false,
    certaintyLevel: "TRADITIONNEL",
    source: "Pattern culinaire malgache standard (nom, ingrédients et mode de cuisson cohérents avec les usages courants) — non vérifié individuellement par recherche web dans cette passe d'audit.",
    ingredients: [
      { productId: "vomanga", qty: 0.5, unit: "kg" },
      { productId: "atody", qty: 4, unit: "piece" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: ["Ahandroina ny vomanga mandra-malemy.", "Atono ny atody voavily.", "Aharoina, servy mafana."],
  },
  {
    id: "r59", name: "Vorogne ritra", photo: "🐟", type: "RITRA", dishCategory: "laoka",
    dishSubCategory: "ritra", foodRole: "laoka", ingredientType: "hazandranomasina",
    moment: ["atoandro", "hariva"], time: 35, servings: 4,
    diet: ["standard", "halal", "mpino", "sabatista"], containsPork: false,
    certaintyLevel: "A_VERIFIER",
    source: "Recherche web infructueuse — \"vorogne\" non retrouvé comme poisson malgache attesté (audit prompt final, section 5). Possible déformation d'un autre nom (ex. vorongy, langouste régionale) — à confirmer avant diffusion.",
    ingredients: [
      { productId: "vorogne", qty: 0.6, unit: "kg" },
      { productId: "tongolo", qty: 0.12, unit: "kg" },
      { productId: "voatabia", qty: 0.15, unit: "kg" },
      { productId: "menaka", qty: 0.03, unit: "l" },
      { productId: "sira", qty: 0.01, unit: "kg" },
    ],
    steps: [
      "Diovina tsara ny vorogne.",
      "Atsangano ny tongolo sy voatabia amin'ny menaka.",
      "Ampidirina ny vorogne, atono mandra-mivalana ny ranony.",
    ],
  },
];;

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

  /* ---- Compatibilités aliment + aliment traditionnelles ajoutées (prompt 2/4) ----
     level "compatible" (percentage 0) = combinaison traditionnelle vérifiée, jamais une exclusion.
     Toutes ces paires restent des productId existants dans DEFAULT_PRODUCTS. */
  { a: "tsaramaso", b: "henakisoa", level: "compatible", percentage: 0 }, // Tsaramaso + Henakisoa
  { a: "tsaramaso_lena", b: "henakisoa", level: "compatible", percentage: 0 },
  { a: "tsaramaso_maina", b: "henakisoa", level: "compatible", percentage: 0 },
  { a: "voanjobory_lena", b: "henaomby", level: "compatible", percentage: 0 }, // Voanjobory + Hena
  { a: "voanjobory_lena", b: "henakisoa", level: "compatible", percentage: 0 },
  { a: "voanjobory_maina", b: "henaomby", level: "compatible", percentage: 0 },
  { a: "voanjobory_maina", b: "henakisoa", level: "compatible", percentage: 0 },
  // Ravitoto + Henakisoa : déjà présent ci-dessus ({a:"henakisoa", b:"ravitoto"}) — pas de doublon ajouté.
  { a: "akoho", b: "sakamalao", level: "compatible", percentage: 0 }, // Akoho gasy + gingembre, traditionnel
  { a: "akoho", b: "tongolo_gasy", level: "compatible", percentage: 0 },
];

/* ---------- 3b. COMPATIBILITÉ ALIMENT <-> CUISSON (prompt 2/4) ----------
   Distincte de DEFAULT_COMPATIBILITY (qui porte sur des paires aliment+aliment). Ici on relie un
   productId à un mode de cuisson (valeur de DISH_COOKING_MODES). Ceci EXISTE EN PLUS de
   COOKING_MODES_DETAIL[mode].compatibleTypes (qui reste informatif/large, par groupe alimentaire) :
   cette table-ci porte des exemples précis, aliment par aliment, avec un statut de compatibilité
   explicite parmi : "compatible" | "conditionnel" | "rare_traditionnel" | "incompatible" | "interdit".
   Un aliment peut apparaître avec plusieurs modes (règle standard du prompt) — voir "akoho"/"gana"/
   "dinde"/"henakisoa" ci-dessous, chacun décliné sur plusieurs modes.
   Le moteur ne doit jamais exclure une recette sur cette seule table (voir RECO.getCookingCompatibility
   dans app.js) : "incompatible"/"interdit" pénalisent le score et expliquent le classement, comme pour
   DEFAULT_COMPATIBILITY, sans jamais fusionner deux aliments juste parce qu'ils partagent un groupe. */
const COOKING_COMPATIBILITY = [
  // ---- Gana (oie) — exemples du prompt ----
  { productId: "gana", mode: "RITRA", status: "compatible" },
  { productId: "gana", mode: "RONY", status: "compatible" },
  { productId: "gana", mode: "ENDASINA", status: "rare_traditionnel" },

  // ---- Dinde ----
  { productId: "dinde", mode: "RITRA", status: "compatible" },
  { productId: "dinde", mode: "RONY", status: "compatible" },
  { productId: "dinde", mode: "ENDASINA", status: "compatible" },
  { productId: "dinde", mode: "ROTI", status: "compatible" },

  // ---- Akoho gasy (poulet) ----
  { productId: "akoho", mode: "RITRA", status: "compatible" },
  { productId: "akoho", mode: "RONY", status: "compatible" },
  { productId: "akoho", mode: "ENDASINA", status: "compatible" },
  { productId: "akoho", mode: "GRILLE", status: "compatible" },
  { productId: "akoho", mode: "FRIT", status: "compatible" },

  // ---- Henakisoa (porc) ----
  { productId: "henakisoa", mode: "RITRA", status: "compatible" },
  { productId: "henakisoa", mode: "RONY", status: "compatible" },
  { productId: "henakisoa", mode: "GRILLE", status: "compatible" },
  { productId: "henakisoa", mode: "ROTI", status: "rare_traditionnel" },

  // ---- Henaomby (bœuf) ----
  { productId: "henaomby", mode: "RITRA", status: "compatible" },
  { productId: "henaomby", mode: "RONY", status: "compatible" },
  { productId: "henaomby", mode: "GRILLE", status: "compatible" },
  { productId: "henaomby", mode: "KETSAKETSA", status: "compatible" },

  // ---- Trondro (poisson d'eau douce) ----
  { productId: "trondro", mode: "RONY", status: "compatible" },
  { productId: "trondro", mode: "GRILLE", status: "compatible" },
  { productId: "trondro", mode: "VAPEUR", status: "compatible" },
  { productId: "trondro", mode: "FRIT", status: "compatible" },
  { productId: "trondro", mode: "ROTI", status: "incompatible" }, // pièce trop petite, procédé non traditionnel

  // ---- Anana (brèdes) — cuisson VAPEUR/FRIT peu adaptée en pratique ----
  { productId: "anana", mode: "RONY", status: "compatible" },
  { productId: "anana", mode: "KETSAKETSA", status: "compatible" },
  { productId: "anana", mode: "ATONO", status: "compatible" },
  { productId: "anana", mode: "GRILLE", status: "interdit" }, // structure de la feuille incompatible avec la grille
  { productId: "anana", mode: "ROTI", status: "interdit" },

  // ---- Voamaina (légumineuses séchées, ex: tsaramaso/voanjo) ----
  { productId: "tsaramaso_maina", mode: "RITRA", status: "compatible" },
  { productId: "tsaramaso_maina", mode: "RONY", status: "compatible" },
  { productId: "tsaramaso_maina", mode: "GRILLE", status: "interdit" }, // légumineuse séchée non pré-cuite

  // ---- Atody (œuf) ----
  { productId: "atody", mode: "ATONO", status: "compatible" },
  { productId: "atody", mode: "FRIT", status: "compatible" },
  { productId: "atody", mode: "VAPEUR", status: "conditionnel" }, // possible (œuf à la vapeur) mais peu courant localement
];

/* ---------- 3c. COMPATIBILITÉ CUISSON <-> ÉPICES / AROMATES (prompt 2/4) ----------
   Relie un mode de cuisson (et/ou un aliment précis, aliment optionnel = règle générale au mode)
   à une épice/aromate de SPICES_REFERENCE ou un productId "epices"/"autres" existant. Même échelle
   de statut que COOKING_COMPATIBILITY. `productId: null` = règle générale valable pour ce mode quel
   que soit l'aliment ; une règle avec productId précis prévaut sur la règle générale du même mode. */
const SPICE_COMPATIBILITY = [
  { productId: null, mode: "RITRA", spiceId: "tongolo_gasy", status: "compatible" },
  { productId: null, mode: "RITRA", spiceId: "sakamalao", status: "compatible" },
  { productId: null, mode: "RONY", spiceId: "tongolo_gasy", status: "compatible" },
  { productId: null, mode: "RONY", spiceId: "voatabia", status: "compatible" },
  { productId: null, mode: "KETSAKETSA", spiceId: "sakay", status: "compatible" },
  { productId: null, mode: "GRILLE", spiceId: "sira", status: "compatible" },
  { productId: null, mode: "GRILLE", spiceId: "curry", status: "conditionnel" },
  { productId: null, mode: "VAPEUR", spiceId: "sira", status: "compatible" },
  { productId: null, mode: "VAPEUR", spiceId: "sakay", status: "incompatible" }, // masque la légèreté recherchée en cuisson vapeur
  { productId: "trondro", mode: "RONY", spiceId: "sakamalao", status: "compatible" },
  { productId: "akoho", mode: "RITRA", spiceId: "curry", status: "rare_traditionnel" },
  // Ro Matsatso : aucune épice n'est jamais compatible (voir règle absolue dédiée ROMATSATSO_RULE).
  { productId: "anana", mode: "RONY", spiceId: "sakay", status: "conditionnel" },
];

/* ---------- 3d. RO MATSATSO — RÈGLE ABSOLUE (prompt 2/4) ----------
   Ro matsatso N'EST PAS une salade ni une catégorie de crudités. Définition stricte :
   Ro matsatso = bouillon d'Anana préparé avec de l'eau, SANS SEL et SANS AUTRE INGRÉDIENT AJOUTÉ.
   Cette constante est la source de vérité unique consultée par le moteur (RECO.isValidRoMatsatso
   dans app.js) et par le formulaire d'ajout (ui-laoka-form.js, dishSubCategory === "ro_matsatso")
   pour interdire automatiquement tout ingrédient hors anana + eau. L'eau elle-même n'est pas un
   productId dans DEFAULT_PRODUCTS (pas de prix) : elle est implicite, jamais listée dans
   ingredients[]. Une recette Ro Matsatso valide ne doit donc contenir QUE des productId dont
   ingredientType === "anana". */
const ROMATSATSO_RULE = {
  label: "Ro matsatso",
  definition: "Bouillon d'Anana préparé avec de l'eau, sans sel et sans autre ingrédient ajouté.",
  allowedIngredientTypes: ["anana"], // seul ingredientType autorisé dans ingredients[] (+ eau implicite)
  forbidden: {
    sira: true,           // sel — jamais autorisé
    menaka: true,          // huile — jamais autorisée
    hena: true,              // viande — jamais autorisée
    vorona: true,             // volaille — jamais autorisée
    hazan_drano: true,          // poisson — jamais autorisé
    hazandranomasina: true,      // poisson de mer — jamais autorisé
    epices: true,                 // toute épice/aromate — jamais autorisée
    autresLegumes: true,           // tout légume ajouté hors anana — jamais autorisé
    condiments: true,               // tout condiment ajouté — jamais autorisé
  },
  /* Anana réellement adaptées au ro matsatso (variantes autorisées) — restreint volontairement aux
     productId "anana" existants dans DEFAULT_PRODUCTS, sans inventer de variété non confirmée. */
  allowedAnanaProductIds: ["anana", "ravitoto", "anandrano", "anamalao", "anamamy", "anandrarezina"],
};

/* ---------- 4. PROFIL / STOCK / HISTORIQUE DE DÉMO ---------- */
const DEFAULT_PANTRY = [
  { id: "p1", productId: "menaka", qty: 1, unit: "l", purchaseDate: "2026-08-10", storage: "Placard" },
  { id: "p2", productId: "vary_fotsy", qty: 2.5, unit: "kg", purchaseDate: "2026-08-12", storage: "Placard" },
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

/* Modes de portion — grammage de protéine (viande/vorona/poisson/fruits de mer/champignon/abats)
   par personne, choisi manuellement à la recherche (voir searchFilters.portionMode). Base de calcul :
   1/4 kg (250g) réparti différemment selon le mode :
   - normal    : 250g / 3 personnes  ≈ 83 g/pers
   - robaroba  : 250g / 1 personne   = 250 g/pers (portion généreuse)
   - economique: 250g / 7.5 personnes≈ 33 g/pers (moyenne de la fourchette 7-8 pers demandée)
   Ne s'applique PAS aux légumes/anana/céréales/etc. — seulement aux ingredientType listés dans
   PROTEIN_INGREDIENT_TYPES (voir CALC.applyPortionMode dans app.js). */
const PORTION_MODES = ["economique", "normal", "robaroba"];
const PORTION_MODE_LABELS = {
  economique: "🪙 Economique",
  normal: "⚖️ Normal",
  robaroba: "🍖 Robaroba (be)",
};
const PORTION_MODE_GRAMS_PER_PERSON = {
  economique: 250 / 7.5,
  normal: 250 / 3,
  robaroba: 250,
};

/* Riz (vary) — mêmes 3 modes, mais base et répartition différentes de la protéine :
   2 kapoaka de riz (base), avec 1 kapoaka = 1 / 3.5 kg (≈ 285.7 g). Réparti par le NOMBRE de
   personnes propre au riz pour chaque mode (différent de celui de la protéine) :
   - normal    : 2 kapoaka / 3 personnes ≈ 190.5 g/pers
   - robaroba  : 2 kapoaka / 2 personnes = 285.7 g/pers
   - economique: 2 kapoaka / 5 personnes ≈ 114.3 g/pers
   S'applique uniquement aux produits riz (RICE_INGREDIENT_TYPES, voir CALC.applyPortionMode dans
   app.js) — jamais aux protéines ni aux autres féculents (mangahazo, vomanga, saonjo...). */
const KG_PER_KAPOAKA = 1 / 3.5;
const RICE_BASE_KAPOAKA = 2;
const RICE_PORTION_PEOPLE_BASE = {
  economique: 5,
  normal: 3,
  robaroba: 2,
};
const RICE_PORTION_GRAMS_PER_PERSON = {
  economique: (RICE_BASE_KAPOAKA * KG_PER_KAPOAKA * 1000) / RICE_PORTION_PEOPLE_BASE.economique,
  normal: (RICE_BASE_KAPOAKA * KG_PER_KAPOAKA * 1000) / RICE_PORTION_PEOPLE_BASE.normal,
  robaroba: (RICE_BASE_KAPOAKA * KG_PER_KAPOAKA * 1000) / RICE_PORTION_PEOPLE_BASE.robaroba,
};

const DEFAULT_SETTINGS = {
  city: "Antananarivo",
  currency: "Ar",
  tone: "simple", // "simple" | "elegant" | "professionnel" | "basy_vava"
};

/* Durée indicative de conservation (jours) par catégorie — usage informatif seulement */
const SHELF_LIFE_DAYS = {
  legumes: 6,
  viandes: 2,
  vorona: 2, // volailles : périssable, comme viandes (audit prompt 1/4 : catégorie séparée de "viandes")
  hazandrano: 2, // poisson d'eau douce frais
  trondro_maina: 90, // poisson séché — durée de conservation bien plus longue que le frais, maintenant que c'est une catégorie séparée (voir migration demandée)
  hazandranomasina: 2, // poisson de mer
  fruits_de_mer: 1, // crustacés/mollusques frais : très périssable
  special_boucher: 2, // découpes/préparations bouchères : périssable, comme viandes
  atody: 14,
  huiles: 180,
  epices: 365,
  cereales: 180,
  legumineuses: 180,
  autres: 30,
  ambany_tanana: 2, // abats/museau/gôrza : périssable, comme viandes
};

/* ---------- 4b. NOUVEAUX ENUMS — FORMULAIRE D'AJOUT DE LAOKA (Paramètres) ---------- */

/* "Atao" (mode de cuisson) — étend l'ancien enum type avec VOAMAINA (légumineuses séchées),
   puis avec les modes du prompt 2/4 (cuissons/épices/compatibilités).
   KIENDY / "Miendy" SUPPRIMÉ (audit prompt final, section 3) : le prompt final interdit explicitement
   d'utiliser "Miendy" comme catégorie et impose "Endasina (frire)" comme mode affiché. Les 2 recettes
   historiquement en KIENDY (r01, r13 — œuf sauté à l'huile) sont reclassées en ENDASINA.
   MAIN, SAOSY, LASOPY, LEGUMES, POISSON, VIANDE, ATODY, VOAMAINA restent des modes historiques du
   projet, non listés explicitement dans le prompt 2 mais conservés (le prompt ne demande jamais
   d'en supprimer). STANDARD ajouté en tête (prompt 2, liste MODES A PREVOIR) : cuisson simple par
   défaut, sans procédé particulier. */
const DISH_COOKING_MODES = [
  "STANDARD", "RITRA", "RONY", "KETSAKETSA",
  "NAHANDRO_GASY", "ENDASINA", "ATONO", "GRILLE", "VAPEUR", "FRIT", "ROTI", "SAOSY",
  "MAINA", "LASOPY", "LEGUMES", "POISSON", "VIANDE", "ATODY", "VOAMAINA",
];
const COOKING_MODE_LABELS = {
  STANDARD: "Standard", RITRA: "Ritra", RONY: "Rony", KETSAKETSA: "Ketsaketsa",
  NAHANDRO_GASY: "Nahandro gasy", ENDASINA: "Endasina", ATONO: "Atono", GRILLE: "Grillé",
  VAPEUR: "Vapeur", FRIT: "Frit", ROTI: "Rôti", SAOSY: "Saosy",
  MAINA: "Maina", LASOPY: "Lasopy", LEGUMES: "Légumes",
  POISSON: "Poisson", VIANDE: "Viande", ATODY: "Atody",
  VOAMAINA: "Voamaina (légumineuses séchées)",
};

/* ---------- 4b-bis. CUISSONS — FICHE DETAILLEE (prompt 2/4) ----------
   Pour chaque mode : nom, traduction française, description, aliments compatibles (valeurs de
   DISH_INGREDIENT_TYPES / LAOKA_KIND, PAS des groupes alimentaires génériques ex nihilo — on
   réutilise les groupes déjà définis plus haut), ingrédients généralement utilisés (productId de
   DEFAULT_PRODUCTS quand ils existent), et restrictions éventuelles.
   IMPORTANT (règle du prompt 2) : les cuissons sont INDÉPENDANTES des groupes alimentaires — cette
   fiche est informative (aide au wizard, suggestions), elle ne restreint JAMAIS le moteur RECO à
   filtrer/exclure une recette sur la seule base de compatibleFoodTypes. Seules les tables
   COOKING_COMPATIBILITY et SPICE_COMPATIBILITY (plus bas) portent des règles de compatibilité
   exploitées par le moteur.
   Un aliment peut avoir plusieurs modes de cuisson (règle standard du prompt) : ceci est déjà
   garanti nativement, une recette ne fixe qu'un seul `type`/cookingMethod à la fois, mais rien
   n'empêche plusieurs recettes différentes portant sur le même ingrédient d'utiliser des modes
   différents (ex : Akoho gasy -> RITRA, Akoho gasy -> RONY sont tous valides).
   Termes malgaches incertains : on ne définit PAS de traduction/étymologie inventée quand le sens
   traditionnel exact n'est pas garanti (ex : NAHANDRO_GASY reste "cuisine malgache traditionnelle"
   au sens large, sans sur-préciser une technique qui ne serait pas confirmée). */
const COOKING_MODES_DETAIL = {
  STANDARD: {
    name: "Standard",
    fr: "Cuisson standard",
    description: "Cuisson simple sans procédé particulier — base par défaut avant d'appliquer un mode plus spécifique.",
    compatibleTypes: ["legumes", "anana", "hena", "vorona", "voamaina", "hazan_drano", "hazandranomasina", "fruits_de_mer", "atody", "holatra", "ambany_tanana"],
    commonIngredients: ["menaka", "sira", "tongolo"],
    restrictions: "Aucune restriction spécifique.",
  },
  RITRA: {
    name: "Ritra",
    fr: "Mijoté à sec / sauté-mijoté avec peu de liquide",
    description: "Viande, volaille ou légumineuse revenue puis mijotée dans son propre jus avec peu ou pas d'eau ajoutée, jusqu'à réduction de la sauce.",
    compatibleTypes: ["hena", "vorona", "voamaina", "hazan_drano", "ambany_tanana"],
    commonIngredients: ["menaka", "tongolo", "sira", "voatabia"],
    restrictions: "Peu adapté aux anana/légumes feuilles (trop peu de liquide pour leur cuisson habituelle).",
  },
  RONY: {
    name: "Rony",
    fr: "En bouillon / en sauce",
    description: "Préparation avec une quantité de liquide plus importante que le ritra, donnant une sauce ou un bouillon consistant.",
    compatibleTypes: ["hena", "vorona", "anana", "legumes", "hazan_drano", "voamaina", "ambany_tanana"],
    commonIngredients: ["tongolo", "voatabia", "sira", "aondrana"],
    restrictions: "Aucune restriction spécifique, hors cas Ro Matsatso (voir règle dédiée).",
  },
  KETSAKETSA: {
    name: "Ketsaketsa",
    fr: "Sauté rapide",
    description: "Cuisson rapide à feu vif, avec peu de liquide, pour des morceaux coupés petits.",
    compatibleTypes: ["hena", "vorona", "legumes", "anana", "hazan_drano"],
    commonIngredients: ["menaka", "tongolo", "sira"],
    restrictions: "Peu adapté aux légumineuses séchées non pré-cuites (temps de cuisson trop court).",
  },
  NAHANDRO_GASY: {
    name: "Nahandro gasy",
    fr: "Cuisine malgache traditionnelle",
    description: "Terme générique désignant une préparation selon les méthodes traditionnelles malgaches ; n'implique pas un procédé unique et précis.",
    compatibleTypes: ["legumes", "anana", "hena", "vorona", "voamaina", "hazan_drano", "hazandranomasina", "fruits_de_mer", "atody"],
    commonIngredients: ["tongolo", "sira", "menaka", "voatabia"],
    restrictions: "Terme large — se combine généralement avec un autre mode plus précis (ritra, rony...) plutôt que d'être utilisé seul.",
  },
  ENDASINA: {
    name: "Endasina",
    fr: "Cuit au four / rôti au four",
    description: "Cuisson par chaleur enveloppante au four.",
    compatibleTypes: ["hena", "vorona", "hazan_drano", "hazandranomasina", "legumes"],
    commonIngredients: ["menaka", "sira", "tongolo"],
    restrictions: "Peu adapté aux anana (feuilles) et aux légumineuses séchées non pré-cuites.",
  },
  ATONO: {
    name: "Atono",
    fr: "Sauté à l'huile chaude",
    description: "Cuisson rapide dans l'huile chaude, souvent utilisée pour saisir avant de mijoter ou comme cuisson finale de légumes/œufs.",
    compatibleTypes: ["legumes", "anana", "atody", "hena", "vorona", "hazan_drano"],
    commonIngredients: ["menaka", "tongolo", "sira", "sakay"],
    restrictions: "Aucune restriction spécifique.",
  },
  GRILLE: {
    name: "Grillé",
    fr: "Grillé (braise ou grill)",
    description: "Cuisson directe sur braise ou grill, sans immersion dans un liquide.",
    compatibleTypes: ["hena", "vorona", "hazan_drano", "hazandranomasina", "fruits_de_mer"],
    commonIngredients: ["sira", "menaka"],
    restrictions: "Peu adapté aux légumineuses et aux anana (structure non tenue à la grille).",
  },
  VAPEUR: {
    name: "Vapeur",
    fr: "Cuit à la vapeur",
    description: "Cuisson par vapeur d'eau, sans immersion directe.",
    compatibleTypes: ["legumes", "anana", "hazan_drano", "hazandranomasina", "fruits_de_mer", "vorona"],
    commonIngredients: ["sira"],
    restrictions: "Peu utilisé pour les légumineuses séchées (temps de cuisson trop long en vapeur seule).",
  },
  FRIT: {
    name: "Frit",
    fr: "Frit (friture)",
    description: "Cuisson par immersion dans l'huile chaude.",
    compatibleTypes: ["hena", "vorona", "hazan_drano", "hazandranomasina", "fruits_de_mer", "atody", "legumes", "voamaina"],
    commonIngredients: ["menaka", "sira"],
    restrictions: "Aucune restriction spécifique.",
  },
  ROTI: {
    name: "Rôti",
    fr: "Rôti",
    description: "Cuisson longue à chaleur douce et enveloppante, généralement pour de grosses pièces de viande ou volaille.",
    compatibleTypes: ["hena", "vorona"],
    commonIngredients: ["menaka", "sira", "tongolo"],
    restrictions: "Peu adapté aux légumes/anana et aux petites pièces (poisson, fruits de mer).",
  },
  SAOSY: {
    name: "Saosy",
    fr: "En sauce épaisse",
    description: "Préparation servie avec une sauce liée, plus épaisse qu'un rony classique.",
    compatibleTypes: ["hena", "vorona", "hazan_drano", "atody"],
    commonIngredients: ["tongolo", "voatabia", "sira", "menaka"],
    restrictions: "Aucune restriction spécifique.",
  },
};

/* "Karazana laoka" — catégorie d'ingrédient principal affichée dans le wizard de recherche
   (2e grille du formulaire, sous "Sokajin-tsakafo"). Distinct de DISH_COOKING_MODES ("Atao" /
   mode de préparation) : ici on classe par nature de l'ingrédient. TRONDRO a un sous-choix
   dédié maina (sec) / lena (frais), voir TRONDRO_STATE_LABELS. */
/* "Karazana laoka" — filtre de recherche ampahibemaso, aligné sur DISH_INGREDIENT_TYPES (groupe
   alimentaire réel). LASOPY retiré d'ici (audit prompt 1/4, règle 16) : c'est un GROUPE SPÉCIAL
   (comme Ro Matsatso, Fety), pas un groupe alimentaire ordinaire — traité dans les prompts suivants,
   toujours accessible via dishSubCategory/type="LASOPY" côté recherche par mode de cuisson.
   TRONDRO (générique, eau douce+mer confondus) remplacé par HAZANDRANO/HAZANDRANOMASINA séparés,
   plus FRUITS_DE_MER à part (crustacés/mollusques ne sont pas des poissons). VORONA/HOLATRA/
   AMBANY_TANANA ajoutés pour couvrir la structure cible complète. */
const LAOKA_KIND = [
  "VOAMAINA", "VOALENA", "ANANA", "LEGUMES", "HENA", "VORONA",
  "HAZANDRANO", "HAZANDRANOMASINA", "FRUITS_DE_MER", "ATODY", "HOLATRA", "AMBANY_TANANA",
];
const LAOKA_KIND_LABELS = {
  VOAMAINA: "Voamaina",
  VOALENA: "Voalena",
  ANANA: "Anana",
  LEGUMES: "Legioma",
  HENA: "Hena",
  VORONA: "Vorona",
  HAZANDRANO: "Hazandrano (poisson d'eau douce)",
  HAZANDRANOMASINA: "Hazandranomasina (poisson de mer)",
  FRUITS_DE_MER: "Fruits de mer",
  ATODY: "Atody",
  HOLATRA: "Holatra",
  AMBANY_TANANA: "Ambany tanana",
};
/* Sous-état du poisson (hazandrano/hazandranomasina) : maina (sec) ou lena (frais) — affiché
   seulement quand un de ces deux "Karazana laoka" est choisi. Nom de variable conservé (TRONDRO_STATES)
   pour rétrocompat avec ui.js/app.js, "trondro" désignant génériquement le poisson dans l'app. */
const TRONDRO_STATES = ["maina", "lena"];
const TRONDRO_STATE_LABELS = { maina: "Maina (sec)", lena: "Lena (frais)" };

/* "Type" (catégorie d'ingrédient principal / GROUPE ALIMENTAIRE) — champ séparé de "Atao" (mode de
   cuisson) et de dishCategory/dishSubCategory (structure de plat). Étendu (audit Laoka, prompt 1/4)
   pour couvrir la structure cible complète : voamaina/anana/legioma/hena/vorona/hazan_drano/
   hazandranomasina/fruits_de_mer/atody/holatra/ambany_tanana/special_boucher. "legumes" (historique)
   est conservé comme alias de "legioma" pour rétrocompat — ne jamais le supprimer, voir DATA.loadData.
   anamadinika/anatsinahy ne sont PAS distingués d'anana ici : aucune donnée existante ne permet de les
   différencier avec certitude sans inventer un terme (voir rapport d'audit, "éléments douteux"). */
const DISH_INGREDIENT_TYPES = [
  "legumes", "anana", "hena", "vorona", "voamaina",
  "hazan_drano", "hazandranomasina", "fruits_de_mer",
  "atody", "holatra", "ambany_tanana", "special_boucher",
];
const DISH_INGREDIENT_TYPE_LABELS = {
  legumes: "Legioma (légumes)",
  anana: "Anana (brèdes)",
  hena: "Hena (viande — bœuf, porc, mouton, chèvre, lapin)",
  vorona: "Vorona (volailles)",
  voamaina: "Voamaina (légumineuses/graines séchées ou fraîches)",
  hazan_drano: "Hazandrano (poisson d'eau douce)",
  hazandranomasina: "Hazandranomasina (poisson de mer)",
  fruits_de_mer: "Fruits de mer (crustacés, mollusques)",
  atody: "Atody (œuf)",
  holatra: "Holatra (champignons)",
  ambany_tanana: "Ambany tanana (abats, spécialités)",
  special_boucher: "Special Boucher (découpes de viande)",
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
const MEASURE_UNITS = ["kg", "g", "l", "ml", "piece", "bunch", "kapoaka", "tsongo", "madco", "tanana", "toko", "fehezana", "vilia", "tavoahangy", "sotro"];
const UNIT_LABELS = {
  kg: "kg", g: "g", l: "L", ml: "ml",
  piece: "pièce(s)", bunch: "botte(s)",
  kapoaka: "kapoaka", tsongo: "tsongo (pince)", madco: "madco", tanana: "tanana (main)",
  toko: "toko",
  fehezana: "fehezana", vilia: "vilia", tavoahangy: "tavoahangy", sotro: "sotro",
};
/* madco = 1/3 de kapoaka (confirmé). Utile si l'app doit un jour convertir entre les deux. */
const MADCO_PER_KAPOAKA = 3;

/* ---------- 5bis. UNITÉS MALAGASY STANDARDISÉES ----------
   Ces 4 unités sont conservées TELLES QUELLES dans les données (unit: "fehezana", qty: 0.5 pour
   "1/2 fehezana", etc.) — l'utilisateur voit toujours "1/2 fehezana" à l'affichage. Mais contrairement
   à kapoaka/tsongo/madco/tanana (discrètes, pas de conversion fiable), ces 4-là ont une équivalence
   de référence connue et fixe, utilisée uniquement par le moteur de calcul (CALC.toBaseQty) pour
   convertir en base g/ml et calculer un coût correct — jamais pour changer l'unité affichée à l'écran.
   Ex: 1/2 fehezana (qty=0.5, unit="fehezana") -> moteur calcule 0.5 * 150 = 75 g -> prix au kg. */
const UNIT_EQUIVALENTS = {
  fehezana: { qty: 150, unit: "g" },
  vilia: { qty: 170, unit: "g" },
  tavoahangy: { qty: 1, unit: "l" },
  sotro: { qty: 10, unit: "ml" },
};

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
  /* Entiers 3 à 99 — permet de choisir directement une grande quantité sans taper au clavier. */
  ...Array.from({ length: 97 }, (_, i) => ({ label: String(i + 3), value: i + 3 })),
];
