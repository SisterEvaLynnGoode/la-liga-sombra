/**
 * Per-unit culture content for the printable "Culture File" worksheet.
 *
 * Hand-authored per country, built on ACTFL's three P's:
 *   - Products   (what a culture makes — food, art, objects)
 *   - Practices  (what a culture does — customs, daily life)
 *   - Perspectives (why — the values and beliefs behind them)
 *
 * Readings are written in English with the unit's Spanish terms woven in —
 * the right level for Novice learners. The activities ask students to PRODUCE
 * Spanish and to compare cultures, which is where the real learning happens.
 *
 * Plain text only, so it prints clean in black and white.
 */

export interface CultureComprehension {
  question: string;
  answer: string;
}

export interface CultureProject {
  title: string;
  brief: string;
  materials: string;
  checklist: string[];
}

export interface CultureLesson {
  /** The cultural theme, e.g. "Día de los Muertos" */
  theme: string;
  reading: {
    products: string;
    practices: string;
    perspectives: string;
  };
  comprehension: CultureComprehension[];
  /** Compare-to-your-own-culture reflection prompt (open response) */
  compara: string;
  project: CultureProject;
  /** Teacher-facing guidance for running the culture day */
  teacherNote: string;
}

export const CULTURE: Record<number, CultureLesson> = {
  1: {
    theme: "Día de los Muertos (Mexico)",
    reading: {
      products:
        "On el Día de los Muertos (the Day of the Dead), families build an altar called an ofrenda. They decorate it with bright orange marigolds (cempasúchil), candles (velas), sugar skulls (calaveras de azúcar), and a sweet bread called pan de muerto. They also place photos of family members who have died.",
      practices:
        "On November 1 and 2, families gather to remember their loved ones. They clean and decorate graves, share food, tell stories, and sometimes play music. It is a celebration, not a sad day — families welcome the spirits of their relatives back for a visit.",
      perspectives:
        "For many Mexicans, death is a natural part of life, not something to fear. The holiday shows that remembering and honoring family — la familia — keeps loved ones present. The bright colors and food celebrate life as much as they remember death.",
    },
    comprehension: [
      { question: "What is the altar called?", answer: "ofrenda" },
      { question: "Name one flower used to decorate it.", answer: "cempasúchil (marigold)" },
      { question: "On what dates is the holiday celebrated?", answer: "November 1 and 2" },
      { question: "True or false: Día de los Muertos is a sad, scary holiday.", answer: "False — it is a celebration of life and memory" },
    ],
    compara:
      "How does your family or culture remember people who have died? Write 2–3 sentences comparing it to el Día de los Muertos. Use at least two Spanish words.",
    project: {
      title: "Diseña una Ofrenda / Design an Ofrenda",
      brief:
        "Draw and label an ofrenda for someone you admire (a real person, a hero, or a fictional detective). Label at least 6 items in Spanish (la foto, las velas, las flores, el pan, las calaveras, la comida).",
      materials: "This sheet, pencil, optional colored pencils (the labels must still be readable in pencil).",
      checklist: [
        "At least 6 items labeled in Spanish",
        "A photo or drawing of the person honored",
        "One sentence in Spanish explaining who they are (Es…)",
        "Neat and clearly labeled",
      ],
    },
    teacherNote:
      "Run after Unit 1's game + vocab days. ~30–40 min. Read the three P's aloud or in pairs, do the comprehension, then the ofrenda. Great hallway display. Tie back to the unit: students introduce their honored person using 'Se llama…' and 'Es de…'.",
  },
  2: {
    theme: "School Life in Puerto Rico",
    reading: {
      products:
        "Students in Puerto Rico use many of the same school supplies you do: la mochila (backpack), el cuaderno (notebook), el lápiz (pencil), and la computadora. Many schools require uniforms (uniformes). Classrooms have una pizarra (whiteboard) and often un proyector.",
      practices:
        "The school day (el día escolar) usually runs from morning until mid-afternoon. Classes are taught in Spanish, and English (inglés) is a required subject because Puerto Rico has strong ties to the United States. Students often greet teachers formally.",
      perspectives:
        "Puerto Rico is a territory of the United States, so most people are bilingual — they value both español and inglés. Being bilingual is seen as an advantage and a source of pride, connecting students to two cultures at once.",
    },
    comprehension: [
      { question: "Name two school supplies in Spanish.", answer: "any two: la mochila, el cuaderno, el lápiz, la computadora, etc." },
      { question: "What required subject connects Puerto Rico to the US?", answer: "inglés (English)" },
      { question: "What word describes someone who speaks two languages?", answer: "bilingual / bilingüe" },
      { question: "True or false: Most people in Puerto Rico speak only one language.", answer: "False — most are bilingual" },
    ],
    compara:
      "Compare a school day in Puerto Rico to your own. Write 2–3 sentences: what is the same, what is different? Use at least three school-supply words in Spanish.",
    project: {
      title: "Mi Día Escolar / My School Day — Comparison Chart",
      brief:
        "Make a T-chart or Venn diagram comparing your school day to a school day in Puerto Rico. Label your backpack with at least 6 supplies in Spanish, and write 3 sentences describing your day (Yo estudio…, Yo uso…).",
      materials: "This sheet, pencil, ruler for the chart.",
      checklist: [
        "T-chart or Venn diagram with both sides filled",
        "At least 6 supplies labeled in Spanish",
        "3 sentences about your day using -AR verbs",
        "At least one similarity and one difference noted",
      ],
    },
    teacherNote:
      "Reinforces Unit 2 -AR verbs and classroom vocab. ~35 min. Students love comparing uniforms and schedules. Have a few share their charts aloud using 'Yo estudio…' and 'Yo uso…'.",
  },
  3: {
    theme: "Madrid & the Prado Museum (Spain)",
    reading: {
      products:
        "Madrid, the capital of España, is full of famous places: la Puerta del Sol (a main square), el Parque del Retiro (a huge park), and el Museo del Prado, one of the greatest art museums in the world. The Prado holds paintings by Velázquez and Goya.",
      practices:
        "Madrileños (people from Madrid) move around the city by el metro (subway), el autobús, or simply a pie (on foot). People eat dinner late — often after 9 p.m. — and enjoy an evening walk called el paseo. Plazas are the heart of social life.",
      perspectives:
        "Spaniards take great pride in their art and history. Protecting cultural treasures — like the paintings in the Prado — matters deeply. The slower evening pace and shared public spaces show a value of community and enjoying time together.",
    },
    comprehension: [
      { question: "What is the famous art museum in Madrid?", answer: "el Museo del Prado" },
      { question: "Name two ways to get around Madrid in Spanish.", answer: "any two: el metro, el autobús, a pie, el taxi" },
      { question: "What is the evening walk called?", answer: "el paseo" },
      { question: "Name one famous painter whose work is in the Prado.", answer: "Velázquez or Goya" },
    ],
    compara:
      "How do people get around your town compared to Madrid? Write 2–3 sentences using transportation words in Spanish (el autobús, a pie, el coche…).",
    project: {
      title: "La Galería Recuperada / The Recovered Gallery",
      brief:
        "You recovered a famous Spanish painting from the thief! Choose a real artwork (e.g., Las Meninas by Velázquez) and create a museum placard for it: the title, the artist, and 2–3 sentences in simple Spanish describing it (Es un…, Hay…).",
      materials: "This sheet, pencil; you may sketch the artwork or describe it.",
      checklist: [
        "Title and artist of a real Spanish artwork",
        "A sketch or description of the painting",
        "2–3 sentences in Spanish",
        "Written like a real museum placard",
      ],
    },
    teacherNote:
      "Connects to the Unit 3 Madrid map-chase. ~35–40 min. Project a few Prado paintings first. Students practice 'ir' by describing how they would travel to the museum. Placards make a clean gallery-wall display.",
  },
  4: {
    theme: "Pura Vida & Biodiversity (Costa Rica)",
    reading: {
      products:
        "Costa Rica is famous for its rainforests (bosques), national parks (parques nacionales), volcanoes like Volcán Arenal, and amazing wildlife — sloths (perezosos), toucans, and monkeys. Coffee (el café) grown on family farms (fincas) is a major product.",
      practices:
        "Costa Ricans, called ticos, greet each other with 'Pura Vida' — which means 'pure life' and is used for hello, goodbye, thank you, and 'everything's great.' Families are close, and weekends often mean time outdoors with la familia.",
      perspectives:
        "Costa Rica protects more than 25% of its land as parks and has no army — it invests in education and the environment instead. 'Pura Vida' reflects a value of gratitude, calm, and appreciating the natural world and family over rushing or stress.",
    },
    comprehension: [
      { question: "What greeting means 'pure life'?", answer: "Pura Vida" },
      { question: "What are people from Costa Rica called?", answer: "ticos" },
      { question: "Name one animal found in Costa Rica.", answer: "perezoso (sloth), toucan, or monkey" },
      { question: "What major product grows on family fincas?", answer: "el café (coffee)" },
    ],
    compara:
      "Is there a phrase in your culture like 'Pura Vida' that captures a way of living? Write 2–3 sentences comparing it. Use at least two Spanish words.",
    project: {
      title: "Folleto Pura Vida / Pura Vida Eco-Brochure",
      brief:
        "Design a fold-able travel brochure inviting tourists to an eco-lodge in Costa Rica. Include the name, 3 activities, and at least 5 nature words in Spanish. Add one sentence using ser or estar to describe the place (El lugar es… / está…).",
      materials: "This sheet (fold in thirds) or a separate paper, pencil.",
      checklist: [
        "A name and a slogan (you may use 'Pura Vida')",
        "3 activities a tourist can do",
        "At least 5 nature words labeled in Spanish",
        "One sentence using ser or estar",
      ],
    },
    teacherNote:
      "Pairs with Unit 4 family/emotions and ser-vs-estar. ~40 min. Show a 2-minute Costa Rica nature clip first. Students practice estar for location ('El lago está…') and ser for description.",
  },
  5: {
    theme: "Mate & Buenos Aires (Argentina)",
    reading: {
      products:
        "Argentina is known for mate, a traditional tea drunk from a hollow gourd (la calabaza) through a metal straw (la bombilla). Other famous products are dulce de leche (a sweet caramel spread) and tango music. Buenos Aires, the capital, is a huge, lively city.",
      practices:
        "Mate is shared — one person prepares it and passes the same gourd around a circle of friends or family. This sharing happens daily, at home, school, or work. Argentines also eat dinner very late and love to gather for long meals and conversation.",
      perspectives:
        "Sharing mate is about community and trust — drinking from the same gourd shows friendship. Argentine culture, shaped by European immigration, values connection, hospitality, and taking time to be together rather than rushing.",
    },
    comprehension: [
      { question: "What traditional drink is shared from a gourd?", answer: "mate" },
      { question: "What is the metal straw called?", answer: "la bombilla" },
      { question: "Name the sweet caramel spread.", answer: "dulce de leche" },
      { question: "What does sharing mate show?", answer: "friendship / community / trust" },
    ],
    compara:
      "What food or drink does your family or culture share with friends? Write 2–3 sentences comparing it to sharing mate. Use at least two Spanish words.",
    project: {
      title: "Tarjeta de Receta / Recipe Card — Dulce de Leche or Mate",
      brief:
        "Create a recipe or how-to card. Either write the steps to prepare mate (Primero…, Después…) or a simple dulce de leche treat. Use at least 4 food words and number the steps with ordinals (primero, segundo…) where possible.",
      materials: "This sheet, pencil.",
      checklist: [
        "A clear title and ingredient list",
        "At least 4 numbered steps",
        "At least 4 food/drink words in Spanish",
        "Sequence words used (primero, después, etc.)",
      ],
    },
    teacherNote:
      "Connects to Unit 5 numbers/dates and the tener-expressions ('Tengo sed', 'Tengo hambre'). ~35 min. If allowed, a dulce de leche tasting is a memorable hook. Students count ingredients in Spanish.",
  },
  6: {
    theme: "Colombian Cuisine (Colombia)",
    reading: {
      products:
        "Colombian food is rich and regional. Famous dishes include la bandeja paisa (a large mixed platter), el ajiaco (a chicken and potato soup), el sancocho (a hearty stew), and arepas (corn cakes). Colombia also grows some of the world's best coffee (el café) and tropical fruits like la guanábana and el mango.",
      practices:
        "The main meal of the day is almuerzo (lunch), often eaten with family. Different regions have their own signature dishes, and markets overflow with fresh fruits and vegetables. Sharing a meal is an important social moment.",
      perspectives:
        "Food is a source of regional identity and pride in Colombia — a person from the coast eats differently than someone from the mountains. Meals bring family together, and offering food to guests is a key sign of hospitality and warmth.",
    },
    comprehension: [
      { question: "Name one traditional Colombian dish.", answer: "any: bandeja paisa, ajiaco, sancocho, arepas" },
      { question: "What is the main meal of the day called?", answer: "el almuerzo (lunch)" },
      { question: "What world-famous product does Colombia grow?", answer: "el café (coffee)" },
      { question: "Name one tropical fruit in Spanish.", answer: "el mango, la guanábana, la papaya, la piña, el banano" },
    ],
    compara:
      "What is a signature dish from your family or region? Write 2–3 sentences comparing it to a Colombian dish. Use at least three food words in Spanish.",
    project: {
      title: "Mi Receta Colombiana / My Colombian Recipe Card",
      brief:
        "Create a recipe card for a Colombian dish (arepas are simple and great). List the ingredients in Spanish, number the steps, and write one sentence using a stem-changing verb (Yo quiero…, Puedes…, Prefiero…).",
      materials: "This sheet, pencil.",
      checklist: [
        "Dish name and ingredient list in Spanish",
        "At least 4 numbered steps",
        "At least 5 food words in Spanish",
        "One sentence with a stem-changing verb",
      ],
    },
    teacherNote:
      "Pairs perfectly with the Unit 6 food vocab and stem-changers. ~40 min. An arepa or empanada tasting makes it unforgettable. Students use 'querer' and 'preferir' to describe what they'd order.",
  },
  7: {
    theme: "Festival de Viña del Mar & Music (Chile)",
    reading: {
      products:
        "Chile hosts the Festival de Viña del Mar, one of the biggest music festivals in Latin America, held each February by the coast. Chile's geography is dramatic — the Andes mountains (los Andes) on one side and the Pacific beaches (la playa) on the other. Traditional music includes the cueca, the national dance.",
      practices:
        "At the festival, the audience is so important it has a nickname: 'el monstruo' (the monster). Fans cheer, demand encores, and can make or break a performance. Chileans gather for concerts, festivals (festivales), and outdoor events, especially in el verano (summer).",
      perspectives:
        "The arts — music, dance, poetry — are a deep source of national pride in Chile (home of poets like Pablo Neruda). Festivals bring communities together and celebrate both international stars and Chilean traditions, showing that culture belongs to everyone.",
    },
    comprehension: [
      { question: "What famous music festival is held in Chile?", answer: "Festival de Viña del Mar" },
      { question: "What is the festival audience nicknamed?", answer: "el monstruo (the monster)" },
      { question: "Name the mountain range and the coast in Spanish.", answer: "los Andes and la playa" },
      { question: "In what season is the festival held?", answer: "el verano (summer — February in Chile)" },
    ],
    compara:
      "What music event or festival matters in your community? Write 2–3 sentences comparing it to the Festival de Viña del Mar. Use at least two Spanish words.",
    project: {
      title: "Cartel del Festival / Festival Poster",
      brief:
        "Design a poster for a music festival in a Spanish-speaking country. Include the festival name, the date (in Spanish), at least 3 acts, and the weather you'd expect (Hace sol, Hace calor…). Make it eye-catching in black and white.",
      materials: "This sheet or a separate paper, pencil.",
      checklist: [
        "Festival name and a date written in Spanish",
        "At least 3 performers or acts listed",
        "Weather described in Spanish (hace…)",
        "A bold, clear poster layout",
      ],
    },
    teacherNote:
      "Connects to Unit 7 arts/entertainment vocab, weather, and ordinals (the lineup order). ~40 min. Play a short clip of a Viña del Mar performance. Students order acts using ordinals (primero, segundo…).",
  },
  8: {
    theme: "Andean Markets & Cusco (Peru)",
    reading: {
      products:
        "In Peru, the Mercado de San Pedro in Cusco overflows with products: quinoa, fresh fruits, spices (especias), and colorful alpaca textiles. Near Cusco sits Machu Picchu, the famous Inca city in the Andes. Many Peruvians speak both español and Quechua, the Inca language.",
      practices:
        "At the market (el mercado), buying and selling often involves friendly bargaining — asking the price and negotiating. Vendors arrange their puestos (stalls) with care. Markets are social hubs where neighbors meet, not just places to shop.",
      perspectives:
        "Peru honors its Indigenous and Inca heritage. Keeping the Quechua language, traditional weaving, and ancient foods like quinoa alive shows deep respect for ancestors and history. The market is a living link between the modern day and a thousand-year-old culture.",
    },
    comprehension: [
      { question: "What famous market is in Cusco?", answer: "el Mercado de San Pedro" },
      { question: "What ancient Inca city is near Cusco?", answer: "Machu Picchu" },
      { question: "Besides Spanish, what language do many Peruvians speak?", answer: "Quechua" },
      { question: "What often happens when buying at the market?", answer: "bargaining / negotiating the price" },
    ],
    compara:
      "How is shopping at a market different from shopping where you live? Write 2–3 sentences comparing them. Use at least two market words in Spanish.",
    project: {
      title: "En el Mercado / At the Market — Role-Play Script",
      brief:
        "Write a short market dialogue between a buyer (comprador) and a seller (vendedor). Include a greeting, asking the price (¿Cuánto cuesta?), bargaining, and a goodbye. Use at least 5 market/food words and at least one preterite verb (compré, llegué…). Be ready to act it out with a partner.",
      materials: "This sheet, pencil, a partner to perform with.",
      checklist: [
        "A greeting and a goodbye in Spanish",
        "Asking and answering a price",
        "At least 5 market/food words in Spanish",
        "At least one preterite verb",
        "Ready to perform aloud",
      ],
    },
    teacherNote:
      "Caps Unit 8 (market vocab + preterite). ~40–45 min. The role-play doubles as light interpersonal speaking practice and a bridge to the Unit's presentation milestone. Have pairs perform 2–3 in front of the class.",
  },
};

export function getCultureLesson(unitNumber: number): CultureLesson | null {
  return CULTURE[unitNumber] ?? null;
}
