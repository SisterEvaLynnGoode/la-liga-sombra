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
  /** If true, the unit content hasn't shipped yet — render as "Próximamente" */
  comingSoon?: boolean;
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
    number: 2, country: "Puerto Rico",           countryCode: "PR", flag: "🇵🇷",
    titleEs: "El robo en la escuela", titleEn: "The School Heist",
    description: "Classroom vocabulary, ser + adjectives, -AR verbs",
    criminal: "El Tecladista",    stolenItem: "El Laboratorio de Computadoras", rotation: 1.5, themeColor: "#0a5c8a",
  },
  {
    number: 3, country: "España",               countryCode: "ES", flag: "🇪🇸",
    titleEs: "Persecución por Madrid", titleEn: "Madrid Chase",
    description: "Places, transportation, and the verb 'ir' across Madrid landmarks",
    criminal: "La Sombra",        stolenItem: "Pintura de Velázquez",  rotation: -1,    themeColor: "#9b2226",
  },
  {
    number: 4, country: "Costa Rica",            countryCode: "CR", flag: "🇨🇷",
    titleEs: "La Familia Sospechosa", titleEn: "The Suspect Family",
    description: "Family vocabulary, ser vs estar, emotions, possessives",
    criminal: "El Heredero",      stolenItem: "El Collar de Esmeraldas", rotation: 2,     themeColor: "#1a6b3a",
  },
  {
    number: 5, country: "Argentina",             countryCode: "AR", flag: "🇦🇷",
    titleEs: "Hackeo en Buenos Aires", titleEn: "The Buenos Aires Hack",
    description: "Tech, numbers, dates, tener-expressions",
    criminal: "El Fantasma Digital", stolenItem: "Datos Confidenciales", rotation: -1.5,  themeColor: "#2b6cb0",
  },
  {
    number: 6, country: "Colombia",              countryCode: "CO", flag: "🇨🇴",
    titleEs: "El Chef Misterioso", titleEn: "The Mystery Chef",
    description: "Colombian cuisine, stem-changing verbs, demonstratives",
    criminal: "El Cocinero Secreto", stolenItem: "La Receta Familiar",  rotation: 1,     themeColor: "#c9933a",
  },
  {
    number: 7, country: "Chile",                 countryCode: "CL", flag: "🇨🇱",
    titleEs: "Sabotaje en el Festival", titleEn: "Festival Sabotage",
    description: "Music, performing arts, and the verb 'ir' in context",
    criminal: "El Técnico Oscuro", stolenItem: "El Instrumento Antiguo", rotation: -2,    themeColor: "#8b1a1a",
  },
  {
    number: 8, country: "Perú",                  countryCode: "PE", flag: "🇵🇪",
    titleEs: "El Mercado Robado", titleEn: "The Stolen Market",
    description: "Markets, shopping, bargaining, and Andean culture",
    criminal: "El Coleccionista", stolenItem: "El Tesoro Inca",        rotation: 2.5,   themeColor: "#b45309",
  },
  {
    number: 9, country: "República Dominicana",  countryCode: "DO", flag: "🇩🇴",
    titleEs: "El Taíno Robado",   titleEn: "The Stolen Taíno",
    description: "Body parts, health vocabulary, and the verb doler (me duele/duelen)",
    criminal: "La Mariposa Roja", stolenItem: "El Taíno de Madera",   rotation: -1.8,  themeColor: "#6b4c9b",
  },
  {
    number: 10, country: "Ecuador",              countryCode: "EC", flag: "🇪🇨",
    titleEs: "La Expo del Futuro", titleEn: "The Future Expo",
    description: "Careers, technology, and the future (ir a + infinitivo, simple future)",
    criminal: "El Maestro",       stolenItem: "El Sombrero de Paja",   rotation: 1.5,  themeColor: "#065f46",
  },
];
