export async function checkIfLikedInWeek(uuid: string): Promise<boolean> {
  const superlikes = await fetch("api/addsuperlike");
  const superlikesData = await superlikes.json();

  let counter = 0;

  let filteredSuperlikes = superlikesData.map((superlike: any) => {
    if (uuid && superlike.from === uuid) {
      counter++;
    }
  });


  // Wenn der User mehr als 0 (also 1 oder mehr) Superlike gegeben hat, dann wird der Button deaktiviert
  if (counter > 0) {
    return true;
  } else {
    return false;
  }
}
