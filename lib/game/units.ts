export interface UnitMeta {
  number: number;
  country: string;
  countryCode: string;
  flag: string;
  titleEs: string;
  titleEn: string;
  description: string;
  criminal: string;
  stolenItem: string;
  /** Card rotation in degrees for corkboard feel */
  rotation: number;
  /** Accent color for the card stripe */
  themeColor: string;
}

export const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X"] as const;

export const UNITS: UnitMeta[] = [
  {
    number: 1, country: "México",               countryCode: "MX", flag: "🇲🇽",
    titleEs: "¿Quién soy yo?",    titleEn: "Who Am I?",
    description: "Greetings, introductions, and numbers",
    criminal: "El Camaleón",      stolenItem: "El Códice Azteca",      rotation: -2,    themeColor: "#c0392b",
  },
  {
    number: 2, country: "España",               countryCode: "ES", flag: "🇪🇸",
    titleEs: "La escuela",        titleEn: "School Life",
    description: "School subjects, schedules, and classroom language",
    criminal: "La Silenciosa",    stolenItem: "El Abanico Real",       rotation: 1.5,   themeColor: "#9b2226",
  },
  {
    number: 3, country: "Puerto Rico",           countryCode: "PR", flag: "🇵🇷",
    titleEs: "La familia",        titleEn: "Family",
    description: "Family members, descriptions, and relationships",
    criminal: "El Fantasma",      stolenItem: "El Cuatro Histórico",   rotation: -1,    themeColor: "#0a5c8a",
  },
  {
    number: 4, country: "Costa Rica",            countryCode: "CR", flag: "🇨🇷",
    titleEs: "La casa",           titleEn: "Home",
    description: "Home, rooms, furniture, and chores",
    criminal: "La Sombra Verde",  stolenItem: "La Carreta Típica",     rotation: 2,     themeColor: "#1a6b3a",
  },
  {
    number: 5, country: "Argentina",             countryCode: "AR", flag: "🇦🇷",
    titleEs: "La comida",         titleEn: "Food",
    description: "Food, restaurants, ordering, and flavors",
    criminal: "El Tango Negro",   stolenItem: "El Mate Sagrado",       rotation: -1.5,  themeColor: "#2b6cb0",
  },
  {
    number: 6, country: "Chile",                 countryCode: "CL", flag: "🇨🇱",
    titleEs: "El tiempo libre",   titleEn: "Free Time",
    description: "Hobbies, sports, and weekend activities",
    criminal: "La Condora",       stolenItem: "La Bandera Antigua",    rotation: 1,     themeColor: "#8b1a1a",
  },
  {
    number: 7, country: "Colombia",              countryCode: "CO", flag: "🇨🇴",
    titleEs: "La ropa",           titleEn: "Clothing",
    description: "Clothing, shopping, colors, and prices",
    criminal: "El Espejo",        stolenItem: "La Corona de Oro",      rotation: -2,    themeColor: "#c9933a",
  },
  {
    number: 8, country: "República Dominicana",  countryCode: "DO", flag: "🇩🇴",
    titleEs: "El cuerpo",         titleEn: "Body & Health",
    description: "Body parts, health, and at the doctor",
    criminal: "La Mariposa Roja", stolenItem: "El Taíno de Madera",   rotation: 2.5,   themeColor: "#6b4c9b",
  },
  {
    number: 9, country: "Perú",                  countryCode: "PE", flag: "🇵🇪",
    titleEs: "El medio ambiente", titleEn: "The Environment",
    description: "Nature, weather, and environmental awareness",
    criminal: "El Silencio",      stolenItem: "El Calendario Inca",    rotation: -1.8,  themeColor: "#b45309",
  },
  {
    number: 10, country: "Ecuador",              countryCode: "EC", flag: "🇪🇨",
    titleEs: "El futuro",         titleEn: "The Future",
    description: "Future plans, technology, and careers",
    criminal: "El Maestro",       stolenItem: "El Sombrero de Paja",   rotation: 1.5,  themeColor: "#065f46",
  },
];
