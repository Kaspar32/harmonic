export async function checkIfLikedInWeek(uuid: string): Promise<boolean> {
  const superlikes = await fetch("api/addsuperlike");
  const superlikesData = await superlikes.json();

  let counter = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  

  let filteredSuperlikes = superlikesData.map((superlike: any) => {

    //console.log(oneWeekAgo +" "+new Date(superlike.likedAt)+"Vergleich: " + (new Date(superlike.likedAt) >= oneWeekAgo));
    if (uuid && superlike.from === uuid && new Date(superlike.likedAt) >= oneWeekAgo) {
      counter++;
    }
  });


  // Wenn der User mehr als 0 (also 1 oder mehr) Superlike in dieser Woche gegeben hat, dann wird der Button deaktiviert
  if (counter > 0) {
    return true;
  } else {
    return false;
  }
}
