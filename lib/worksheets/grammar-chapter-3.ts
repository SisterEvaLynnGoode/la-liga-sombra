/**
 * Chapter 3 grammar lessons — the HQ paper day for Casos 21-32 (Spanish 2).
 *
 * Same shape as the Casos 1-15 lessons in grammar.ts and merged into GRAMMAR
 * there; kept in its own file only so that one does not double in length.
 *
 * Arc A (21-26) is the past-tense system, taught through reopened case files.
 * Arc B (27-32) is the Spanish-speaking United States. Its one standing rule,
 * from docs/CHAPTER_3B_USA_CURRICULUM_MAP.md, holds on paper too: regional
 * speech (órale, chévere, asere, truje, asina) is introduced as information
 * about where a speaker is from, never as an error to correct.
 *
 * Drill answers are single words or short chunks because the first drill set
 * also becomes the "Crack the Code" word bank.
 */

import type { GrammarLesson } from "./grammar";

export const GRAMMAR_CHAPTER_3: Record<number, GrammarLesson> = {
  21: {
    title: "The Preterite I — Regular Verbs (llegó, comió, salió)",
    briefing:
      "El Cronista won't talk, so you are rebuilding the night from the witnesses. Finished actions — things that happened once, at a moment, and ended — go in the PRETERITE. Regular -AR verbs take -é, -aste, -ó, -amos, -aron. -ER and -IR verbs share one set: -í, -iste, -ió, -imos, -ieron. The accents are not decoration: hablo means 'I speak', habló means 'he spoke'. One stressed syllable is the difference between a witness and a suspect. Watch the YO form of -car, -gar and -zar verbs: toqué, llegué, empecé — the spelling changes to keep the sound. Sequence words keep the report in order (primero, después, por fin), and time words anchor it (ayer, anoche, la semana pasada).",
    examples: [
      { es: "Anoche Don Rodrigo cerró el salón a las diez.", en: "Last night Don Rodrigo closed the hall at ten." },
      { es: "Primero limpió el escenario. Después salió por la puerta de atrás.", en: "First he cleaned the stage. Then he left through the back door." },
      { es: "Yo llegué tarde y hablé con los músicos.", en: "I arrived late and talked with the musicians." },
    ],
    referenceTable: {
      caption: "Regular preterite — -ER and -IR share one set of endings",
      headers: ["", "hablar (-AR)", "comer (-ER)", "salir (-IR)"],
      rows: [
        ["yo", "hablé", "comí", "salí"],
        ["tú", "hablaste", "comiste", "saliste"],
        ["él / ella / usted", "habló", "comió", "salió"],
        ["nosotros", "hablamos", "comimos", "salimos"],
        ["ellos / ustedes", "hablaron", "comieron", "salieron"],
      ],
    },
    drills: [
      { prompt: "Anoche Don Rodrigo ____ el salón a las diez. (cerrar)", answer: "cerró" },
      { prompt: "Yo ____ al salón a las nueve. (llegar — ¡ojo con la g!)", answer: "llegué" },
      { prompt: "El ayudante ____ por la puerta de atrás. (salir)", answer: "salió" },
      { prompt: "Los músicos ____ hasta medianoche. (tocar)", answer: "tocaron" },
      { prompt: "¿Tú ____ algún ruido? (escuchar)", answer: "escuchaste" },
      { prompt: "Nosotros ____ el informe esta mañana. (escribir)", answer: "escribimos" },
    ],
    secondDrill: {
      title: "Close the Night — Present to Preterite",
      instructions: "Each line is in the present. The night is over: write the verb in the preterite.",
      items: [
        { prompt: "Don Rodrigo limpia el escenario. →", answer: "limpió" },
        { prompt: "Yo hablo con el portero. →", answer: "hablé" },
        { prompt: "Los músicos comen en la cocina. →", answer: "comieron" },
        { prompt: "Tú abres la puerta. →", answer: "abriste" },
        { prompt: "Nosotros volvemos a la agencia. →", answer: "volvimos" },
      ],
    },
  },

  22: {
    title: "The Preterite II — Irregular Verbs (fue, hizo, tuvo, dijo)",
    briefing:
      "The Prado job is told almost entirely in irregular verbs, because the most useful verbs in Spanish are the irregular ones. The good news: they share ONE set of endings, with no accents: -e, -iste, -o, -imos, -ieron. What changes is the stem — hacer → hic- (hizo, with a z), tener → tuv-, estar → estuv-, poder → pud-, poner → pus-, venir → vin-, querer → quis-, saber → sup-. Decir and traer take a J and drop the i in the ellos form: dijeron, trajeron. Ser and ir share the exact same preterite: fue can mean 'he was' or 'he went', and only the sentence tells you which. Dar and ver take -ER endings with no accents: di, dio · vi, vio.",
    examples: [
      { es: "El tercer guardia dijo que fue al almacén.", en: "The third guard said he went to the storeroom." },
      { es: "Tuvo la llave, pero no estuvo en su puesto.", en: "He had the key, but he wasn't at his post." },
      { es: "¿Qué hiciste esa noche? — Vine al museo y puse la copia en el marco.", en: "What did you do that night? — I came to the museum and put the copy in the frame." },
    ],
    referenceTable: {
      caption: "New stem + the shared endings -e, -iste, -o, -imos, -ieron",
      headers: ["Infinitivo", "yo", "él / ella", "ellos"],
      rows: [
        ["ser / ir", "fui", "fue", "fueron"],
        ["hacer", "hice", "hizo", "hicieron"],
        ["tener", "tuve", "tuvo", "tuvieron"],
        ["estar", "estuve", "estuvo", "estuvieron"],
        ["poder", "pude", "pudo", "pudieron"],
        ["poner", "puse", "puso", "pusieron"],
        ["venir", "vine", "vino", "vinieron"],
        ["decir", "dije", "dijo", "dijeron"],
        ["traer", "traje", "trajo", "trajeron"],
      ],
    },
    drills: [
      { prompt: "El guardia ____ que no vio nada. (decir)", answer: "dijo" },
      { prompt: "Yo ____ al museo a las ocho. (ir)", answer: "fui" },
      { prompt: "¿Quién ____ la copia en el marco? (poner)", answer: "puso" },
      { prompt: "Los guardias no ____ abrir el almacén. (poder)", answer: "pudieron" },
      { prompt: "Nosotros ____ la llave toda la noche. (tener)", answer: "tuvimos" },
      { prompt: "¿Qué ____ tú después del robo? (hacer)", answer: "hiciste" },
    ],
    secondDrill: {
      title: "Fue — Was or Went?",
      instructions: "Ser and ir share the same preterite. Write WAS / WERE or WENT for each fue / fueron.",
      items: [
        { prompt: "El robo fue a las dos. →", answer: "was" },
        { prompt: "El guardia fue al almacén. →", answer: "went" },
        { prompt: "Fue una noche muy tranquila. →", answer: "was" },
        { prompt: "Los guardias fueron a la sala catorce. →", answer: "went" },
        { prompt: "Ellos fueron los primeros en llegar. →", answer: "were" },
      ],
    },
  },

  23: {
    title: "The Imperfect — How Things Used to Be (era, había, iba)",
    briefing:
      "In Cusco you are not asking what happened. You are asking what things were LIKE before El Cronista arrived: the routine, the scene, the people. That is the IMPERFECT. Use it for habits (todos los días iba al mercado), descriptions (el sitio era tranquilo), time and age (eran las siete · tenía veinte años) and ongoing states (sabía, conocía, quería). -AR verbs: -aba, -abas, -aba, -ábamos, -aban. -ER and -IR verbs: -ía, -ías, -ía, -íamos, -ían. Only three verbs in the whole tense are irregular: ser (era), ir (iba), ver (veía). Había means both 'there was' and 'there were'. Signal words: siempre, cada día, todos los días, a menudo, normalmente, de niño / de niña.",
    examples: [
      { es: "Antes del robo, el sitio era muy tranquilo.", en: "Before the theft, the site was very quiet." },
      { es: "Doña Aurora iba al mercado todos los días.", en: "Doña Aurora used to go to the market every day." },
      { es: "Por la mañana no había casi nadie.", en: "In the mornings there was almost nobody." },
    ],
    referenceTable: {
      caption: "The imperfect — only ser, ir and ver are irregular",
      headers: ["", "trabajar", "tener", "ser", "ir", "ver"],
      rows: [
        ["yo", "trabajaba", "tenía", "era", "iba", "veía"],
        ["tú", "trabajabas", "tenías", "eras", "ibas", "veías"],
        ["él / ella", "trabajaba", "tenía", "era", "iba", "veía"],
        ["nosotros", "trabajábamos", "teníamos", "éramos", "íbamos", "veíamos"],
        ["ellos", "trabajaban", "tenían", "eran", "iban", "veían"],
      ],
    },
    drills: [
      { prompt: "Antes, el sitio ____ muy tranquilo. (ser)", answer: "era" },
      { prompt: "Los trabajadores ____ a las siete. (llegar)", answer: "llegaban" },
      { prompt: "Doña Aurora ____ al mercado cada día. (ir)", answer: "iba" },
      { prompt: "Por la mañana no ____ casi nadie. (haber)", answer: "había" },
      { prompt: "Los guardias ____ una rutina fija. (tener)", answer: "tenían" },
      { prompt: "De niña, yo ____ en Cusco. (vivir)", answer: "vivía" },
    ],
    secondDrill: {
      title: "Describe the Routine",
      instructions: "Change each verb from the present to the imperfect. You are describing how things USED to be.",
      items: [
        { prompt: "La restauradora trabaja allí. →", answer: "trabajaba" },
        { prompt: "Nadie toca las piedras. →", answer: "tocaba" },
        { prompt: "Nosotros vemos a los guardias. →", answer: "veíamos" },
        { prompt: "Tú conoces el orden de las piedras. →", answer: "conocías" },
        { prompt: "Son las siete de la mañana. →", answer: "Eran" },
      ],
    },
  },

  24: {
    title: "Preterite vs. Imperfect I — The Background and the Interruption",
    briefing:
      "At the Viña del Mar festival everything was happening at once — and then one thing happened. That is the whole contrast in a single sentence: Mientras la cantante CANTABA, alguien ENTRÓ. The IMPERFECT sets the scene: what was going on, what time it was, how things were (cantaba, miraban, eran las once, estaba lleno). The PRETERITE is the event that cuts in: it starts, it ends, it moves the story forward (entró, se apagaron, desapareció). Mientras usually introduces the background; de repente and de pronto announce the interruption. Estaba + -ando / -iendo (estaba cantando) is an even stronger 'was in the middle of'. Think of a film: the imperfect is the camera rolling; the preterite is the cut.",
    examples: [
      { es: "Mientras la cantante cantaba, alguien entró por la puerta de prensa.", en: "While the singer was singing, someone came in through the press door." },
      { es: "Eran las once y el teatro estaba lleno. De repente, se apagaron dos luces.", en: "It was eleven and the theater was full. Suddenly, two lights went out." },
      { es: "El público miraba el escenario cuando el trofeo desapareció.", en: "The audience was watching the stage when the trophy disappeared." },
    ],
    referenceTable: {
      caption: "Which tense? Ask what the verb is DOING in the story",
      headers: ["IMPERFECTO — el fondo", "PRETÉRITO — la acción"],
      rows: [
        ["what was going on: cantaba, miraban", "what happened: entró, gritó"],
        ["time and scene: eran las once, estaba lleno", "a completed event: se apagaron las luces"],
        ["mientras · siempre · normalmente", "de repente · de pronto · a las 11:15"],
        ["estaba cantando (in the middle of)", "empezó · terminó (starts, ends)"],
      ],
    },
    drills: [
      { prompt: "Mientras la cantante ____, alguien entró. (cantar)", answer: "cantaba" },
      { prompt: "Eran las once cuando ____ dos luces. (apagarse)", answer: "se apagaron" },
      { prompt: "El público ____ el escenario. (mirar)", answer: "miraba" },
      { prompt: "De repente, el técnico ____ por la puerta de prensa. (salir)", answer: "salió" },
      { prompt: "El teatro ____ lleno. (estar)", answer: "estaba" },
      { prompt: "A las once y media ____ la canción. (terminar)", answer: "terminó" },
    ],
    secondDrill: {
      title: "Background or Interruption?",
      instructions: "Conjugate BOTH verbs. One is the background (imperfect) and one cuts in (preterite).",
      items: [
        { prompt: "Mientras yo ____ (grabar), ____ (empezar) el ruido.", answer: "grababa · empezó" },
        { prompt: "Los músicos ____ (tocar) cuando la luz ____ (apagarse).", answer: "tocaban · se apagó" },
        { prompt: "____ (ser) las once cuando el técnico ____ (entrar).", answer: "Eran · entró" },
        { prompt: "Nosotros ____ (hablar) cuando ____ (sonar) la alarma.", answer: "hablábamos · sonó" },
        { prompt: "El trofeo ____ (estar) en su sitio, pero de pronto ____ (desaparecer).", answer: "estaba · desapareció" },
      ],
    },
  },

  25: {
    title: "Preterite vs. Imperfect II + Double Object Pronouns in the Past",
    briefing:
      "You are back in the Havana studio, and the question is a chain of hands: who gave the master disc to whom, and when. Two tools you already own now work together. Double object pronouns keep their rules in the past: the person comes before the thing, and le / les become SE in front of lo, la, los, las — Rogelio se lo dio (to her, it). The tenses give the night its shape. The imperfect describes the state everyone was in (estaba cansado, quería irse, el estudio estaba lleno); the preterite lists the handoffs (se lo pidió, se lo dio, nunca se lo devolvió). An action repeated a COUNTED number of times is still preterite: se lo pidió dos veces. The imperfect is for repetition with no count: se lo pedía todos los días.",
    examples: [
      { es: "A las dos y media se lo pidió. Rogelio dijo que no.", en: "At two-thirty she asked him for it. Rogelio said no." },
      { es: "Rogelio estaba cansado y quería irse; por eso se lo dio.", en: "Rogelio was tired and wanted to go home; that's why he gave it to her." },
      { es: "Nunca se lo devolvió.", en: "She never gave it back to him." },
    ],
    referenceTable: {
      caption: "Who · what · and which tense",
      headers: ["Frase", "Pronombres", "Tiempo"],
      rows: [
        ["Se lo pidió dos veces.", "se = a Rogelio · lo = el disco", "PRET — counted, done"],
        ["Se lo pedía todos los días.", "se = a Rogelio · lo = el disco", "IMP — a habit, no count"],
        ["Me la mandó ayer.", "me = a mí · la = la cinta", "PRET — one event"],
        ["Nos los traía los lunes.", "nos = a nosotros · los = los discos", "IMP — every Monday"],
      ],
    },
    drills: [
      { prompt: "La ayudante ____ lo pidió a Rogelio. (a él → ?)", answer: "se" },
      { prompt: "Rogelio ____ cansado esa noche. (estar)", answer: "estaba" },
      { prompt: "A las tres, Rogelio se lo ____. (dar)", answer: "dio" },
      { prompt: "La cinta: Celia me ____ mandó ayer. (¿lo o la?)", answer: "la" },
      { prompt: "Los discos: el ingeniero nos ____ traía cada lunes. (¿lo o los?)", answer: "los" },
      { prompt: "Rogelio ____ irse a casa. (querer)", answer: "quería" },
    ],
    secondDrill: {
      title: "Rewrite the Chain of Hands",
      instructions: "Replace the person AND the thing with pronouns. Keep the verb in the same tense.",
      items: [
        { prompt: "La ayudante pidió el disco a Rogelio. →", answer: "Se lo pidió." },
        { prompt: "Rogelio dio el disco a la ayudante. →", answer: "Se lo dio." },
        { prompt: "Celia mandó la cinta a mí. →", answer: "Me la mandó." },
        { prompt: "El técnico traía los discos a nosotros. →", answer: "Nos los traía." },
        { prompt: "Nadie devolvió la grabación al estudio. →", answer: "Nadie se la devolvió." },
      ],
    },
  },

  26: {
    title: "The Present Perfect + Commands (ha llegado · ¡No lo dejes escapar!)",
    briefing:
      "In Malabo the story is not over — the man on the bench is still waiting — so you need a tense that reaches right up to now: the PRESENT PERFECT. Build it with haber plus a past participle: he, has, ha, hemos, han + -ado (-AR) or -ido (-ER / -IR). Ha esperado tres semanas. Nunca ha hablado con nadie. A few participles are irregular and worth memorizing: hecho, dicho, visto, puesto, vuelto, escrito, abierto. Signal words: ya, todavía no, nunca, alguna vez. Then you run the operation, which means COMMANDS. Formal (usted): take the yo form, drop the -o and switch the vowel — espere, escuche, venga, siga, dígame. Negative tú commands use the same switch plus -s: no salgas, no toques, no vayas, no lo dejes escapar.",
    examples: [
      { es: "El hombre del banco ha esperado tres semanas.", en: "The man on the bench has waited three weeks." },
      { es: "¿Ha hablado con alguien? — No, todavía no ha dicho nada.", en: "Has he talked to anyone? — No, he hasn't said anything yet." },
      { es: "Señora, espere aquí. Y tú, ¡no lo dejes escapar!", en: "Ma'am, wait here. And you — don't let him get away!" },
    ],
    referenceTable: {
      caption: "haber + participle · and the command vowel switch",
      headers: ["haber", "Participio irregular", "Mandato (usted)", "No + tú"],
      rows: [
        ["yo he", "hacer → hecho", "esperar → espere", "salir → no salgas"],
        ["tú has", "decir → dicho", "escuchar → escuche", "tocar → no toques"],
        ["él / ella ha", "ver → visto", "venir → venga", "ir → no vayas"],
        ["nosotros hemos", "poner → puesto", "seguir → siga", "dejar → no dejes"],
        ["ellos han", "escribir → escrito", "decir → dígame", "hablar → no hables"],
      ],
    },
    drills: [
      { prompt: "El hombre ____ esperado tres semanas. (haber)", answer: "ha" },
      { prompt: "Los pescadores lo ____ visto cada mañana. (haber)", answer: "han" },
      { prompt: "Todavía no ha ____ nada. (decir)", answer: "dicho" },
      { prompt: "Nosotros ____ encontrado su banco. (haber)", answer: "hemos" },
      { prompt: "Señor, ____ aquí, por favor. (esperar — usted)", answer: "espere" },
      { prompt: "¡No ____ del puerto! (salir — tú, negativo)", answer: "salgas" },
    ],
    secondDrill: {
      title: "Run the Operation",
      instructions: "Write the command in Spanish. Use USTED with the witnesses and a negative TÚ command with your partner.",
      items: [
        { prompt: "Tell the fisherwoman (usted) to listen. →", answer: "Escuche." },
        { prompt: "Tell the fisherwoman (usted) to come here. →", answer: "Venga aquí." },
        { prompt: "Tell your partner not to touch the bench. →", answer: "No toques el banco." },
        { prompt: "Tell your partner not to go to the beach. →", answer: "No vayas a la playa." },
        { prompt: "Tell the captain (usted) to tell you everything. →", answer: "Dígame todo." },
      ],
    },
  },

  27: {
    title: "The Simple Future — What Will Happen to the Block",
    briefing:
      "In Boyle Heights someone cut a section of mural out of a wall and says it will be 'safer in a box'. The neighbors talk about what will happen next, and so will you. The simple future is the easiest tense in Spanish to build: take the WHOLE infinitive and add -é, -ás, -á, -emos, -án. The same endings work for -AR, -ER and -IR: pintaré, volverá, cubrirán. A small group changes its stem, but the endings never change: hacer → haré, decir → diré, tener → tendré, poder → podré, venir → vendré, salir → saldré, saber → sabré, poner → pondré, and haber → habrá (there will be). In conversation people also say ir a + infinitive (va a cambiar); the simple future sounds firmer, like a promise or a prediction. You will also hear the neighbors say órale, carnal and firme. That is Chicano Spanish from Los Angeles, and it tells you exactly where you are.",
    examples: [
      { es: "Si nadie hace nada, el mural desaparecerá.", en: "If nobody does anything, the mural will disappear." },
      { es: "Mañana pintaremos la pared otra vez.", en: "Tomorrow we will paint the wall again." },
      { es: "¿Habrá mural el año que viene? — Órale, lo haremos juntos.", en: "Will there be a mural next year? — Come on, we'll make it together." },
    ],
    referenceTable: {
      caption: "Whole infinitive + -é, -ás, -á, -emos, -án (irregulars change only the stem)",
      headers: ["", "pintar", "volver", "hacer (har-)", "tener (tendr-)"],
      rows: [
        ["yo", "pintaré", "volveré", "haré", "tendré"],
        ["tú", "pintarás", "volverás", "harás", "tendrás"],
        ["él / ella", "pintará", "volverá", "hará", "tendrá"],
        ["nosotros", "pintaremos", "volveremos", "haremos", "tendremos"],
        ["ellos", "pintarán", "volverán", "harán", "tendrán"],
      ],
    },
    drills: [
      { prompt: "El mural ____ a su pared. (volver)", answer: "volverá" },
      { prompt: "Mañana nosotros ____ la pared. (pintar)", answer: "pintaremos" },
      { prompt: "¿Qué ____ los vecinos? (decir)", answer: "dirán" },
      { prompt: "El barrio ____ sin el mural. (cambiar)", answer: "cambiará" },
      { prompt: "Yo ____ todo lo posible. (hacer)", answer: "haré" },
      { prompt: "____ una fiesta cuando vuelva el mural. (haber)", answer: "Habrá" },
    ],
    secondDrill: {
      title: "From Plan to Promise",
      instructions: "Rewrite each ir a + infinitive in the simple future.",
      items: [
        { prompt: "Voy a pintar el andamio. →", answer: "pintaré" },
        { prompt: "Van a cerrar el taller. →", answer: "cerrarán" },
        { prompt: "Vamos a tener un mural nuevo. →", answer: "tendremos" },
        { prompt: "¿Vas a venir mañana? →", answer: "vendrás" },
        { prompt: "El mural va a ser más grande. →", answer: "será" },
      ],
    },
  },

  28: {
    title: "The Conditional — What Would You Do?",
    briefing:
      "At the café in El Barrio, the only recording of a poem has vanished — a poem that was never written down. Every witness answers the same question differently: ¿qué harías tú? That is the CONDITIONAL, the Spanish 'would'. It is built exactly like the future with a different set of endings: whole infinitive + -ía, -ías, -ía, -íamos, -ían. The irregular stems are the SAME ones you learned for the future: haría, diría, tendría, podría, vendría, saldría, pondría, querría, sabría. Use it for hypotheticals (sin la cinta, nadie oiría el poema), polite requests (¿podría ayudarme?) and advice (en tu lugar, yo iría al café). Nuyorican poets often move between Spanish and English inside one line. That is a skill with a long history in New York — and it is exactly why their voices are worth recording.",
    examples: [
      { es: "Sin esa cinta, nadie oiría la voz del poeta.", en: "Without that tape, nobody would hear the poet's voice." },
      { es: "¿Qué harías tú? — Yo iría al café y preguntaría a todos.", en: "What would you do? — I'd go to the café and ask everyone." },
      { es: "¿Podría usted repetir el verso, por favor?", en: "Could you repeat the line, please?" },
    ],
    referenceTable: {
      caption: "Whole infinitive + -ía — the same irregular stems as the future",
      headers: ["", "recitar", "ir", "hacer (har-)", "decir (dir-)"],
      rows: [
        ["yo", "recitaría", "iría", "haría", "diría"],
        ["tú", "recitarías", "irías", "harías", "dirías"],
        ["él / ella", "recitaría", "iría", "haría", "diría"],
        ["nosotros", "recitaríamos", "iríamos", "haríamos", "diríamos"],
        ["ellos", "recitarían", "irían", "harían", "dirían"],
      ],
    },
    drills: [
      { prompt: "Sin la cinta, nadie ____ el poema. (recordar)", answer: "recordaría" },
      { prompt: "¿Qué ____ tú en mi lugar? (hacer)", answer: "harías" },
      { prompt: "En tu lugar, yo ____ al café. (ir)", answer: "iría" },
      { prompt: "¿____ usted ayudarme? (poder)", answer: "Podría" },
      { prompt: "Los poetas ____ que es un robo. (decir)", answer: "dirían" },
      { prompt: "Nosotros ____ que devolverla. (tener)", answer: "tendríamos" },
    ],
    secondDrill: {
      title: "Say It the Hypothetical Way",
      instructions: "Complete each sentence with the conditional of the verb in parentheses.",
      items: [
        { prompt: "En tu lugar, yo ____ a los poetas. (llamar)", answer: "llamaría" },
        { prompt: "Con más tiempo, nosotros ____ el poema de memoria. (aprender)", answer: "aprenderíamos" },
        { prompt: "Ellos ____ la cinta en el café. (poner)", answer: "pondrían" },
        { prompt: "Yo no ____ del café sin la cinta. (salir)", answer: "saldría" },
        { prompt: "¿Te ____ recitar un verso? (gustar)", answer: "gustaría" },
      ],
    },
  },

  29: {
    title: "Por vs. Para + Comparisons (más que, tan como, el mejor)",
    briefing:
      "In San Antonio a conjunto master's accordion is gone, and to understand why it matters you need two small words that do big work. PARA points forward, toward a goal or a person: para su familia (the recipient), para tocar (a purpose), para el sábado (a deadline). POR looks back at the cause, or moves through something: por amor (the motive), por la calle (through), por veinte dólares (in exchange for), por primera vez, por eso. A quick test: if you could say 'in order to' or 'for the benefit of', use para. If you could say 'because of', 'in exchange for' or 'through', use por. Then compare like a witness: más … que, menos … que, tan … como; the irregulars mejor, peor, mayor, menor; and the superlative el / la más … or el mejor. The accordion came to Texas with German and Czech settlers. The music Tejanos made with it is their own.",
    examples: [
      { es: "Don Nica tocaba por amor y para su familia.", en: "Don Nica played out of love and for his family." },
      { es: "Su padre le compró el acordeón por veinte dólares.", en: "His father bought him the accordion for twenty dollars." },
      { es: "Este acordeón es más viejo que don Nica, y suena mejor que los nuevos.", en: "This accordion is older than Don Nica, and it sounds better than the new ones." },
    ],
    referenceTable: {
      caption: "PARA points forward · POR looks back",
      headers: ["PARA", "POR"],
      rows: [
        ["recipient: para su familia", "motive: por amor · por eso"],
        ["purpose: para tocar", "exchange: por veinte dólares"],
        ["deadline: para el sábado", "through / along: por la calle"],
        ["destination: salió para San Antonio", "duration: por tres horas"],
      ],
    },
    drills: [
      { prompt: "Don Nica tocaba ____ su familia. (recipient)", answer: "para" },
      { prompt: "Tocaba ____ amor, no por dinero. (motive)", answer: "por" },
      { prompt: "Compró el acordeón ____ veinte dólares. (exchange)", answer: "por" },
      { prompt: "Necesito el acordeón ____ el sábado. (deadline)", answer: "para" },
      { prompt: "Este acordeón es ____ viejo que el otro. (comparison)", answer: "más" },
      { prompt: "Suena ____ que todos los nuevos. (better)", answer: "mejor" },
    ],
    secondDrill: {
      title: "Compare the Instruments",
      instructions: "Complete each comparison. The English in parentheses tells you which structure to use.",
      items: [
        { prompt: "El acordeón de don Nica es ____ antiguo ____ el mío. (more … than)", answer: "más … que" },
        { prompt: "El bajo sexto es ____ grande ____ el acordeón. (as … as)", answer: "tan … como" },
        { prompt: "Este es ____ acordeón de todo Texas. (the best)", answer: "el mejor" },
        { prompt: "Mi grabadora es ____ que la tuya. (worse)", answer: "peor" },
        { prompt: "Yolanda es ____ que su hermano. (older)", answer: "mayor" },
      ],
    },
  },

  30: {
    title: "The Subjunctive I — Wishes and Emotion (ojalá que vuelva)",
    briefing:
      "On Calle Ocho a ventanita has lost its cafetera and the handwritten recipe book behind sixty years of the same coffee. People don't describe what happened; they say what they WANT and how they FEEL — and after quiero que, espero que, ojalá que, me alegra que and siento que, Spanish switches to the SUBJUNCTIVE. The two halves need different subjects: Quiero volver (the same person) but Quiero que la cafetera vuelva (someone or something else). To form it, take the yo form of the present, drop the -o, and switch the vowel: -AR verbs take -e (regresar → regrese), -ER and -IR verbs take -a (volver → vuelva, tener → tenga). Six verbs are irregular: sea, esté, vaya, sepa, dé, haya. Miami's Cuban exile community built a whole culture around waiting for something to come back, which is why ojalá que is the phrase of this case. You will also hear '¿Qué bolá, asere?' — a Cuban greeting.",
    examples: [
      { es: "Ojalá que la cafetera vuelva a la ventanita.", en: "I hope the coffee maker comes back to the ventanita." },
      { es: "Espero que recuerden la receta de la abuela.", en: "I hope they remember grandma's recipe." },
      { es: "Me alegra que pruebes la colada. — Siento que no esté la libreta.", en: "I'm glad you're trying the colada. — I'm sorry the notebook isn't here." },
    ],
    referenceTable: {
      caption: "Trigger + QUE + a different subject → subjunctive",
      headers: ["Infinitivo", "yo (presente)", "Subjuntivo", "Ejemplo"],
      rows: [
        ["regresar", "regreso", "regrese", "Espero que regrese pronto."],
        ["volver", "vuelvo", "vuelva", "Ojalá que vuelva."],
        ["tener", "tengo", "tenga", "Quiero que tenga la receta."],
        ["ser", "(irregular)", "sea", "Me alegra que sea tu abuela."],
        ["estar", "(irregular)", "esté", "Siento que no esté aquí."],
        ["ir", "(irregular)", "vaya", "Quiero que vayas a la ventanita."],
      ],
    },
    drills: [
      { prompt: "Ojalá que la cafetera ____. (volver)", answer: "vuelva" },
      { prompt: "Espero que los nietos ____ la receta. (recordar)", answer: "recuerden" },
      { prompt: "Quiero que tú ____ el cortadito. (probar)", answer: "pruebes" },
      { prompt: "Me alegra que la ventanita ____ abierta. (estar)", answer: "esté" },
      { prompt: "Siento que nadie ____ la receta de memoria. (saber)", answer: "sepa" },
      { prompt: "Espero que el café ____ igual que antes. (ser)", answer: "sea" },
    ],
    secondDrill: {
      title: "Same Subject or Different?",
      instructions: "Write the INFINITIVE if the subject stays the same, or the SUBJUNCTIVE if it changes.",
      items: [
        { prompt: "Yo quiero ____ a la ventanita. (ir)", answer: "ir" },
        { prompt: "Yo quiero que tú ____ a la ventanita. (ir)", answer: "vayas" },
        { prompt: "Ella espera ____ la receta. (encontrar)", answer: "encontrar" },
        { prompt: "Ella espera que nosotros ____ la receta. (encontrar)", answer: "encontremos" },
        { prompt: "Ojalá que la abuela ____ orgullosa. (estar)", answer: "esté" },
      ],
    },
  },

  31: {
    title: "The Subjunctive II — Doubt and the Unknown (no creo que, busco a alguien que)",
    briefing:
      "In the mountain villages of New Mexico people still say truje, asina and muncho — Spanish from four hundred years ago that never disappeared there. These are not errors: they are some of the oldest living Spanish anywhere. The case is about finding someone who still speaks it, and that search needs the subjunctive in two new places. DOUBT: after no creo que, dudo que, es posible que and no es verdad que, the next verb goes in the subjunctive — No creo que quede nadie. Compare Creo que queda alguien: a belief, so indicative. THE UNKNOWN: when you describe a person or thing that may not exist, the description is subjunctive — Busco a alguien que hable así · No hay nadie que conozca ese dicho. If you know the person exists, it is indicative: Conozco a un anciano que habla así.",
    examples: [
      { es: "No creo que quede nadie en el pueblo que diga truje.", en: "I don't think there's anyone left in the village who says truje." },
      { es: "Busco a alguien que conozca los dichos antiguos.", en: "I'm looking for someone who knows the old sayings." },
      { es: "Conozco a un santero que todavía habla asina.", en: "I know a santero who still talks like that. (indicative — he exists)" },
    ],
    referenceTable: {
      caption: "Sure → indicative · Doubt or unknown → subjunctive",
      headers: ["Indicativo (seguro)", "Subjuntivo (duda / desconocido)"],
      rows: [
        ["Creo que queda alguien.", "No creo que quede nadie."],
        ["Es verdad que habla así.", "No es verdad que hable con errores."],
        ["Conozco a alguien que sabe tallar.", "Busco a alguien que sepa tallar."],
        ["Hay un anciano que puede ayudar.", "No hay nadie que pueda ayudar."],
      ],
    },
    drills: [
      { prompt: "No creo que ____ nadie. (quedar)", answer: "quede" },
      { prompt: "Busco a alguien que ____ así. (hablar)", answer: "hable" },
      { prompt: "Dudo que el retablo ____ nuevo. (ser)", answer: "sea" },
      { prompt: "No hay nadie que ____ ese dicho. (conocer)", answer: "conozca" },
      { prompt: "Es posible que la grabación todavía ____. (existir)", answer: "exista" },
      { prompt: "Creo que el anciano ____ en Chimayó. (vivir — ¡está seguro!)", answer: "vive" },
    ],
    secondDrill: {
      title: "Sure or Not Sure?",
      instructions: "Circle and write the right form. Ask yourself: is the speaker sure — and does the person exist?",
      items: [
        { prompt: "Conozco a una anciana que (sabe / sepa) decir truje. →", answer: "sabe" },
        { prompt: "Busco a una anciana que (sabe / sepa) decir truje. →", answer: "sepa" },
        { prompt: "No es verdad que el anciano (habla / hable) con errores. →", answer: "hable" },
        { prompt: "Es verdad que el anciano (habla / hable) un español antiguo. →", answer: "habla" },
        { prompt: "No hay nadie que (talla / talle) bultos como él. →", answer: "talle" },
      ],
    },
  },

  32: {
    title: "Impersonal and Passive SE — It Was Made Here",
    briefing:
      "La Curadora says nothing in Chicago was invented, only copied. To prove her wrong you need a structure that puts the THING and the PLACE in the spotlight instead of the person: SE. Impersonal se talks about people in general — Aquí se come bien ('people eat well here'), Se habla español. Passive se says what was done without saying who did it — Se inventó el jibarito ('it was invented'), Se construyeron las banderas ('they were built'). The verb agrees with the thing: se vende un jibarito, se venden jibaritos · se construyó un arco, se construyeron dos banderas. It works in every tense you have learned this year: se hace, se hizo, se hacía, se hará. In Chicago two communities, Mexican and Puerto Rican, built their neighborhoods side by side, and the jibarito — invented there in 1996 — is served nowhere on the island. Aquí se inventó.",
    examples: [
      { es: "El jibarito se inventó en Chicago en 1996.", en: "The jibarito was invented in Chicago in 1996." },
      { es: "En el Paseo Boricua se construyeron dos banderas de acero.", en: "On Paseo Boricua two steel flags were built." },
      { es: "Aquí se habla español, inglés y un poco de los dos.", en: "Here people speak Spanish, English and a bit of both." },
    ],
    referenceTable: {
      caption: "SE + verb — the verb agrees with the THING",
      headers: ["Una cosa (singular)", "Varias cosas (plural)"],
      rows: [
        ["Se vende un jibarito.", "Se venden jibaritos."],
        ["Se construyó un arco.", "Se construyeron dos banderas."],
        ["Se pintó un mural.", "Se pintaron murales."],
        ["Se necesita un cocinero.", "Se necesitan vecinos."],
        ["Se habla español. (impersonal)", "Se come bien aquí. (impersonal)"],
      ],
    },
    drills: [
      { prompt: "El jibarito ____ inventó en Chicago. (nobody says who)", answer: "se" },
      { prompt: "Aquí se ____ jibaritos todos los días. (vender)", answer: "venden" },
      { prompt: "En 1995 se ____ dos banderas de acero. (construir)", answer: "construyeron" },
      { prompt: "En la calle 16 se ____ muchos murales. (pintar)", answer: "pintaron" },
      { prompt: "En este barrio se ____ español. (hablar)", answer: "habla" },
      { prompt: "¡Todo esto se ____ aquí! (hacer)", answer: "hizo" },
    ],
    secondDrill: {
      title: "Put the Thing in the Spotlight",
      instructions: "Rewrite each sentence with se. Drop the person and make the verb agree with the thing.",
      items: [
        { prompt: "Los vecinos inventaron el jibarito. →", answer: "Se inventó el jibarito." },
        { prompt: "Los artistas pintaron los murales. →", answer: "Se pintaron los murales." },
        { prompt: "La comunidad fundó el museo. →", answer: "Se fundó el museo." },
        { prompt: "Los obreros levantaron dos banderas. →", answer: "Se levantaron dos banderas." },
        { prompt: "En la esquina venden plátanos. →", answer: "En la esquina se venden plátanos." },
      ],
    },
  },
};
