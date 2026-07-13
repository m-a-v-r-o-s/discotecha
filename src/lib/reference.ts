const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Door reference the guest gives at the entrance. Short, sayable over loud music.
export function makeReference() {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${out.slice(0, 3)}-${out.slice(3)}`;
}
