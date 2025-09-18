export async function fetchUsers() {
  // Fetch User-Uuid
  const res1 = await fetch("/api/getuserdata");
  const data1 = await res1.json();

  const res2 = await fetch("/api/settings?id=" + data1.uuid);
  const settings = await res2.json();

  const res = await fetch("/api/adduser");

  if (res.ok) {
    const data = await res.json();

    // console.log("data", data);
    // Nicht eigener User darstellen und filtere nach Geschlecht
    const filteredUsers = data.filter(
      (user: { uuid: string; geschlecht: string; alter: number }) => {
        // sich selbst ausschließen
        if (user.uuid === data1.uuid) return false;

        // Geschlecht filtern
        const interesse = settings[0].intresse;
        if (
          (interesse === "mann" && user.geschlecht !== "Männlich") ||
          (interesse === "frau" && user.geschlecht !== "Weiblich") ||
          (interesse === "divers" && user.geschlecht !== "Divers")
        ) {
          return false;
        } 

        // Alter prüfen
        const [minAlter, maxAlter] = settings[0].alter; // z.B. [20, 50]
        if (user.alter < minAlter || user.alter > maxAlter) return false;

        return true;
      }
    );

    return filteredUsers;

    //console.log("filteredUsers", filteredUsers);
  }
}
