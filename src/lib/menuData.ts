// ─── Menu Data – Le Comptoir de Tunis ────────────────────────────────────────

export type CategoryId = "boissons" | "patisseries" | "plats" | "desserts" | "sandwichs";

export interface MenuOption {
  label: string;
  choices: { id: string; label: string; priceDelta: number }[];
}

export interface MenuItem {
  id: string;
  categoryId: CategoryId;
  name: string;
  nameAr?: string;
  description: string;
  price: number; // in TND (e.g. 4.500)
  emoji: string;
  available: boolean;
  tags?: string[];
  options?: MenuOption[];
  popular?: boolean;
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  description: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  { id: "boissons",    label: "Boissons",     emoji: "☕",  description: "Cafés, thés, jus frais" },
  { id: "sandwichs",   label: "Sandwichs",    emoji: "🥙",  description: "Pains maison garnis" },
  { id: "plats",       label: "Plats",        emoji: "🍲",  description: "Spécialités tunisiennes" },
  { id: "patisseries", label: "Pâtisseries",  emoji: "🍯",  description: "Sucreries orientales" },
  { id: "desserts",    label: "Desserts",     emoji: "🧁",  description: "Glaces & douceurs" },
];

// ─── Menu Items ───────────────────────────────────────────────────────────────

export const MENU_ITEMS: MenuItem[] = [

  // ── Boissons ──────────────────────────────────────────────────────────────

  {
    id: "cafe-direct",
    categoryId: "boissons",
    name: "Café Direct",
    nameAr: "قهوة مباشرة",
    description: "Expresso pur arabica tunisien, torréfié à l'ancienne. Servi avec un verre d'eau fraîche et une datte Deglet Nour.",
    price: 3.500,
    emoji: "☕",
    available: true,
    popular: true,
    tags: ["hot", "caffeine"],
    options: [
      {
        label: "Taille",
        choices: [
          { id: "small", label: "Express (30ml)", priceDelta: 0 },
          { id: "medium", label: "Allongé (60ml)", priceDelta: 0.5 },
          { id: "large", label: "Double (90ml)", priceDelta: 1.0 },
        ],
      },
      {
        label: "Sucre",
        choices: [
          { id: "no-sugar", label: "Sans sucre", priceDelta: 0 },
          { id: "one", label: "1 sucre", priceDelta: 0 },
          { id: "two", label: "2 sucres", priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: "the-menthe",
    categoryId: "boissons",
    name: "Thé à la Menthe",
    nameAr: "شاي بالنعناع",
    description: "Thé vert gunpowder infusé avec de la menthe fraîche du marché central. Sucré à votre goût, servi bouillant dans un verre à la tunisienne.",
    price: 4.000,
    emoji: "🫖",
    available: true,
    popular: true,
    tags: ["hot", "traditional"],
    options: [
      {
        label: "Intensité",
        choices: [
          { id: "light", label: "Léger", priceDelta: 0 },
          { id: "normal", label: "Normal", priceDelta: 0 },
          { id: "strong", label: "Fort", priceDelta: 0 },
        ],
      },
      {
        label: "Supplément",
        choices: [
          { id: "none", label: "Sans", priceDelta: 0 },
          { id: "pinoli", label: "+ Pignons de pin", priceDelta: 2.0 },
          { id: "amandes", label: "+ Amandes", priceDelta: 1.5 },
        ],
      },
    ],
  },
  {
    id: "jus-orange",
    categoryId: "boissons",
    name: "Jus d'Orange Pressé",
    nameAr: "عصير البرتقال",
    description: "Oranges maltaises de Nabeul pressées à la minute. 100% naturel, sans sucre ajouté. Un concentré de soleil tunisien.",
    price: 5.500,
    emoji: "🍊",
    available: true,
    popular: false,
    tags: ["cold", "fresh", "vitamin"],
    options: [
      {
        label: "Taille",
        choices: [
          { id: "25cl", label: "25cl", priceDelta: 0 },
          { id: "50cl", label: "50cl", priceDelta: 2.5 },
        ],
      },
    ],
  },
  {
    id: "lben",
    categoryId: "boissons",
    name: "Lben Traditionnel",
    nameAr: "لبن",
    description: "Lait fermenté artisanal, légèrement salé. La boisson rafraîchissante par excellence en Tunisie, idéale avec les plats épicés.",
    price: 3.000,
    emoji: "🥛",
    available: true,
    tags: ["cold", "traditional"],
  },
  {
    id: "citronnade-menthe",
    categoryId: "boissons",
    name: "Citronnade Menthe Maison",
    nameAr: "عصير الليمون بالنعناع",
    description: "Citrons frais pressés, menthe fraîche, miel naturel et glaçons. Préparée à la commande avec une pointe d'eau de fleur d'oranger.",
    price: 6.000,
    emoji: "🍋",
    available: true,
    popular: true,
    tags: ["cold", "fresh", "popular"],
    options: [
      {
        label: "Taille",
        choices: [
          { id: "regular", label: "Regular (30cl)", priceDelta: 0 },
          { id: "large", label: "Large (50cl)", priceDelta: 2.0 },
        ],
      },
    ],
  },

  // ── Sandwichs ─────────────────────────────────────────────────────────────

  {
    id: "sandwich-tunisien",
    categoryId: "sandwichs",
    name: "Sandwich Tunisien Complet",
    nameAr: "كسرة تونسية",
    description: "Baguette tunisienne croustillante garnie de thon, harissa maison, olives noires, câpres, tomates, pomme de terre et huile d'olive vierge de Sfax.",
    price: 8.500,
    emoji: "🥖",
    available: true,
    popular: true,
    tags: ["hot", "spicy", "filling"],
    options: [
      {
        label: "Pain",
        choices: [
          { id: "baguette", label: "Baguette", priceDelta: 0 },
          { id: "tabouna", label: "Tabouna (pain traditionnel)", priceDelta: 1.0 },
          { id: "batbout", label: "Batbout grillé", priceDelta: 0.5 },
        ],
      },
      {
        label: "Harissa",
        choices: [
          { id: "none", label: "Sans harissa", priceDelta: 0 },
          { id: "mild", label: "Douce", priceDelta: 0 },
          { id: "hot", label: "Piquante 🌶️", priceDelta: 0 },
          { id: "extra", label: "Extra hot 🔥", priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: "brik-thon",
    categoryId: "sandwichs",
    name: "Brik au Thon & Œuf",
    nameAr: "بريك بالتن والبيض",
    description: "La brik tunisienne par excellence. Malsouka croustillante, thon de Mahdia, œuf à la coque, câpres et harissa. Plongée dans l'huile bouillante à la commande.",
    price: 7.500,
    emoji: "🥟",
    available: true,
    popular: true,
    tags: ["hot", "traditional", "spicy"],
    options: [
      {
        label: "Garniture",
        choices: [
          { id: "thon", label: "Thon classique", priceDelta: 0 },
          { id: "fromage", label: "Thon + Fromage", priceDelta: 1.5 },
          { id: "crevettes", label: "Crevettes", priceDelta: 3.0 },
        ],
      },
    ],
  },

  // ── Plats ─────────────────────────────────────────────────────────────────

  {
    id: "couscous-tfaya",
    categoryId: "plats",
    name: "Couscous à la Tfaya",
    nameAr: "كسكسي بالتفاية",
    description: "Semoule fine vapeur, légumes de saison, pois chiches et tfaya (confit d'oignons raisins secs, cannelle). Un voyage culinaire au cœur de la Médina.",
    price: 18.000,
    emoji: "🫕",
    available: true,
    popular: true,
    tags: ["hot", "traditional", "filling", "vegetarian"],
    options: [
      {
        label: "Viande",
        choices: [
          { id: "veg", label: "Végétarien 🌿", priceDelta: 0 },
          { id: "agneau", label: "+ Agneau", priceDelta: 6.0 },
          { id: "poulet", label: "+ Poulet", priceDelta: 4.0 },
          { id: "merguez", label: "+ Merguez", priceDelta: 3.0 },
        ],
      },
    ],
  },
  {
    id: "tajine-malsouka",
    categoryId: "plats",
    name: "Tajine Malsouka au Poulet",
    nameAr: "طاجين ملسوقة",
    description: "Tajine tunisien (différent du marocain), à base d'œufs, poulet effiloché, fromage râpé et persil, cuit au four dans sa feuille de malsouka croustillante.",
    price: 16.500,
    emoji: "🥘",
    available: true,
    tags: ["hot", "traditional"],
    options: [
      {
        label: "Supplément",
        choices: [
          { id: "none", label: "Nature", priceDelta: 0 },
          { id: "salade", label: "+ Salade méchouia", priceDelta: 3.5 },
        ],
      },
    ],
  },
  {
    id: "chorba-frik",
    categoryId: "plats",
    name: "Chorba Frik",
    nameAr: "شوربة فريك",
    description: "La soupe tunisienne traditionnelle au blé vert concassé, agneau, tomate, coriandre fraîche et citron. Onctueuse, parfumée, réconfortante.",
    price: 9.500,
    emoji: "🍲",
    available: true,
    popular: false,
    tags: ["hot", "soup", "traditional"],
  },
  {
    id: "lablabi",
    categoryId: "plats",
    name: "Lablabi",
    nameAr: "لبلابي",
    description: "Soupe de pois chiches mijotée, pain rassis, œuf poché, harissa, câpres, cumin, citron et huile d'olive. Le plat emblématique des souks de Tunis.",
    price: 8.000,
    emoji: "🫘",
    available: false,
    tags: ["hot", "traditional", "street-food"],
  },

  // ── Pâtisseries ───────────────────────────────────────────────────────────

  {
    id: "baklawa",
    categoryId: "patisseries",
    name: "Baklawa aux Amandes",
    nameAr: "بقلاوة",
    description: "Feuilletés de pâte phyllo dorés au four, fourrés d'amandes concassées parfumées à l'eau de rose et de fleur d'oranger. Trempés dans le miel de thym de Jebel.",
    price: 6.500,
    emoji: "🧆",
    available: true,
    popular: true,
    tags: ["sweet", "traditional", "gluten"],
    options: [
      {
        label: "Portion",
        choices: [
          { id: "3pcs", label: "3 pièces", priceDelta: 0 },
          { id: "6pcs", label: "6 pièces", priceDelta: 4.5 },
          { id: "box", label: "Boîte 12 pièces", priceDelta: 10.0 },
        ],
      },
    ],
  },
  {
    id: "makroudh",
    categoryId: "patisseries",
    name: "Makroudh de Kairouan",
    nameAr: "مقروض",
    description: "Les célèbres gâteaux de semoule farcis aux dattes Deglet Nour et à l'eau de rose, frits à l'or et enrobés de miel naturel. Spécialité de Kairouan.",
    price: 5.000,
    emoji: "🟤",
    available: true,
    popular: true,
    tags: ["sweet", "traditional", "dates"],
    options: [
      {
        label: "Nombre",
        choices: [
          { id: "2pcs", label: "2 pièces", priceDelta: 0 },
          { id: "4pcs", label: "4 pièces", priceDelta: 3.5 },
        ],
      },
    ],
  },
  {
    id: "samsa",
    categoryId: "patisseries",
    name: "Samsa Pistache",
    nameAr: "سمسة",
    description: "Triangle de malsouka croustillant fourré de pistaches et amandes broyées, parfumé à l'eau de fleur d'oranger, nappé de miel ambré.",
    price: 4.500,
    emoji: "🔺",
    available: true,
    tags: ["sweet", "traditional", "nuts"],
  },
  {
    id: "griwech",
    categoryId: "patisseries",
    name: "Griwech au Miel",
    nameAr: "قريوش",
    description: "Beignets en forme de rosace, frits à la perfection et trempés dans le miel. Légers, croustillants dehors, moelleux dedans. Incontournable du goûter tunisien.",
    price: 3.500,
    emoji: "🍩",
    available: true,
    tags: ["sweet", "fried"],
  },

  // ── Desserts ──────────────────────────────────────────────────────────────

  {
    id: "assidat-zgougou",
    categoryId: "desserts",
    name: "Assidat Zgougou",
    nameAr: "عصيدة الزقوق",
    description: "La crème emblématique tunisienne à base de graines de pin parasol (zgougou) sauvages de Tabarka, surmontée de crème pâtissière et de pistaches concassées.",
    price: 9.000,
    emoji: "🍮",
    available: true,
    popular: true,
    tags: ["cold", "sweet", "traditional", "nuts"],
  },
  {
    id: "bouhlouf",
    categoryId: "desserts",
    name: "Bouhlouf au Lait de Coco",
    nameAr: "بوهلوف",
    description: "Dessert lacté onctueux à base de farine de semoule fine, lait entier et lait de coco, parfumé à la vanille. Servi chaud avec un filet de miel.",
    price: 7.500,
    emoji: "🍶",
    available: true,
    tags: ["warm", "sweet", "creamy"],
  },
  {
    id: "glace-pistache",
    categoryId: "desserts",
    name: "Glace Pistache Maison",
    nameAr: "جلاص الفستق",
    description: "Glace artisanale à la pistache de Bronte, façonnée à la main. Servie avec des éclats de pistaches grillées et un coulis de grenade.",
    price: 8.000,
    emoji: "🍦",
    available: true,
    popular: false,
    tags: ["cold", "sweet", "nuts"],
    options: [
      {
        label: "Boules",
        choices: [
          { id: "1", label: "1 boule", priceDelta: 0 },
          { id: "2", label: "2 boules", priceDelta: 4.0 },
          { id: "3", label: "3 boules", priceDelta: 8.0 },
        ],
      },
    ],
  },
  {
    id: "chajra-tunisienne",
    categoryId: "desserts",
    name: "Chajra Tunisienne",
    nameAr: "الشجرة التونسية",
    description: "Notre dessert signature : une \"arbre\" en zlabia (beignets au sirop) et fruits secs, accompagné d'une boule de glace vanille et de miel de thym.",
    price: 14.500,
    emoji: "🌳",
    available: true,
    popular: true,
    tags: ["sweet", "signature", "sharing"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getItemsByCategory(categoryId: CategoryId): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.categoryId === categoryId);
}

export function getItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id);
}

export function formatPrice(price: number): string {
  return price.toFixed(3) + " TND";
}

export const RESTAURANT_NAME = "Le Comptoir de Tunis";
export const RESTAURANT_TAGLINE = "Saveurs authentiques de la Médina";
