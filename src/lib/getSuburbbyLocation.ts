
const cache = new Map();
export async function reverseGeocode(lat: any, lon: any) {

    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;

  // 1. Cache check
  if (cache.has(key)) {
    return cache.get(key);
  }


  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "harmonic-app/1.0 (contact: kaspar.bachmann@santismail.ch)",
    },
  });

  const data = await res.json();

  const result = {
    city: data.address.city || data.address.town || data.address.village,
    suburb: data.address.suburb,
    country: data.address.country,
  };

  // 2. Cache speichern
  cache.set(key, result);

  return result;
}
