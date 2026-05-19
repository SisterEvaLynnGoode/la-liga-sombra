/**
 * Locked visual style constants for all La Liga Sombra character art.
 *
 * These values are used by the prompt builder and must NOT be changed
 * per-character — they define the visual identity of the game.
 * If you want to experiment with a different style, duplicate this object
 * under a new name rather than mutating this one.
 */
export const ILLUSTRATED_NOIR_STYLE = {
  styleDescriptor:
    "illustrated graphic novel style, noir detective comic art, ink and watercolor, moody atmospheric lighting, sepia and mustard tones with deep crimson red accents, painterly textures, slightly rough expressive ink lines, vintage comic book feel reminiscent of Mike Mignola or Sean Phillips, Latin American noir aesthetic, NOT photorealistic, NOT photograph, NOT manga, NOT anime, NOT 3D rendered",

  backgroundDescriptor:
    "simple atmospheric background, soft painterly vignette, period-appropriate subtle textures (aged paper, brick, wood), muted earthy tones, no busy or distracting details, focus stays on the character",

  compositionDescriptor:
    "centered character portrait, head and shoulders clearly visible, three-quarter view, direct eye line toward viewer, clear warm directional lighting on face so all features are legible and sharp",

  negativePrompt:
    "photorealistic, photograph, hyperrealistic, 3D render, CGI, anime, manga, cartoon, chibi, low quality, blurry, distorted face, extra limbs, missing limbs, deformed hands, text, watermark, logo, multiple people, crowd, busy background, neon colors, modern digital art, flat vector art",

  /** Append to every prompt to reinforce style consistency across the set */
  styleEnforcer:
    "consistent style with rest of the La Liga Sombra character set, same ink line weight, same color palette, same painterly watercolor wash technique",
} as const;

export type IllustratedNoirStyle = typeof ILLUSTRATED_NOIR_STYLE;
