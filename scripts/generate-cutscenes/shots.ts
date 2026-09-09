/**
 * Case-intro cutscene shots for Casos 11-20.
 *
 * Casos 1-10 (and their cold-case variants) shipped 20 of these in August. Units
 * 11-20 were authored with `videoUrl: ""`, so every case from Honduras onward
 * opened on the static chief briefing while the first half of the year opened on
 * a film. This closes that gap.
 *
 * THE RULES THESE FOLLOW, taken from the 20 that already work:
 *  - 5 seconds, silent, 16:9. The briefing lines carry the grammar instruction
 *    and always play after the video, so the clip never needs to say anything.
 *  - The shot is the SCENE OF THE CRIME AFTER THE THEFT: the empty stand, the
 *    bare plinth, the gap where the thing was. That is what the case opens on,
 *    and an absence reads instantly without a word of English.
 *  - No people's faces. The suspects are revealed by the lineup art later, and a
 *    generated face here would contradict the portrait a student sees in the
 *    interrogation.
 *  - No text of any kind. Models like to invent signage, and invented Spanish on
 *    screen in a Spanish class is worse than no Spanish at all.
 *
 * Re-encode every render to H.264 crf 26, no audio, faststart before it goes in
 * public/videos/. The raw files are 6-10MB each; the whole first batch of 20 came
 * down from 132MB to 15MB that way, which is what makes them usable on a
 * Chromebook cart sharing school wifi.
 */

/** Identical in every prompt: this is what keeps 30 clips looking like one game. */
const STYLE_PREFIX =
  "Illustrated graphic novel noir style, painterly ink and watercolor animation, moody cinematic lighting, sepia and mustard tones with deep red accents, slightly rough hand-drawn lines, vintage comic book aesthetic with heavy shadow blocking and expressive brushwork, 16:9 cinematic composition, NOT photorealistic, NOT 3D rendered, NOT anime.";

/** Appended to every prompt for the same reason the style prefix is. */
const CONSTRAINTS =
  "No people visible, no faces, no text, no letters, no signage, no watermark, no subtitles. Silent establishing shot, slow deliberate camera move, 5 seconds.";

export interface CutsceneShot {
  unitNumber: number;
  /** Output file, matching the unit-NN-intro.mp4 convention already in public/videos/. */
  slug: string;
  place: string;
  /** What was taken, so the empty space in frame is the right empty space. */
  stolen: string;
  prompt: string;
}

