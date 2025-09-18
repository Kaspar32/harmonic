export async function convertImagesToBase64(
    images: { id: string; image?: File | null }[]
  ) {
    const promises = images.map((img) => {
      return new Promise<string | null>((resolve) => {
        if (img.image instanceof File) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(img.image);
        } else {
          resolve(null); // Wenn kein Bild vorhanden
        }
      });
    });

    return Promise.all(promises); // Array mit base64 oder null
  }