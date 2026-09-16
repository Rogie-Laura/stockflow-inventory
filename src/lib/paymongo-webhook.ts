import { createHmac, timingSafeEqual } from "crypto";

export function verifyPaymongoSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key.trim(), value.trim()];
    }),
  );

  const timestamp = parts.t;
  const signature = parts.te || parts.li;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const computed = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}