export const SHOTS: CutsceneShot[] = [
  {
    unitNumber: 11,
    slug: "unit-11-intro",
    place: "Copán, Honduras — year 750",
    stolen: "a sacred glyph from the king's stela",
    prompt: `${STYLE_PREFIX} A towering carved Maya stone stela in the plaza at Copán at dawn, jungle mist low across the grass, howler-monkey silhouettes in the canopy beyond. One carved glyph block is missing from the stela's face, leaving a clean rectangular void in the stonework, pale where the stone never weathered. Camera pushes in slowly on the empty socket. Warm amber light rakes across the carvings. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 12,
    slug: "unit-12-intro",
    place: "Tikal, Guatemala — year 700",
    stolen: "an astronomer's jade mask",
    prompt: `${STYLE_PREFIX} The high stone chamber of a Maya astronomer at the top of a temple in Tikal, narrow window slots framing the night sky and the tops of other temples rising above the jungle canopy. In the centre, an empty carved stone stand where a jade mask rested, the dust ring still visible on the pedestal. Star charts scratched into the plaster wall. Camera drifts slowly toward the empty stand. Cold moonlight against warm torch glow. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 13,
    slug: "unit-13-intro",
    place: "Joya de Cerén, El Salvador — year 600",
    stolen: "a painted vessel",
    prompt: `${STYLE_PREFIX} The interior of a thatched Maya village kitchen at Joya de Cerén, clay pots and grinding stones on a low earthen shelf, bundles of maize hanging from the rafters. One clear gap on the shelf where a painted vessel stood, the ash-dusted outline of its base still on the clay. Faint volcanic ash falling like grey snow through the doorway light. Camera moves slowly along the shelf to the gap. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 14,
    slug: "unit-14-intro",
    place: "León, Nicaragua — 1907",
    stolen: "the original manuscript of a poem",
    prompt: `${STYLE_PREFIX} A poet's writing desk at night in a colonial house in León, Nicaragua, 1907. An oil lamp burns low beside an inkwell and a scattered stack of handwritten pages, one page half-slid off the edge. In the middle of the blotter, a clean rectangle where a manuscript lay, sharp against the ink-stained leather. Lace curtains move at an open window. Camera pushes in slowly across the desk. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 15,
    slug: "unit-15-intro",
    place: "Havana, Cuba — 1954",
    stolen: "the only master disc of a new mambo",
    prompt: `${STYLE_PREFIX} The control room of a Havana recording studio in 1954, seen through the glass into a dim live room with abandoned congas, a double bass on its side, and music stands holding scattered charts. In the foreground the cutting lathe sits with its turntable empty, the felt mat bare, the tonearm lifted and still. Cigarette smoke hangs in the lamplight. Camera drifts slowly toward the empty turntable. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 16,
    slug: "unit-16-intro",
    place: "Montevideo, Uruguay — 1930",
    stolen: "the ball from the first World Cup final",
    prompt: `${STYLE_PREFIX} The players' tunnel of the Estadio Centenario in Montevideo at halftime of the 1930 World Cup final, bright packed stands blazing at the far end of the dark concrete tunnel, confetti drifting in the light. In the foreground, a low wooden plinth with a shallow round depression in the cloth where the match ball sat, now empty. Long shadows across wet concrete. Camera pushes slowly down the tunnel toward the light. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 17,
    slug: "unit-17-intro",
    place: "Panama City, Panama — 1914",
    stolen: "the original lock blueprints",
    prompt: `${STYLE_PREFIX} An engineer's drafting office overlooking the Panama Canal locks at dusk in 1914, the day before the opening. Huge lock gates and still water visible through tall windows. A wide drafting table dominates the room, its surface bare but for weights and a T-square, the clean unfaded rectangle where rolled blueprints lay for years. A ceiling fan turns slowly. Camera moves in low across the empty table. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 18,
    slug: "unit-18-intro",
    place: "Itauguá, Paraguay",
    stolen: "a master weaver's ñandutí pattern",
    prompt: `${STYLE_PREFIX} A weaver's workshop in Itauguá, Paraguay, filled with circular ñandutí lace frames of intricate spiderweb patterns hanging on the walls and catching the light. In the centre of the wall, one empty wooden frame with nothing but cut thread ends left in it, and a bare hook where the master pattern hung. Afternoon light through wooden shutters. Camera drifts slowly across the lace to the empty frame. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 19,
    slug: "unit-19-intro",
    place: "Canaima, Venezuela — 1937",
    stolen: "the map to the route to Angel Falls",
    prompt: `${STYLE_PREFIX} An explorer's jungle camp at the foot of the Canaima tepuis in 1937, flat-topped mountains and distant falling water lost in cloud beyond. Inside a canvas tent, a folding table with a hurricane lamp, compass, and an open leather map case lying empty, its straps cut. Rain drips from the tent edge. Camera pushes in slowly on the empty case. ${CONSTRAINTS}`,
  },
  {
    unitNumber: 20,
    slug: "unit-20-intro",
    place: "Tiwanaku, Bolivia",
    stolen: "the keystone of the Gate of the Sun",
    prompt: `${STYLE_PREFIX} The Gate of the Sun at Tiwanaku at dusk, standing alone on the high altiplano with Lake Titicaca and distant mountains behind, carved figures across the lintel in deep relief. At the top of the arch a single keystone block is gone, leaving a dark gap in the silhouette against a heavy bruised sky. Wind moves dry grass across the stone plaza. Camera cranes slowly up to the missing block. ${CONSTRAINTS}`,
  },
];

/** Model settings, matched to the 20 clips already shipped. */
export const MODEL_PARAMS = {
  model: "kling3_0_turbo",
  duration: 5,
  aspect_ratio: "16:9",
} as const;
