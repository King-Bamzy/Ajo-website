const crypto = require("crypto");

const DEFAULT_ITERATIONS = 210000;
const KEYLEN = 32;
const DIGEST = "sha256";

function hashPassword(password, iterations = DEFAULT_ITERATIONS) {
  if (typeof password !== "string" || password.length < 8) {
    const error = new Error("Password must be at least 8 characters.");
    error.status = 400;
    throw error;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto
    .pbkdf2Sync(password, salt, iterations, KEYLEN, DIGEST)
    .toString("hex");

  return `pbkdf2$${iterations}$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const [scheme, iterationsStr, salt, hash] = storedHash.split("$");
  if (scheme !== "pbkdf2") return false;

  const iterations = Number(iterationsStr);
  if (!iterations || !salt || !hash) return false;

  const derivedKey = crypto
    .pbkdf2Sync(password, salt, iterations, KEYLEN, DIGEST)
    .toString("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derivedKey, "hex"));
  } catch {
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };

