import crypto from "crypto";

// OAuth tokens for Instagram/TikTok are long-lived credentials that can read
// a creator's account — they don't belong in the database in clear text.
// AES-256-GCM: authenticated, so a tampered ciphertext fails to decrypt
// rather than silently returning garbage.
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const getKey = (): Buffer => {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is missing — required to store social tokens"
    );
  }
  // Accept either a 64-char hex key or any passphrase, normalised to 32 bytes.
  return /^[0-9a-f]{64}$/i.test(secret)
    ? Buffer.from(secret, "hex")
    : crypto.createHash("sha256").update(secret).digest();
};

export const encryptToken = (plain: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // iv:tag:ciphertext — everything needed to decrypt, minus the key.
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
};

export const decryptToken = (payload: string): string | null => {
  try {
    const [ivPart, tagPart, dataPart] = payload.split(":");
    if (!ivPart || !tagPart || !dataPart) return null;
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getKey(),
      Buffer.from(ivPart, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Wrong key or tampered payload — treat as "no usable token" so the
    // caller falls back to asking the user to reconnect.
    return null;
  }
};
