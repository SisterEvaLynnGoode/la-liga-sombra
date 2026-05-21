/**
 * Shot definitions for the La Liga Sombra 35-second social media trailer.
 * Model: seedance_2_0 | Genre: noir | Aspect: 9:16 | Duration: 5s | Resolution: 720p
 * Cost: 22.5 credits/shot × 9 shots = 202.5 credits base
 */

const STYLE_PREFIX =
  "Illustrated graphic novel noir style, painterly ink and watercolor animation, moody cinematic lighting, sepia and mustard tones with deep red accents, slightly rough hand-drawn lines, vintage comic book aesthetic with heavy shadow blocking and expressive brushwork, 9:16 vertical composition, NOT photorealistic, NOT 3D rendered, NOT anime.";

export interface ShotDef {
  number: number;
  slug: string;
  description: string; // human-readable label for the editing guide
  prompt: string;
}

export const SHOTS: ShotDef[] = [
  {
    number: 1,
    slug: "shot-01-guitar-heist",
    description: "Gloved hand lifts ornate mariachi guitar from display case — slow push-in, dust motes",
    prompt: `${STYLE_PREFIX} Close-up on a gloved hand reaching into a dimly lit museum display case, slowly lifting a golden ornate cultural artifact — an old mariachi guitar with intricate inlay work. Shadow falls across the velvet-lined case as the gloved arm (dark sleeve, only the arm visible) carefully removes the instrument. Dust motes catch narrow beams of warm amber light slanting in from above. Camera slowly pushes in toward the hand and guitar. No face visible — only the mystery of the thief's arm. 5 seconds.`,
  },
  {
    number: 2,
    slug: "shot-02-war-room",
    description: "Noir agency war room — Latin America map with red pins/strings, silhouetted figure at window",
    prompt: `${STYLE_PREFIX} Interior of a shadowy detective agency war room. A large hand-drawn map of Latin America covers the wall, covered in red push-pins connected by strings, newspaper clippings, and handwritten notes. A lone silhouetted figure stands at a window, back to camera, looking out at rain-slicked city lights below. Hanging lamp casts a warm cone of light on the map. Atmosphere is tense and investigative. 5 seconds.`,
  },
  {
    number: 3,
    slug: "shot-03-title-card",
    description: "Title card — 'LA LIGA SOMBRA' and 'Un misterio en español' appear as ink brushstrokes",
    prompt: `${STYLE_PREFIX} Animated title card reveal on deep black background. Bold brushstroke lettering in mustard yellow appears stroke by stroke: 'LA LIGA SOMBRA'. Below it, smaller red ink lettering fades in: 'Un misterio en español'. The letters have a rough hand-inked texture with slight bleeding at the edges, as if stamped or brushed onto paper. Subtle smoke or ink dispersal surrounds the letters. No characters in frame — pure typographic drama. 5 seconds.`,
  },
  {
    number: 4,
    slug: "shot-04-mexico-plaza",
    description: "Mexican plaza at dusk — papel picado, mariachi, suspicious figure in black hat",
    prompt: `${STYLE_PREFIX} Wide establishing shot of a vibrant Mexican town plaza at golden-hour dusk. Colorful papel picado banners flutter in the warm breeze overhead. A mariachi trio plays in the background, their silhouettes lit from below by market lanterns. In the foreground-left, a suspicious figure in a wide black hat and long coat lingers near a pillar, watching the musicians. The atmosphere blends fiesta warmth with lurking menace. Camera holds then slowly pushes toward the shadowy figure. 5 seconds.`,
  },
  {
    number: 5,
    slug: "shot-05-madrid-chase",
    description: "Madrid metro station chase — motion blur, yellow signs, running figures",
    prompt: `${STYLE_PREFIX} Underground metro station in Madrid. Harsh fluorescent lighting and bold yellow signage reading 'METRO'. A figure in a dark coat sprints through the platform, blurring past commuters. Another figure — the detective — gives chase several steps behind. Motion blur on both runners emphasizes speed. The tiled walls and metal columns streak past. Sparks briefly flash from the rails. Urgent, kinetic energy. 5 seconds.`,
  },
  {
    number: 6,
    slug: "shot-06-costa-rica-interrogation",
    description: "Costa Rica villa interrogation — worried woman, single tear, tropical plants in background",
    prompt: `${STYLE_PREFIX} Intimate interior scene. A middle-aged Latina woman sits across a table, her hands clasped, expression deeply worried. A single tear traces her cheek. The room has lush tropical plants visible through a window behind her — bougainvillea, ferns, bright light. A shadow from an unseen interrogator falls across the table. The woman's eyes dart down then up. Painted ink style captures subtle emotion in her face. 5 seconds.`,
  },
  {
    number: 7,
    slug: "shot-07-chile-festival",
    description: "Chile music festival stage — crowd silhouette, saboteur near cables, electrical sparks",
    prompt: `${STYLE_PREFIX} Outdoor music festival at night in Chile. A massive crowd is silhouetted against a blazing stage with colored lights. On the side of the stage, crouching in shadow, a saboteur figure tampers with thick electrical cables. Suddenly a cascade of bright sparks erupts from the cables — harsh white and orange against the dark. The crowd in front is unaware. Dramatic contrast between the festive atmosphere and the covert sabotage. 5 seconds.`,
  },
  {
    number: 8,
    slug: "shot-08-police-lineup",
    description: "Noir police lineup — 2×2 grid of diverse suspects, red 'MATCH' stamp animation",
    prompt: `${STYLE_PREFIX} Split-screen noir police lineup format showing four diverse suspects in a 2×2 grid — each in their own panel, lit from above against a blank wall with height markings, each facing slightly forward with wary expressions. The suspects are varied in age, gender, and style. After a beat, a bold red rubber-stamp graphic — 'MATCH' — slams down over one panel with an ink-splatter effect, then fades to a question mark. Tense, game-show energy. 5 seconds.`,
  },
  {
    number: 9,
    slug: "shot-09-villain-reveal",
    description: "El Coleccionista silhouette in dark mansion gallery, '¿Puedes atraparlos?' text",
    prompt: `${STYLE_PREFIX} Grand final shot. An enormous shadowy mansion gallery, walls lined with stolen cultural artifacts — instruments, masks, textiles, paintings — all dimly illuminated. At the far end, a tall silhouetted figure — El Coleccionista — stands with their back to camera, arms spread slightly, surveying their collection. The figure is powerful and menacing. After a pause, hand-lettered text burns in from the bottom of frame in red ink: '¿Puedes atraparlos?' Camera holds. 5 seconds.`,
  },
];

export const MODEL_PARAMS = {
  model: "seedance_2_0",
  genre: "noir",
  aspect_ratio: "9:16",
  duration: 5,
  resolution: "720p",
  creditsPerShot: 22.5,
};
