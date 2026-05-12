import crypto from "crypto";

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPin(pin: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(pin).digest("hex");
}

export function verifyPin(pin: string, salt: string, storedHash: string): boolean {
  return hashPin(pin, salt) === storedHash;
}
