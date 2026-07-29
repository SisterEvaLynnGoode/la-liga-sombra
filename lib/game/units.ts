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

export const ROMAN = [
  "I","II","III","IV","V","VI","VII","VIII","IX","X",
  "XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX",
] as const;

export const UNITS: UnitMeta[] = [
  {
    number: 1, country: "México",               countryCode: "MX", flag: "🇲🇽",
    titleEs: "El Misterio del Mariachi Perdido", titleEn: "The Mystery of the Lost Mariachi",
    description: "Greetings, introductions, and numbers",
    criminal: "El Camaleón",      stolenItem: "La Guitarra del Sol",   rotation: -2,    themeColor: "#c0392b",
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
    criminal: "El Técnico Oscuro", stolenItem: "El Sonido del Festival", rotation: -2,    themeColor: "#8b1a1a",
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
  // ── Semester 2: "La Liga Sombra a través del Tiempo" ──
  // Time-travel arc. New antagonist El Cronista steals each culture's treasure
  // from its own era. See docs/SEMESTER_2_CURRICULUM_MAP.md.
  {
    number: 11, country: "Honduras",             countryCode: "HN", flag: "🇭🇳",
    titleEs: "El Misterio de la Estela", titleEn: "The Mystery of the Stela",
    description: "Copán and the Maya Classic era — present-tense -AR/-ER/-IR review and the historical present",
    criminal: "El Cronista",      stolenItem: "El Glifo de Copán",     rotation: -2.2, themeColor: "#2f6f4f",
  },
  {
    number: 12, country: "Guatemala",            countryCode: "GT", flag: "🇬🇹",
    titleEs: "La Máscara de Jade", titleEn: "The Jade Mask",
    description: "Tikal and the Maya astronomers — SER vs. ESTAR (description & identity vs. location & state)",
    criminal: "El Cronista",      stolenItem: "La Máscara de Jade",    rotation: 1.8,  themeColor: "#1e6f5c",
  },
  {
    number: 13, country: "El Salvador",          countryCode: "SV", flag: "🇸🇻",
    titleEs: "La Vasija Pintada", titleEn: "The Painted Vessel",
    description: "Joya de Cerén and Maya village daily life — stem-changing verbs (e→ie, o→ue, e→i)",
    criminal: "El Cronista",      stolenItem: "La Vasija Pintada",     rotation: -1.4, themeColor: "#3f6f7f",
  },
  {
    number: 14, country: "Nicaragua",           countryCode: "NI", flag: "🇳🇮",
    titleEs: "El Manuscrito de Darío", titleEn: "Darío's Manuscript",
    description: "León in 1907 and the return of Rubén Darío — gustar, encantar and indirect object pronouns",
    criminal: "El Cronista",      stolenItem: "El Manuscrito de Darío", rotation: 2.1, themeColor: "#6b4c9b",
  },
  {
    number: 15, country: "Cuba",                countryCode: "CU", flag: "🇨🇺",
    titleEs: "El Disco Maestro", titleEn: "The Master Record",
    description: "Havana in 1954 and the mambo — direct and indirect object pronouns together (me lo, se la)",
    criminal: "El Cronista",      stolenItem: "El Disco Maestro",      rotation: -2.4, themeColor: "#b8860b",
  },
];
