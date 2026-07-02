/**
 * ACTFL-style Can-Do statements per unit (Workstream B4).
 *
 * Student-facing (Spanish, Novice-friendly). Shown on the CASO RESUELTO
 * screen with a 3-level emoji self-rating; stored in can_do_ratings and
 * surfaced next to actual mastery in the teacher dashboard — the gap between
 * self-rating and data is conference gold.
 */

export const CAN_DO: Record<number, string[]> = {
  1: [
    "Puedo saludar y presentarme en español.",
    "Puedo usar los números y las fechas.",
    "Puedo comparar los saludos de México con los míos.",
  ],
  2: [
    "Puedo describir mis clases y mi horario.",
    "Puedo describir a personas con ser + adjetivos.",
    "Puedo comparar una escuela de Puerto Rico con la mía.",
  ],
  3: [
    "Puedo decir adónde voy con el verbo ir.",
    "Puedo dar direcciones simples en la ciudad.",
    "Puedo hablar de los lugares de Madrid.",
  ],
  4: [
    "Puedo describir a mi familia.",
    "Puedo usar ser y estar para describir.",
    "Puedo comparar las familias de Costa Rica con la mía.",
  ],
  5: [
    "Puedo hablar de la tecnología que uso.",
    "Puedo usar tener para expresar edad y necesidades.",
    "Puedo comparar la vida diaria de Argentina con la mía.",
  ],
  6: [
    "Puedo pedir comida en un restaurante.",
    "Puedo usar verbos como querer y poder.",
    "Puedo comparar la comida colombiana con la mía.",
  ],
  7: [
    "Puedo hablar de la música y los festivales.",
    "Puedo describir el tiempo y las estaciones.",
    "Puedo comparar un festival chileno con uno mío.",
  ],
  8: [
    "Puedo comprar y regatear en un mercado.",
    "Puedo hablar del pasado con el pretérito.",
    "Puedo comparar un mercado andino con mis tiendas.",
  ],
  9: [
    "Puedo decir cómo me siento y qué me duele.",
    "Puedo dar consejos simples de salud.",
    "Puedo hablar de la herencia taína.",
  ],
  10: [
    "Puedo hablar de profesiones y carreras.",
    "Puedo expresar planes con el futuro.",
    "Puedo comparar el trabajo en Ecuador con mis metas.",
  ],
};

/** Rating scale shown to students. */
export const CAN_DO_SCALE = [
  { value: 1, emoji: "😕", labelEs: "Todavía no" },
  { value: 2, emoji: "🙂", labelEs: "Con ayuda" },
  { value: 3, emoji: "😎", labelEs: "¡Sí, puedo!" },
] as const;
