
export async function checkIfLikedInWeek(uuid: string): Promise<boolean> {

  const superlikes = await fetch("api/addsuperlike");
  const superlikesData = await superlikes.json();


  const hasabo= await fetch("api/getAboStatus");
  const hasAbo= await hasabo.json();

  // wenn der User ein Abo hat, dann 10 Superlikes
  let diff= hasAbo? 10:0;

  let counter = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  let filteredSuperlikes = superlikesData.map((superlike: any) => {
    //console.log(oneWeekAgo +" "+new Date(superlike.likedAt)+"Vergleich: " + (new Date(superlike.likedAt) >= oneWeekAgo));
    if (
      uuid &&
      superlike.from === uuid &&
      new Date(superlike.likedAt) >= oneWeekAgo
    ) {
      counter++;
    }
  });

  // Wenn der User mehr als diff (also 1 oder mehr) Superlike in dieser Woche gegeben hat, dann wird der Button deaktiviert
  if (counter > diff) {
    return true;
  } else {
    return false;
  }
}
