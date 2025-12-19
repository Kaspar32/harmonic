import { db } from "@/db";
import { users, profilePictures, settings } from "@/db/schema";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import Genres from "@/app/data/Genres";
import IchSucheData from "@/app/data/IchSucheData";
import Interests from "@/app/data/Intrests";

async function urlToBase64(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export async function createRandomProfiles(count: number) {
  const userEntries = [];
  const picturesEntry = [];
  const settingsEntry = [];

  for (let i = 0; i < count; i++) {
    const uuid = faker.string.uuid();

    ///Geschlecht definieren
    let geschlecht;

    const sexProbability = Math.random(); // zahl zwischen 0 - 1
    if (sexProbability < 0.45) {
      // Wenn Zahl kleiner ist als 0.45 = männlich
      geschlecht = "Männlich";
    } else if (sexProbability < 0.9) {
      //Wenn Zahl kleiner als 0.9 = weiblich (0.45 + 0.45 = 0.90 // Männlich & weiblich haben die gleiche wahrscheinlichkeit)
      geschlecht = "Weiblich";
    } else {
      geschlecht = "Divers"; //Sonst Divers => 10% Wahrscheinlichkeit
    }

    const sex = geschlecht === "Männlich" ? "male" : "female";

    const name =
      geschlecht === "Divers"
        ? faker.person.firstName()
        : faker.person.firstName(sex);

    const minAlter = 18;
    const maxAlter = 100;
    const alter = Math.ceil(Math.random() * (maxAlter - minAlter)) + minAlter;

    const minGrosse = 152;
    const maxGrosse = 192;
    const groesse =
      Math.ceil(Math.random() * (maxGrosse - minGrosse)) + minGrosse;

    const password = bcrypt.hashSync("12345678", 12);

    const roles = "fakeUser";

    //Kopiert Genres array, sortiert es einfach random lol
    const mixGenres = [...Genres].sort(() => Math.random() - 0.5);
    //Random Zahl von 1-5
    const randomGenreNumber = Math.floor(Math.random() * 5) + 1;

    //Nimmt die erste bis zum random ausgewählen Zahl genre aus
    //map nimmt nur den 'name' raus um es als array zu speichern, nicht als objekt
    const genres = mixGenres.slice(0, randomGenreNumber).map((g) => g.name);

    const mixInterests = [...Interests].sort(() => Math.random() - 0.5);
    const randomInterestNumber = Math.floor(Math.random() * 5) + 1;
    const intressen = mixInterests
      .slice(0, randomInterestNumber)
      .map((i) => i.name);

    //Ausbildungen Liste
    const ausbildungen = [
      "Bachelor",
      "Master",
      "Promoviert",
      "Handelsschule",
      "EFZ",
      "Matura",
      "obligatorische Schule",
    ];

    //Nimmt den Element aus der Liste mit dem 'ausgewählten' Zahl.
    const ausbildung =
      ausbildungen[Math.floor(Math.random() * ausbildungen.length)];

    const mixIchSuche = [...IchSucheData].sort(() => Math.random() - 0.5);
    const randomIchSucheNumber = Math.floor(Math.random() * 4) + 1;
    const ichsuche = mixIchSuche
      .slice(0, randomIchSucheNumber)
      .map((s) => s.name);

    userEntries.push({
      uuid,
      password,
      name,
      alter,
      geschlecht,
      roles,
      groesse,
      genres,
      intressen,
      ausbildung,
      ichsuche,
    });

    const avatarUrl =
      geschlecht === "Divers"
        ? faker.image.personPortrait()
        : faker.image.personPortrait({ sex });
    const base64 = await urlToBase64(avatarUrl);

    picturesEntry.push({
      id: faker.string.uuid(),
      userUuid: uuid,
      imageBase64: "data:image/jpeg;base64," + base64,
      imageBase64_blurred: base64,
      position: 0,
    });

    const interessenArray = ["mann", "frau", "divers", "alle"];
    const intresse =
      interessenArray[Math.floor(Math.random() * interessenArray.length)];

    settingsEntry.push({
      uuid,
      intresse,
      alter: [18, 100],
    });
  }

  await db.insert(users).values(userEntries);
  await db.insert(profilePictures).values(picturesEntry);
  await db.insert(settings).values(settingsEntry);

  console.log(`${count} fake profile erstellt lol`);
}
