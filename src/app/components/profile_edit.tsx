"use client";
import { useEffect, useState } from "react";
import Interests from "../data/Intrests";
import PopUp from "./popup";
import IchSucheData from "../data/IchSucheData";
import Genres from "../data/Genres";
import { UserType } from "../types/User";

import Questions from "./questions";

import Refactoring_Images from "./refactoring_images";

import { useUser } from "@/app/context/UserContext";
import { getLocation } from "@/lib/getLocation";
import { reverseGeocode } from "@/lib/getSuburbbyLocation";

interface TrackItem {
  id: string;
  name: string;
  artist: string;
  isSelected?: boolean;
}

interface ArtistItem {
  id: string;
  name: string;
  genre?: string;
  isSelected?: boolean;
}

export default function Profil_Edit() {
  const [userData, setUserData] = useState<UserType>({
    uuid: "",
    name: "",
    geschlecht: "",
    alter: "Auswählen",
    geburtstag: "Auswählen",
    groesse: "Auswählen",
    ausbildung: "Auswählen",
    intressen: [],
    ichsuche: [],
    genres: [],
    favorite_track: null,
    favorite_artist: null,
    roles: "",
    fakeUsersEnabled: true,
    profile_pics: [],
    location: null,
  });

  // Temporäre Variablen für die Editierfunktion
  const [Temp_Name, setTemp_Name] = useState("");
  const [Temp_Geschlecht, setTemp_Geschlecht] = useState("");
  const [Temp_Geburtstag, setTemp_Geburtstag] = useState("");
  const [Temp_Groesse, setTemp_Groesse] = useState("");
  const [Temp_Ausbildung, setTemp_Ausbildung] = useState("");

  const [showGeschlecht, setGeschlecht] = useState(false);
  const [showAlter, setAlter] = useState(false);
  const [showGroesse, setGroesse] = useState(false);
  const [showAusbildung, setAusbildung] = useState(false);
  const [showInteressen, setInteressen] = useState(false);
  const [showSuche, setSuche] = useState(false);
  const [showName, setName] = useState(false);
  const [showGenres, setGenres] = useState(false);
  const [showFavoriteTune, setFavoriteTune] = useState(false);
  const [showFavoriteBand, setFavoriteBand] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showLocation, setLocation] = useState(false);

  const [intressen] = useState(Interests);
  const [genres] = useState(Genres);
  const [ichSucheState] = useState(IchSucheData);

  const { user } = useUser();

  // User Daten und Bilder direkt laden
  useEffect(() => {
    async function fetchUser() {
      if (!user) {
        return;
      }

      setUserData((prev) => ({
        ...prev,
        uuid: user?.uuid,
        name: user?.name,
        geschlecht: user?.geschlecht,
        alter: user?.alter,
        geburtstag: user?.geburtstag,
        groesse: user?.groesse,
        ausbildung: user?.ausbildung,
        intressen: user?.intressen,
        ichsuche: user?.ichsuche,
        genres: user?.genres,
        favorite_track: user?.favorite_track,
        favorite_artist: user?.favorite_artist,
        roles: user?.roles,
        fakeUsersEnabled: user?.fakeUsersEnabled,
        profile_pics: user?.profile_pics,
        location: typeof user?.location === "string" ? user.location : null,
      }));

      // Sepzialfall Location

      alert("" + user?.location);

      if (typeof user?.location === "string") {
        setSuburb(user.location);
      }
    }
    fetchUser();
  }, [user]);

  //User updaten
  async function updateUser(updates: Partial<typeof userData>) {
    if (!userData.uuid) return;

    const newUserData = { uuid: userData.uuid, ...updates };
    console.log("newUserData:", newUserData);
    const res = await fetch("/api/updateUserData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUserData),
    });

    if (!res.ok) throw new Error("Update fehlgeschlagen");

    const updatedData = await res.json();
    setUserData((prev) => ({ ...prev, ...updatedData }));
  }

  function calculateAge(birthday: string) {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    return age;
  }

  useEffect(() => {
    if (userData?.geburtstag) {
      setTemp_Geburtstag(userData.geburtstag.split("T")[0]);
    }
  }, [userData]);

  // Bei jedem Rendern der Seite das Alter neu berechen, wichtig ist vor allem das Alter aktualisiert wird mit der calculateAge Funktion auch wenn das Geburtstag nicht ändert!

  useEffect(() => {
    if (userData?.geburtstag) {
      updateUser({ alter: calculateAge(userData.geburtstag).toString() });
    }
  }, []);

  //Spotify-Daten
  /*
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const [topTracks, setTopTracks] = useState<
    { name: string; artist: string; image: string | null }[]
  >([]);

  const [topArtist, setTopArtist] = useState<
    { id: string; name: string; image: string | null; genres: string }[]
  >([]);

  const client_id = "f0a194a6e44b425fbdf257fb380beb48";
  const redirect_uri = "http://127.0.0.1:3000/api/auth/callback/spotify";
  const scope = "user-top-read";

  const spotifyLoginUrl =
    `https://accounts.spotify.com/authorize?` +
    new URLSearchParams({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
    }).toString();

  useEffect(() => {
    async function loadSpotifyData() {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get("data");

      if (dataParam != null) {
        setSpotifyLoggedIn(true);
        const parsed = JSON.parse(dataParam);

        console.log("parsed:", parsed);

        if (parsed) {
          setTopTracks(parsed.topTracks);
          setTopArtist(parsed.topArtist);

          const res = await fetch("/api/getuserdata");
          const data = await res.json();

          fetch("/api/addspotifydata", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: parsed, userId: data.uuid }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Fehler beim Speichern in der DB");
              return res.json();
            })
            .then((data) => {
              console.log("Erfolgreich gespeichert:", data);
            })
            .catch((err) => {
              console.error("Speicherfehler:", err);
            });
        }
      }
    }

    loadSpotifyData();
  }, []);*/

  {
    /* Deezer-Daten::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */
  }

  const [searchInput, setSearchInput] = useState("");
  const [searchInput_Artist, setSearchInput_Artist] = useState("");

  type Track = {
    album: {
      images: { url: string }[];
    };
    name: string;
    artists: { name: string }[];
    preview?: string;
    isSelected?: boolean;
    id: string;
  };

  type Artist = {
    id: string;
    name: string;
    images: { url: string }[];
    isSelected?: boolean;
  };

  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  // 🔍 TRACK SEARCH
  async function search() {
    if (!searchInput) return;

    const res = await fetch(`/api/deezer-search?q=${searchInput}`);
    const data = await res.json();

    console.log("Deezer Tracks:", data);

    setTracks(
      data.data.map((t: any) => ({
        id: t.id,
        name: t.title,
        album: {
          images: [{ url: t.album.cover }],
        },
        artists: [{ name: t.artist.name }],
        preview: t.preview,
        isSelected: false,
      })),
    );
  }

  // 🎤 ARTIST SEARCH
  async function search_artist() {
    if (!searchInput_Artist) return;

 

    const res = await fetch(`/api/deezer-artist?q=${searchInput_Artist}`);
   const data = await res.json();

    console.log("Deezer Artists:", data);

  

    setArtists(
      data.data.map((a: any) => ({
        id: a.id,
        name: a.name,
        images: [{ url: a.picture }],
        isSelected: false,
      })),
    );
  }

  // 🎯 TRACK AUSWÄHLEN
  function toggleTrack(track: Track) {
    setTracks(
      tracks.map((t) =>
        t.id === track.id
          ? { ...t, isSelected: true }
          : { ...t, isSelected: false },
      ),
    );
  }

  // 🎯 ARTIST AUSWÄHLEN
  function toggleArtist(artist: Artist) {
    setArtists(
      artists.map((a) =>
        a.id === artist.id
          ? { ...a, isSelected: true }
          : { ...a, isSelected: false },
      ),
    );
  }

  // 💾 TRACK SPEICHERN
  async function saveTrack() {
    const selectedTrack = tracks.find((t) => t.isSelected);
    if (!selectedTrack) return;

    const trackData = {
      name: selectedTrack.name,
      image: selectedTrack.album?.images?.[0]?.url ?? null,
      artist: selectedTrack.artists?.[0]?.name ?? null,
    };

    setUserData((prev: any) => ({
      ...prev,
      favorite_track: trackData,
    }));

    await fetch("/api/savefavoritetrack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trackData),
    });
  }

  // 💾 ARTIST SPEICHERN
  function saveArtist(index: number) {
    const selectedArtist = artists.find((a) => a.isSelected);
    if (!selectedArtist) return;

    const artistData = {
      name: selectedArtist.name,
      image: selectedArtist.images?.[0]?.url ?? null,
    };

    setUserData((prev: any) => ({
      ...prev,
      favorite_artist: {
        ...prev.favorite_artist,
        [`favorite_artist${index}`]: artistData,
      },
    }));
  }

  function ArtistinDB() {
    fetch("/api/savefavoriteartist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData.favorite_artist),
    });
  }

  // 🎧 AUDIO PREVIEW
  function playTrack(track: Track) {
    if (!track.preview) return;

    const audio = new Audio(track.preview);
    audio.play();
  }

  // ---- Location:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const [suburb, setSuburb] = useState("");

  async function initLocation() {
    try {
      const location = await getLocation();
      let suburb = await reverseGeocode(location.latitude, location.longitude);
      setSuburb(suburb.city + ", " + suburb.suburb + ", " + suburb.country);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  }

  async function saveLocation() {
    await fetch("api/savelocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: suburb }),
    });
  }

  return (
    <div className="flex md:flex-row flex-col h-full p-4 border-2 border-yellow-400 rounded-2xl shadow-2xl m-2 bg-yellow-50">
      <h2 className=" text-gray-300 text-3xl font-bold ml-2 text-shadow-sm">
        Bilder
      </h2>

      {/*---------- Images und die Container --------*/}
      <Refactoring_Images />

      <div className="flex flex-wrap md:flex-nowrap gap-2">
        {/*---------- über mich --------*/}
        <div className="flex-1">
          <h2 className="  text-gray-300 text-3xl font-bold m-2 text-shadow-sm ">
            Über Mich
          </h2>

          <div className="mb-4">
            {/* Name */}
            <h3
              onClick={() => setName(true)}
              className="ml-4 mt-4 text-gray-300 text-center font-semibold border-t-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              Name: {userData.name}
            </h3>
            {showName && (
              <PopUp onClose={() => setName(false)}>
                <h2 className="text-xl font-bold mb-4 text-gray-400 dark:text-gray-400">
                  Name
                </h2>
                <textarea
                  disabled
                  defaultValue={userData.name}
                  onChange={(e) => setTemp_Name(e.target.value)}
                  className="bg-yellow-200 rounded-xl w-full h-24 p-2 focus:outline-none dark:text-black"
                />
                <button
                  className="mt-4 px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                  onClick={async () => {
                    setName(false);
                    await updateUser({ name: Temp_Name });
                  }}
                >
                  Speichern
                </button>
              </PopUp>
            )}

            {/* Alter */}
            <h3
              onClick={() => {
                setAlter(true);
              }}
              className="ml-4 mt-4 text-gray-300 text-center font-semibold border-t-2  text-2xl hover:bg-white rounded-2xl shadow-lg"
            >
              Alter: {userData.alter}
            </h3>

            {!userData.alter && (
              <div className=" text-yellow-500 font-bold ml-10 border-2 p-2 rounded-2xl mt-2 animate-pulse">
                Du musst dein Geburtstag angegeben, um angezeigt zu werden!
              </div>
            )}
            {showAlter && (
              <PopUp onClose={() => setAlter(false)}>
                <h2 className="text-xl font-bold mb-4  text-gray-400 dark:text-gray-400 ">
                  Geburtstag
                </h2>

                <input
                  type="date"
                  value={Temp_Geburtstag}
                  onChange={(e) => setTemp_Geburtstag(e.target.value)}
                  className="w-50 text-center text-xl  text-black dark:text-black border-2 border-yellow-300 rounded-xl p-2 appearance-none focus:outline-none"
                />

                <div className="flex gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                    onClick={async () => {
                      setAlter(false);
                      await updateUser({
                        geburtstag: Temp_Geburtstag,
                        alter: calculateAge(Temp_Geburtstag).toString(),
                      });
                    }}
                  >
                    Speichern
                  </button>
                </div>
              </PopUp>
            )}

            {/* Geschlecht */}
            <h3
              onClick={() => setGeschlecht(true)}
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-t-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              {userData.geschlecht === null ? (
                <>Geschlecht: Auswählen</>
              ) : (
                <>Geschlecht: {userData.geschlecht}</>
              )}
            </h3>

            {!userData.geschlecht && (
              <div className=" text-yellow-500 font-bold ml-10 border-2 p-2 rounded-2xl mt-2 animate-pulse">
                Du musst dein Geschlecht angegeben, um angezeigt zu werden!
              </div>
            )}

            {showGeschlecht && (
              <PopUp onClose={() => setGeschlecht(false)}>
                <h2 className="text-xl text-gray-400 dark:text-gray-400 font-bold mb-4">
                  Geschlecht
                </h2>

                <select
                  defaultValue={userData.geschlecht}
                  onChange={(e) => setTemp_Geschlecht(e.target.value)}
                  className="relative left-20  w-[200] text-center text-black dark:text-black appearance-none focus:outline-none"
                >
                  <option className="bg-gray-200">Auswählen</option>
                  <option>Männlich</option>
                  <option>Weiblich</option>
                  <option>Divers</option>
                </select>
                <div className="flex gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                    onClick={async () => {
                      setGeschlecht(false);
                      await updateUser({ geschlecht: Temp_Geschlecht });
                    }}
                  >
                    Speichern
                  </button>
                </div>
              </PopUp>
            )}

            {/* Grösse */}
            <h3
              onClick={() => setGroesse(true)}
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-t-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              Grösse: {userData.groesse} cm
            </h3>
            {showGroesse && (
              <PopUp onClose={() => setGroesse(false)}>
                <label
                  htmlFor="groesse"
                  className="block mb-2 text-lg text-gray-400 dark:text-gray-400"
                >
                  Größe: {Temp_Groesse} cm
                </label>
                <input
                  type="range"
                  id="groesse"
                  name="groesse"
                  min="140"
                  max="210"
                  defaultValue={userData.groesse}
                  onChange={(e) => setTemp_Groesse(e.target.value)}
                  className="w-full accent-yellow-400"
                />

                <button
                  className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                  onClick={async () => {
                    setGroesse(false);
                    await updateUser({ groesse: Temp_Groesse });
                  }}
                >
                  Speichern
                </button>
              </PopUp>
            )}

            {/* Ausbildung */}
            <h3
              onClick={() => setAusbildung(true)}
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-t-2   text-2xl hover:bg-white rounded-2xl shadow-lg"
            >
              {userData.ausbildung === null ? (
                <>Ausbildung: Auswählen</>
              ) : (
                <>Ausbildung: {userData.ausbildung}</>
              )}
            </h3>
            {showAusbildung && (
              <PopUp onClose={() => setAusbildung(false)}>
                <h2 className="text-xl text-gray-400 dark:text-gray-400 font-bold mb-4">
                  Ausbildung
                </h2>

                <select
                  defaultValue={userData.ausbildung}
                  onChange={(e) => setTemp_Ausbildung(e.target.value)}
                  className="relative left-20 w-[200] text-center text-black dark:text-black appearance-none focus:outline-none"
                >
                  <option className="bg-gray-200">Auswählen</option>
                  <option>Bachelor</option>
                  <option>Master</option>
                  <option>Promoviert</option>
                  <option>Handelsschule</option>
                  <option>EFZ</option>
                  <option>Matura</option>
                  <option>obligatorische Schule</option>
                </select>
                <div className="flex gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                    onClick={async () => {
                      setAusbildung(false);
                      await updateUser({ ausbildung: Temp_Ausbildung });
                    }}
                  >
                    Speichern
                  </button>
                </div>
              </PopUp>
            )}

            {/* Interessen */}
            <h3
              onClick={() => setInteressen(true)}
              className="ml-4  mt-4  text-gray-300 text-center font-semibold border-t-2   text-2xl hover:bg-white rounded-2xl shadow-lg  "
            >
              {userData.intressen && userData.intressen.length === 0
                ? "Interessen (bitte auswählen)"
                : "Interessen (bitte klicken)"}
            </h3>
            {showInteressen && (
              <PopUp onClose={() => setInteressen(false)}>
                <h2 className="text-xl text-gray-400 dark:text-gray-400 font-bold mb-4">
                  Interessen
                </h2>

                <div className="flex flex-wrap gap-2 h-100 p-2 overflow-y-auto">
                  {intressen.map((interest, index) => (
                    <button
                      key={index}
                      className={`ring-2 rounded-2xl p-2 cursor-pointer select-none ${
                        userData.intressen?.includes(interest.name)
                          ? "bg-yellow-500 text-white"
                          : "bg-white text-gray-400"
                      }`}
                      onClick={() => {
                        if (
                          (userData.intressen?.length || 0) >= 5 &&
                          !(
                            userData.intressen?.includes(interest.name) ?? false
                          )
                        )
                          return;

                        const updated = userData.intressen?.includes(
                          interest.name,
                        )
                          ? userData.intressen.filter(
                              (n: string) => n !== interest.name,
                            )
                          : [...(userData.intressen || []), interest.name];

                        setUserData((prev) => ({
                          ...prev,
                          intressen: updated,
                        }));
                      }}
                    >
                      {interest.name}
                    </button>
                  ))}
                </div>

                <button
                  className="px-4 py-2 mt-4 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                  onClick={() => {
                    updateUser({ intressen: userData.intressen });
                    setInteressen(false);
                  }}
                >
                  Speichern
                </button>
              </PopUp>
            )}

            {/* Ich suche */}
            <h3
              onClick={() => setSuche(true)}
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-t-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              {userData.ichsuche && userData.ichsuche.length === 0
                ? "Ich suche (bitte auswählen)"
                : "Ich suche (bitte klicken)"}
            </h3>
            {showSuche && (
              <PopUp onClose={() => setSuche(false)}>
                <h2 className="text-xl text-gray-400 dark:text-gray-400 font-bold mb-4">
                  Ich suche
                </h2>

                <div className="flex flex-wrap gap-2 p-2 overflow-y-auto">
                  {ichSucheState.map((suche, index) => (
                    <button
                      key={index}
                      className={`ring-2 rounded-2xl p-2 cursor-pointer select-none ${
                        userData.ichsuche?.includes(suche.name)
                          ? "bg-yellow-500 text-white"
                          : "bg-white text-gray-400"
                      }`}
                      onClick={() => {
                        const updated = userData.ichsuche?.includes(suche.name)
                          ? userData.ichsuche.filter(
                              (n: string) => n !== suche.name,
                            )
                          : [...(userData.ichsuche || []), suche.name];

                        setUserData((prev) => ({ ...prev, ichsuche: updated }));
                      }}
                    >
                      {suche.name}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      updateUser({ ichsuche: userData.ichsuche });
                      setSuche(false);
                    }}
                    className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                  >
                    Speichern
                  </button>
                </div>
              </PopUp>
            )}

            {/* Location */}
            <div>
              <h3
                onClick={() => setLocation(true)}
                className="ml-4  mt-4 text-gray-300 text-center font-semibold border-t-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
              >
                Standort
              </h3>

              {showLocation && (
                <PopUp onClose={() => setLocation(false)}>
                  <h2 className="text-xl text-gray-400 dark:text-gray-400 font-bold mb-4">
                    Standort verwenden
                  </h2>

                  <div className="flex flex-col items-center gap-4 p-4">
                    <div onClick={initLocation}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-15 w-15 h-15 text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    <span>{suburb}</span>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => {
                        saveLocation();
                        setLocation(false);
                      }}
                      className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                    >
                      Speichern
                    </button>
                  </div>
                </PopUp>
              )}
            </div>
          </div>
        </div>

        {/*--------------- Genre -------------*/}
        <div className="flex-1">
          <h2 className=" text-gray-300 text-3xl font-bold m-2 text-shadow-sm ">
            Musik
          </h2>

          <div className="flex-1">
            <h3
              onClick={() => setGenres(true)}
              className="  mt-4 ml-4 mr-4 text-gray-300 text-center font-semibold border-t-2   text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              {userData.genres && userData.genres.length === 0
                ? "Genres (bitte auswählen)"
                : "Genres (bitte klicken)"}
            </h3>
            {showGenres && (
              <PopUp onClose={() => setGenres(false)}>
                <h2 className="text-xl text-gray-400 dark:text-gray-400 font-bold mb-4">
                  Genres
                </h2>

                <div className="flex flex-wrap gap-2 h-100 p-2 overflow-y-auto">
                  {genres.map((genre, index) => (
                    <button
                      key={index}
                      className={`ring-2 rounded-2xl p-2 cursor-pointer select-none ${
                        userData.genres?.includes(genre.name)
                          ? "bg-yellow-500 text-white"
                          : "bg-white text-gray-400"
                      }`}
                      onClick={() => {
                        if (
                          (userData.genres?.length || 0) >= 5 &&
                          !(userData.genres?.includes(genre.name) ?? false)
                        )
                          return;

                        const updated = userData.genres?.includes(genre.name)
                          ? userData.genres.filter(
                              (n: string) => n !== genre.name,
                            )
                          : [...(userData.genres || []), genre.name];

                        setUserData((prev) => ({ ...prev, genres: updated }));
                      }}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>

                <button
                  className="px-4 py-2 mt-4 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300"
                  onClick={() => {
                    updateUser({ genres: userData.genres });
                    setGenres(false);
                  }}
                >
                  Speichern
                </button>
              </PopUp>
            )}
            {/* */}
            <h3
              onClick={() => setFavoriteTune(true)}
              className=" ml-4 mr-4 mb-4 mt-4 text-gray-300 text-center font-semibold border-t-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              Momentanes Lieblingslied
            </h3>
            {showFavoriteTune && (
              <PopUp
                onClose={() => {
                  setFavoriteTune(false);
                  setTracks(tracks.map((t) => ({ ...t, isSelected: false })));
                }}
              >
                <p className="text-yellow-500 font-bold w-max  rounded-full text-sm mb-2">
                  Suche nache einem Lied
                </p>

                <div className="flex items-center gap-3">
                  {/* input */}
                  <div className="w-full max-w-sm">
                    <input
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus: outline-yellow-300 text-slate-700 placeholder:text-slate-400"
                      placeholder="Tippen Sie hier..."
                      onChange={(event) => setSearchInput(event.target.value)}
                    />
                  </div>

                  {/* ssearch button */}
                  <button
                    onClick={search}
                    className="bg-yellow-500 text-white px-5 py-2 rounded-md hover:bg-yellow-700 transition"
                  >
                    Suche
                  </button>
                </div>

                {/* Tracks */}
                <div className="space-y-2 mt-4 overflow-y-auto max-h-96">
                  {tracks.map((track, i) => {
                    return (
                      <div
                        key={i}
                        className={`rounded-md px-3 py-1 flex gap-2 items-center
                                border ${
                                  track.isSelected
                                    ? "border-yellow-400 bg-yellow-100"
                                    : "border-slate-200"
                                }`}
                        onClick={() => toggleTrack(track)}
                      >
                        <img
                          src={track.album?.images?.[0]?.url || "/fallback.jpg"}
                          alt={track.name}
                          className="w-15 h-15"
                        />
                        <div>
                          <p className="text-slate-400 font-bold text-xs">
                            {track.artists
                              .map((artist) => artist.name)
                              .join(", ")}
                          </p>
                          <p className="text-slate-800 font-semibold text-sm">
                            {track.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    saveTrack();
                    setFavoriteTune(false);
                  }}
                  className="bg-yellow-500 text-white px-3 py-2 mt-5 rounded-md hover:bg-yellow-700 transition"
                >
                  Speichern
                </button>

                <div className="border-t-2 border-slate-200 mt-4 pt-4">
                  <p className=" text-yellow-500 font-bold w-max mt-4 rounded-full text-sm ">
                    Ausgewählter Song:
                  </p>
                  {userData.favorite_track && (
                    <div className="mt-4 p-2 border-2 border-yellow-400 rounded-lg flex items-center gap-4">
                      <img
                        src={userData.favorite_track?.image || "/fallback.jpg"}
                        alt={userData.favorite_track?.name}
                        className="w-15 h-15"
                      />
                      <div>
                        <p className="text-slate-400 font-bold text-xs">
                          {userData.favorite_track?.artist}
                        </p>
                        <p className="text-slate-800 font-semibold text-sm">
                          {userData.favorite_track?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </PopUp>
            )}
            <h3
              onClick={() => setFavoriteBand(true)}
              className=" ml-4 mr-4 mb-4 mt-4 text-gray-300 text-center font-semibold border-t-2 text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              Lieblingsinterpret
            </h3>
            {showFavoriteBand && (
              <div className=" position absolute top-[-20px]">
                <PopUp
                  onClose={() => {
                    setFavoriteBand(false);
                  }}
                >
                  <p className="text-yellow-500 font-bold w-max  rounded-full text-sm mb-2">
                    Suche nache einem Künstler
                  </p>

                  <div className="flex items-center gap-3">
                    {/* input */}
                    <div className="w-full max-w-sm">
                      <input
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus: outline-yellow-300 text-slate-700 placeholder:text-slate-400"
                        placeholder="Tippen Sie hier..."
                        onChange={(event) =>
                          setSearchInput_Artist(event.target.value)
                        }
                      />
                    </div>

                    {/* ssearch button */}
                    <button
                      onClick={search_artist}
                      className="bg-yellow-500 text-white px-5 py-2 rounded-md hover:bg-yellow-700 transition"
                    >
                      Suche
                    </button>
                  </div>

                  <div className="space-y-2 mt-4 overflow-y-auto max-h-48">
                    {artists.map((artist, i) => {
                      return (
                        <div
                          key={i}
                          className={`rounded-md px-3 py-1 flex gap-2 items-center
                                border ${
                                  artist.isSelected
                                    ? "border-yellow-400 bg-yellow-100"
                                    : "border-slate-200"
                                }`}
                          onClick={() => toggleArtist(artist)}
                        >
                          <img
                            src={artist.images[0]?.url || "/fallback.jpg"}
                            alt={artist.name}
                            className="w-15 h-15"
                          />
                          <div>
                            <p className="text-slate-800 font-semibold text-sm">
                              {artist.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t-2 border-slate-200 mt-4 pt-4">
                    <p
                      onClick={() => saveArtist(1)}
                      className=" text-yellow-500 font-bold w-max mt-4 rounded-full text-sm "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 text-yellow-600 position-relative"
                      >
                        <path d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                      Ausgewählter Interpret Nr. 1<br></br>
                      (bitte der gesuchte Artist hier per Klick einfügen)
                    </p>
                    {userData.favorite_artist && (
                      <div className="mt-4 p-2 border-2 border-yellow-400 rounded-lg flex items-center gap-4">
                        <img
                          src={
                            userData.favorite_artist.favorite_artist1?.image ||
                            "/fallback.jpg"
                          }
                          alt={userData.favorite_artist.favorite_artist1?.name}
                          className="w-15 h-15"
                        />
                        <div>
                          <p className="text-slate-800 font-semibold text-sm">
                            {userData.favorite_artist.favorite_artist1?.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-slate-200 mt-4 pt-4">
                    <p
                      onClick={() => saveArtist(2)}
                      className=" text-yellow-500 font-bold w-max mt-4 rounded-full text-sm "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 text-yellow-600 position-relative"
                      >
                        <path d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                      Ausgewählter Interpret Nr. 2<br></br>
                      (bitte der gesuchte Artist hier per Klick einfügen)
                    </p>
                    {userData.favorite_artist?.favorite_artist2 && (
                      <div className="mt-4 p-2 border-2 border-yellow-400 rounded-lg flex items-center gap-4">
                        <img
                          src={
                            userData.favorite_artist?.favorite_artist2?.image ||
                            "/fallback.jpg"
                          }
                          alt={userData.favorite_artist?.favorite_artist2?.name}
                          className="w-15 h-15"
                        />
                        <div>
                          <p className="text-slate-800 font-semibold text-sm">
                            {userData.favorite_artist?.favorite_artist2?.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setFavoriteBand(false);
                      ArtistinDB();
                    }}
                    className="bg-yellow-400 text-white border-t-2 border-slate-200 px-3 py-2 mt-2  rounded-md hover:bg-yellow-500 transition w-full"
                  >
                    Speichern
                  </button>
                </PopUp>
              </div>
            )}

            <h3
              onClick={() => setShowQuestions(true)}
              className=" ml-4 mr-4 mb-4 mt-4 text-gray-300 text-center font-semibold border-t-2 text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              Fragen
            </h3>
            {showQuestions && (
              <PopUp onClose={() => setShowQuestions(false)}>
                <div className="overflow-y-auto max-h-96">
                  <Questions
                    onClose={() => setShowQuestions(false)}
                  ></Questions>
                </div>
              </PopUp>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
