import crypto from "crypto";

export function signImagePath(path: string) {
  const SECRET = process.env.IMAGE_SECRET!;

  console.lgo

  if (!SECRET) {
    throw new Error("IMAGE_SECRET is not defined");
  }
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(path);
  return hmac.digest("hex");
}

export function signedImageUrl(path: string) {
  const sig = signImagePath(path);
  return `${path}?sig=${sig}`;
}
