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
  if (trimmed.length < 2) return { valid: false, error: "Name must be at least 2 characters." };
  if (trimmed.length > 20) return { valid: false, error: "Name must be 20 characters or fewer." };
  if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/.test(trimmed))
    return { valid: false, error: "Letters, spaces, hyphens, and apostrophes only." };
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 2)
    return { valid: false, error: "Use a nickname or first name only — no last names." };
  const lower = trimmed.toLowerCase();
  for (const word of PROFANITY) {
    if (lower.includes(word))
      return { valid: false, error: "That name is not allowed. Choose another." };
  }
  return { valid: true };
}

export function validateClassCode(code: string): { valid: boolean; error?: string } {
  if (!/^[A-Za-z]{3}[0-9]{3}$/.test(code.trim()))
    return { valid: false, error: "Class code must be 3 letters + 3 numbers (e.g., OAK101)." };
  return { valid: true };
}

export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (!/^\d{4}$/.test(pin))
    return { valid: false, error: "PIN must be exactly 4 digits." };
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
