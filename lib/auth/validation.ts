const PROFANITY = [
  // English
  "fuck","shit","ass","bitch","damn","crap","bastard","dick","cock",
  "pussy","cunt","whore","slut","fag","nigger","nigga","piss","cuck",
  // Spanish
  "puta","mierda","pendejo","chingado","cabron","cabrón","verga","coño",
  "maricón","puto","joder","hostia","culo","carajo","chinga","perra",
];

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { valid: false, error: "El nombre debe tener al menos 2 caracteres." };
  if (trimmed.length > 20) return { valid: false, error: "El nombre debe tener 20 caracteres o menos." };
  // Letters (incl. accents), digits, spaces, hyphens, apostrophes.
  // Digits are allowed: students pick agent names like "Alex07", and the old
  // letters-only rule blocked signup with an English error nobody understood.
  if (!/^[a-zA-Z0-9À-ÖØ-öø-ÿ\s'-]+$/.test(trimmed))
    return { valid: false, error: "Solo letras, números, espacios y guiones. Sin emojis ni símbolos." };
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 2)
    return { valid: false, error: "Solo tu nombre o apodo — sin apellidos." };
  const lower = trimmed.toLowerCase();
  for (const word of PROFANITY) {
    if (lower.includes(word))
      return { valid: false, error: "Ese nombre no está permitido. Elige otro." };
  }
  return { valid: true };
}

export function validateClassCode(code: string): { valid: boolean; error?: string } {
  if (!/^[A-Za-z]{3}[0-9]{3}$/.test(code.trim()))
    return { valid: false, error: "El código tiene 3 letras + 3 números (ej., OAK101). ¡Cuidado con confundir la letra O y el número 0!" };
  return { valid: true };
}

export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (!/^\d{4}$/.test(pin))
    return { valid: false, error: "El PIN debe tener exactamente 4 números." };
  return { valid: true };
}

// Generates a code like "OAK101" — avoids I/O to prevent confusion
export function generateClassCode(): string {
  const L = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const D = "0123456789";
  return (
    L[Math.floor(Math.random() * L.length)] +
    L[Math.floor(Math.random() * L.length)] +
    L[Math.floor(Math.random() * L.length)] +
    D[Math.floor(Math.random() * D.length)] +
    D[Math.floor(Math.random() * D.length)] +
    D[Math.floor(Math.random() * D.length)]
  );
}
