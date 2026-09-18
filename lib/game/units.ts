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
  "XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX",
  "XXXI","XXXII",
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
  // ── "La Última Estación" — the Casos 16-20 season ──
  // Same time-travel arc, but from here the student is in a faction chosen by
  // how Operación Reloj de Arena ended. See lib/season/factions.ts.
  {
    number: 16, country: "Uruguay",             countryCode: "UY", flag: "🇺🇾",
    titleEs: "El Balón de la Final", titleEn: "The Final's Ball",
    description: "Montevideo 1930 and the first World Cup — reflexive verbs and daily routine",
    criminal: "El Cronista",      stolenItem: "El Balón de la Final",  rotation: 1.9,  themeColor: "#2f7fa8",
  },
  {
    number: 17, country: "Panamá",              countryCode: "PA", flag: "🇵🇦",
    titleEs: "Los Planos del Ingeniero", titleEn: "The Engineer's Blueprints",
    description: "The Canal opening in 1914 — comparatives, superlatives and demonstratives",
    criminal: "El Cronista",      stolenItem: "Los Planos del Ingeniero", rotation: -1.7, themeColor: "#0f6f6f",
  },
  {
    number: 18, country: "Paraguay",            countryCode: "PY", flag: "🇵🇾",
    titleEs: "El Patrón de Ñandutí", titleEn: "The Ñandutí Pattern",
    description: "Itauguá, the harp and spiderweb lace — affirmative tú commands as how-to instructions",
    criminal: "El Cronista",      stolenItem: "El Patrón de Ñandutí",  rotation: 2.3,  themeColor: "#8b3a62",
  },
  {
    number: 19, country: "Venezuela",           countryCode: "VE", flag: "🇻🇪",
    titleEs: "El Mapa del Explorador", titleEn: "The Explorer's Map",
    description: "The 1937 Angel Falls expedition — gentle introduction to the preterite (fue, llegó, vio, tuvo)",
    criminal: "El Cronista",      stolenItem: "El Mapa del Explorador", rotation: -2.0, themeColor: "#3f7f3f",
  },
  {
    number: 20, country: "Bolivia",             countryCode: "BO", flag: "🇧🇴",
    titleEs: "La Clave de la Puerta del Sol", titleEn: "The Sun Gate Keystone",
    description: "Tiwanaku and Lake Titicaca — the imperfect (era, había, tenía) against the preterite",
    criminal: "El Cronista",      stolenItem: "La Clave de la Puerta del Sol", rotation: 1.6, themeColor: "#7a5c2e",
  },
  // ── Chapter 3 · Arc A, "El Expediente Cronista": reopened case files ──
  {
    number: 21, country: "México", countryCode: "MX", flag: "🇲🇽",
    titleEs: "El Primer Expediente", titleEn: "The First Case File",
    description: "Guadalajara reopened — the regular preterite (llegó, tomó, salió)",
    criminal: "El Que Abrió la Puerta", stolenItem: "La Guitarra del Sol", rotation: -1.8, themeColor: "#c0392b",
  },
  {
    number: 22, country: "España", countryCode: "ES", flag: "🇪🇸",
    titleEs: "La Sala Vacía", titleEn: "The Empty Gallery",
    description: "The Prado, room fourteen — the irregular preterite (fue, hizo, tuvo, dijo, vino, puso)",
    criminal: "El Guardia de la Noche", stolenItem: "Pintura de Velázquez", rotation: 1.4, themeColor: "#9b2226",
  },
  {
    number: 23, country: "Perú", countryCode: "PE", flag: "🇵🇪",
    titleEs: "Como Era Antes", titleEn: "How It Used to Be",
    description: "Cusco — the imperfect: routines and descriptions (era, había, tenía, iba)",
    criminal: "La Que Marcó las Piedras", stolenItem: "El Tesoro Inca", rotation: -1.2, themeColor: "#b45309",
  },
  {
    number: 24, country: "Chile", countryCode: "CL", flag: "🇨🇱",
    titleEs: "Mientras Cantaba", titleEn: "While She Was Singing",
    description: "Viña del Mar — preterite vs imperfect: the background and the interruption",
    criminal: "El Técnico del Segundo Turno", stolenItem: "El Trofeo del Festival", rotation: 2.0, themeColor: "#8b1a1a",
  },
  {
    number: 25, country: "Cuba", countryCode: "CU", flag: "🇨🇺",
    titleEs: "Se Lo Pidió Dos Veces", titleEn: "He Asked Twice",
    description: "Havana 1954 — preterite vs imperfect with double object pronouns",
    criminal: "La Voz del Estudio", stolenItem: "El Disco Maestro", rotation: -2.2, themeColor: "#b8860b",
  },
  {
    number: 26, country: "Guinea Ecuatorial", countryCode: "GQ", flag: "🇬🇶",
    titleEs: "El País Número Veintiuno", titleEn: "The Twenty-First Country",
    description: "Malabo — the present perfect (ha llegado) and commands",
    criminal: "El Que Esperaba en Malabo", stolenItem: "La Entrega que Nunca Llegó", rotation: 1.7, themeColor: "#2f6b4f",
  },
  // ── Chapter 3 · Arc B, "La Colección": the Spanish-speaking United States ──
  {
    number: 27, country: "Estados Unidos", countryCode: "US", flag: "🇺🇸",
    titleEs: "La Pared que Faltaba", titleEn: "The Missing Wall",
    description: "Los Ángeles, Chicano — the simple future (cambiará, volverá)",
    criminal: "La Curadora", stolenItem: "Un Fragmento del Mural", rotation: -1.6, themeColor: "#c2410c",
  },
  {
    number: 28, country: "Estados Unidos", countryCode: "US", flag: "🇺🇸",
    titleEs: "La Cinta del Café", titleEn: "The Tape from the Cafe",
    description: "Nueva York, Nuyorican — the conditional (sería, haría)",
    criminal: "La Curadora", stolenItem: "La Cinta del Poeta", rotation: 1.3, themeColor: "#1d4e89",
  },
  {
    number: 29, country: "Estados Unidos", countryCode: "US", flag: "🇺🇸",
    titleEs: "Por Amor y Para la Familia", titleEn: "Out of Love and For the Family",
    description: "San Antonio, Tejano — por vs para and comparisons",
    criminal: "La Curadora", stolenItem: "El Acordeón de Don Nica", rotation: -2.0, themeColor: "#7c2d12",
  },
  {
    number: 30, country: "Estados Unidos", countryCode: "US", flag: "🇺🇸",
    titleEs: "Ojalá que Vuelva", titleEn: "I Hope It Comes Back",
    description: "Miami, Cubano — the subjunctive of wishes and emotion (ojalá que, espero que)",
    criminal: "La Curadora", stolenItem: "La Cafetera y la Libreta", rotation: 1.9, themeColor: "#0e7490",
  },
  {
    number: 31, country: "Estados Unidos", countryCode: "US", flag: "🇺🇸",
    titleEs: "El Que Todavía Dice Truje", titleEn: "The One Who Still Says Truje",
    description: "Nuevo México, Hispano — the subjunctive of doubt (no creo que, dudo que)",
    criminal: "La Curadora", stolenItem: "La Grabación del Anciano", rotation: -1.4, themeColor: "#a16207",
  },
  {
    number: 32, country: "Estados Unidos", countryCode: "US", flag: "🇺🇸",
    titleEs: "Aquí Se Inventó", titleEn: "It Was Invented Here",
    description: "Chicago, Mexicano y Boricua — the impersonal and passive se (se inventó, se hizo)",
    criminal: "La Curadora", stolenItem: "La Receta del Jibarito", rotation: 2.2, themeColor: "#991b1b",
  },
];
