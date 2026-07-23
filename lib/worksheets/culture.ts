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
  9: {
    theme: "Taíno Heritage & Dominican Music (Dominican Republic)",
    reading: {
      products:
        "Before Europeans arrived, the Taíno people lived on the island of La Española (today the Dominican Republic and Haiti). They carved wooden and stone figures called cemíes, used in healing and ceremonies. Today the Dominican Republic is also famous for its music: el merengue and la bachata, both born on this island.",
      practices:
        "Taíno healers used cemíes and natural medicine (la medicina natural) to care for the body. Many Taíno words survive in everyday Spanish — hamaca (hammock), huracán (hurricane), and barbacoa (barbecue). Dominicans love to gather for music and dancing, especially merengue, which has a fast, happy rhythm.",
      perspectives:
        "Honoring Taíno heritage keeps the island's first peoples present, even centuries later. Caring for the body and community — through healing traditions and through joyful music and dance — reflects a value of resilience and togetherness that runs deep in Dominican culture.",
    },
    comprehension: [
      { question: "What were the Taíno carved figures called?", answer: "cemíes" },
      { question: "Name one type of music born in the Dominican Republic.", answer: "merengue or bachata" },
      { question: "Name one everyday Spanish word that comes from Taíno.", answer: "hamaca, huracán, or barbacoa" },
      { question: "What island do the Dominican Republic and Haiti share?", answer: "La Española (Hispaniola)" },
    ],
    compara:
      "What traditions in your culture help people stay healthy or bring the community together? Write 2–3 sentences comparing them to Dominican healing and music. Use at least two Spanish words.",
    project: {
      title: "Cartel de Salud / Health Poster — El Cuerpo",
      brief:
        "Make a labeled diagram of the human body (el cuerpo) for a clinic. Label at least 8 body parts in Spanish, and write 3 sentences using doler (Me duele…, Me duelen…). Add one Taíno-inspired healing tip.",
      materials: "This sheet, pencil; you may sketch a simple body outline.",
      checklist: [
        "At least 8 body parts labeled in Spanish",
        "3 sentences using doler (me duele / me duelen)",
        "One healing or wellness tip",
        "Neat, clinic-style labels",
      ],
    },
    teacherNote:
      "Pairs with the Unit 9 body/health vocab and doler. ~40 min. Play a short merengue clip as students label their body diagram. Students practice 'me duele/duelen' by miming an ailment for a partner to describe.",
  },
  10: {
    theme: "The Panama Hat & the Galápagos (Ecuador)",
    reading: {
      products:
        "The famous 'Panama hat' is actually made in Ecuador, woven by hand from toquilla straw (paja toquilla), especially in the town of Montecristi. The finest ones take months to weave. Ecuador is also home to las Islas Galápagos, the islands where Charles Darwin studied evolution — full of giant tortoises and unique wildlife.",
      practices:
        "Master weavers (los tejedores) pass the toquilla craft from generation to generation. Ecuador is a leader in protecting nature: the Galápagos are a national park, and the country was one of the first to give rights to nature in its constitution. Ecuadorians blend ancient Andean traditions with a forward-looking focus on technology and the environment.",
      perspectives:
        "Ecuador shows that the future (el futuro) and tradition can grow together — a hand-woven hat and a tech expo in the same city. Protecting the Galápagos and honoring craftspeople reflect a value of caring for both heritage and the planet for the generations to come.",
    },
    comprehension: [
      { question: "Where is the 'Panama hat' really made?", answer: "Ecuador (especially Montecristi)" },
      { question: "What straw is used to weave the hats?", answer: "paja toquilla (toquilla straw)" },
      { question: "What famous islands belong to Ecuador?", answer: "las Islas Galápagos" },
      { question: "Which scientist studied evolution in the Galápagos?", answer: "Charles Darwin" },
    ],
    compara:
      "What is a traditional craft from your culture, and how might it survive into the future? Write 2–3 sentences. Use the future in Spanish at least once (voy a… or seré…).",
    project: {
      title: "Mi Futuro / My Future — Career & Goal Card",
      brief:
        "Create a 'future' card about yourself. Draw your future career and write 4 sentences about your plans using the future tense (Voy a…, Seré…, Tendré…, El año que viene…). Include one goal (mi meta) and one dream (mi sueño).",
      materials: "This sheet, pencil.",
      checklist: [
        "Your future career drawn or named in Spanish",
        "4 sentences using the future (ir a + inf. or simple future)",
        "One goal (mi meta) and one dream (mi sueño)",
        "Neat and clearly written",
      ],
    },
    teacherNote:
      "Caps Unit 10 (careers + future) and the whole semester. ~45 min. A natural bridge to the Capstone — these 'My Future' cards make a great gallery and rehearse the future tense students will use to present. Show a 2-minute Galápagos clip first.",
  },
  11: {
    theme: "Copán y la Escritura Maya (Honduras)",
    reading: {
      products:
        "In western Honduras stand the ruins of Copán, a Maya city that flourished for centuries. Its most famous monument is the Escalinata de los Jeroglíficos (the Hieroglyphic Stairway) — about 63 steps carved with more than 2,000 glyph blocks. It is the longest Maya inscription ever found. Copán is also known for its estelas: tall carved stones showing portraits of its rulers, and for its altars, jade ornaments, and the brilliant green feathers of the quetzal bird.",
      practices:
        "The Maya had a complete writing system — glyphs could stand for whole words or for sounds, the way our letters do. Escribas (scribes) trained for years to carve and paint them. They recorded the names of rulers, the dates of important events, and the history of the dynasty. The Maya also used a base-20 number system, understood the concept of zero, and kept a remarkably precise calendar. Today Copán is a UNESCO World Heritage Site, and the Ch'orti' Maya still live in the region.",
      perspectives:
        "For the Maya, writing was memory. Carving a ruler's story into stone kept that person present long after they died, and it proved the dynasty's right to rule. That is why a single stolen glyph matters so much: it isn't just decoration, it is a piece of a people's record of themselves. Honduras treats Copán as national patrimony — a shared inheritance that belongs to everyone, not to any collector.",
    },
    comprehension: [
      { question: "What is the Escalinata de los Jeroglíficos famous for?", answer: "It is the longest Maya inscription ever found (about 63 steps, 2,000+ glyphs)" },
      { question: "What is an estela?", answer: "A tall carved stone showing a portrait of a ruler" },
      { question: "What was the job of an escriba?", answer: "To carve and paint glyphs recording rulers, dates, and history" },
      { question: "True or false: the Maya had no symbol for zero.", answer: "False — they understood and used zero" },
    ],
    compara:
      "The Maya carved their history into stone so it would last. How does your family, school, or community record what matters to it — photos, yearbooks, murals, social media? Write 2–3 sentences comparing it to a Maya estela. Use at least two Spanish words from this unit.",
    project: {
      title: "Diseña tu Estela / Design Your Own Stela",
      brief:
        "Design a stela that records something important about YOU or your community. Draw your own glyph-style symbols (they don't have to be real Maya glyphs), then label at least 6 of them in Spanish. At the bottom, write one sentence in the present tense explaining what your stela records — for example, 'Mi estela cuenta la historia de mi familia.'",
      materials: "This sheet, pencil, optional colored pencils (labels must stay readable in pencil).",
      checklist: [
        "At least 6 symbols labeled in Spanish",
        "One sentence in the present tense (Mi estela cuenta…)",
        "At least one -AR, one -ER, and one -IR verb used somewhere on the sheet",
        "Neat, clearly labeled, and readable",
      ],
    },
    teacherNote:
      "Run after Caso 11's game + vocab days. ~35–45 min. Read the three P's aloud or in pairs, do the comprehension, then the estela. This is the semester's first culture day, so connect it to the new time-travel frame: El Cronista steals treasures BEFORE they become patrimony — the 'perspectives' paragraph explains exactly why that's the harm. Ties back to grammar: the estela sentence must be in the present tense (the historical present students used all unit). Makes a strong hallway display next to the Unit 1 ofrendas.",
  },
};

export function getCultureLesson(unitNumber: number): CultureLesson | null {
  return CULTURE[unitNumber] ?? null;
}
