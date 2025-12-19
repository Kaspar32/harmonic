 export function getImageSrc(base64String: string) {
  if (base64String.startsWith("data:image")) {
    return base64String; // schon komplett
  }
  return `data:image/png;base64,${base64String}`; // Prefix ergänzen
}