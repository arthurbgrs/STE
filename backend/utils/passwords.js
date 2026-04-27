const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

function isBcryptHash(value = "") {
  return /^\$2[aby]\$\d{2}\$/.test(String(value));
}

async function hashPassword(password) {
  return bcrypt.hash(String(password), SALT_ROUNDS);
}

async function comparePassword(password, storedHash) {
  if (!storedHash) return false;

  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(String(password), storedHash);
  }

  return String(password) === String(storedHash);
}

module.exports = {
  comparePassword,
  hashPassword,
  isBcryptHash,
};
