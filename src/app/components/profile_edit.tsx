"use client";
import { useEffect, useState } from "react";
import Interests from "../data/Intrests";
import ImageUploader from "./ImageUploader";
import { Pics } from "../types/Pics";
import PopUp from "./popup";
import IchSucheData from "../data/IchSucheData";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { convertImagesToBase64 } from "@/lib/convertToImageBase64";
import Genres from "../data/Genres";
import { UserType } from "../types/User";

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
    groesse: "Auswählen",
    ausbildung: "Auswählen",
    intressen: [],
    ichsuche: [],
    genres: [],
    favorite_track: null,
    favorite_artist: null,
    roles: "",
    fakeUsersEnabled: true,
  });

  // Temporäre Variablen für die Editierfunktion
  const [Temp_Name, setTemp_Name] = useState("");
  const [Temp_Geschlecht, setTemp_Geschlecht] = useState("");
  const [Temp_Alter, setTemp_Alter] = useState("");
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

  const [intressen] = useState(Interests);
  const [genres] = useState(Genres);
  const [ichSucheState] = useState(IchSucheData);

  const [uuid] = useState("");

  // User Daten und Bilder direkt laden
  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth");
      if (!res.ok) return;

      const data = await res.json();
      setUserData((prev) => ({
        ...prev,
        uuid: data.uuid,
        name: data.name,
        geschlecht: data.geschlecht,
        alter: data.alter,
        groesse: data.groesse,
        ausbildung: data.ausbildung,
        intressen: data.intressen,
        ichsuche: data.ichsuche,
        genres: data.genres,
        spotify_data: data.spotify_data,
        favorite_track: data.favorite_track,
        favorite_artist: data.favorite_artist,
      }));

      const res2 = await fetch(`/api/getpicsbyid?id=${data.uuid}`);
      if (!res2.ok) return;
      const imagesData = await res2.json();
      setDataImages((prev) =>
        prev.map((img, i) =>
          imagesData[i] ? { ...img, ...imagesData[i] } : img
        )
      );
    }
    fetchUser();
  }, []);

  //User updaten
  async function updateUser(updates: Partial<typeof userData>) {
    if (!userData.uuid) return;

    const newUserData = { uuid: userData.uuid, ...updates };
    const res = await fetch("/api/updateUserData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUserData),
    });

    if (!res.ok) throw new Error("Update fehlgeschlagen");

    const updatedData = await res.json();
    setUserData((prev) => ({ ...prev, ...updatedData }));
  }

  //Profilbilder logik
  // Constants für das Handle der Reihenfolge der Profilbilder
  const [images, setImages] = useState<
    {
      id: string;
      image?: File | null;
      image_base64?: string;
      user_id?: string;
      position?: number;
    }[]
  >([{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }]);

  const handleImageChange = (id: string, image: File | null) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, image } : img))
    );
  };

  // Konstante und Funktionen für die Reihenfolge der Bilder
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id);
      const newIndex = images.findIndex((item) => item.id === over.id);

      //alert("oldindex:"+oldIndex+" newindex:"+newIndex);

      const newImages = arrayMove(images, oldIndex, newIndex);

      const newImages_1 = arrayMove(dataImages, oldIndex, newIndex);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const updatedImages = newImages.map((img, index) => ({
        ...img,
        position: index, // wichtig für spätere Speicherung
      }));

      const updatedImages_1 = newImages_1.map((img, index) => ({
        ...img,
        position: index, // wichtig für spätere Speicherung
      }));

      //console.log("updateImages_1:", updatedImages_1);

      setImages(updatedImages);
      setDataImages(updatedImages_1);

      const res = await fetch("/api/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updatedImages_1, uuid: uuid }),
      });

      console.log(res);
    }
  };

  async function addPpics() {
    //Konvertieren zu ImageBase64
    const res0 = await fetch("/api/auth");
    if (!res0.ok) return;

    const data = await res0.json();

    const base64Array = await convertImagesToBase64(images);

    const payload = images.map((img, index) => ({
      id: `${data.uuid}-img-${img.id}`,
      image_base64: base64Array[index],
      position: index,
      user_id: uuid,
    }));

    const res = await fetch("/api/addprofilepics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log(result);

    window.location.reload();
  }

  async function deleteImage(id: string) {
    await fetch("/api/deletepicbyid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id, uuid: uuid }),
    });
  }

  const [dataImages, setDataImages] = useState<Pics[]>([
    {
      id: null,
      image: null,
      imageBase64: null,
      userUuid: null,
      position: 0,
    },
    {
      id: null,
      image: null,
      imageBase64: null,
      userUuid: null,
      position: 1,
    },
    {
      id: null,
      image: null,
      imageBase64: null,
      userUuid: null,
      position: 2,
    },
    {
      id: null,
      image: null,
      imageBase64: null,
      userUuid: null,
      position: 3,
    },
    {
      id: null,
      image: null,
      imageBase64: null,
      userUuid: null,
      position: 4,
    },
  ]);

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

  const [serachInput, setSerachInput] = useState("");
  const [serachInput_Artist, setSerachInput_Artist] = useState("");
  const [accessToken, setAccessToken] = useState("");

  type Track = {
    album: {
      images: { url: string }[];
    };
    name: string;
    artists: { name: string }[];

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

  useEffect(() => {
    const authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        process.env.SPOTIFY_CLIENT_ID +
        "&client_secret=" +
        process.env.SPOTIFY_CLIENT_SECRET,
    };

    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  async function search() {
    const artistParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    const Track = await fetch(
      "https://api.spotify.com/v1/search?q=" +
        serachInput +
        "&type=track&limit=10",
      artistParameters
    ).then((response) => response.json());

    setTracks(
      Track.tracks.items.map((t: TrackItem) => ({
        ...t,
        isSelected: false,
      }))
    );
  }

  async function search_artist() {
    const artistParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    const Artists = await fetch(
      "https://api.spotify.com/v1/search?q=" +
        serachInput_Artist +
        "&type=artist&limit=10",
      artistParameters
    ).then((response) => response.json());

    setArtists(
      Artists.artists.items.map((t: ArtistItem) => ({
        ...t,
        isSelected: false,
      }))
    );
  }

  async function toggleTrack(track: Track) {
    setTracks(
      tracks.map((t) =>
        t.id === track.id
          ? { ...t, isSelected: true }
          : { ...t, isSelected: false }
      )
    );
  }

  async function toggleArtist(artist: Artist) {
    setArtists(
      artists.map((t) =>
        t.id === artist.id
          ? { ...t, isSelected: true }
          : { ...t, isSelected: false }
      )
    );
  }

  async function saveTrack() {
    const selectedTrack = tracks.find((t) => t.isSelected);
    if (!selectedTrack) return; // Kein Track ausgewählt

    const trackData = {
      name: selectedTrack.name,
      image: selectedTrack.album?.images?.[0]?.url ?? null, // erstes Album-Bild
      artist: selectedTrack.artists?.[0]?.name ?? null, // erster Künstler
    };

    setUserData((prev) => ({ ...prev, favorite_track: trackData }));

    fetch("/api/savefavoritetrack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trackData),
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

  async function saveArtist() {
    const selectedArtist = artists.find((a) => a.isSelected);
    if (!selectedArtist) return; // Kein Künstler ausgewählt

    const artistData = {
      name: selectedArtist.name,
      image: selectedArtist.images?.[0]?.url ?? null, // erstes Bild
    };

    setUserData((prev) => ({ ...prev, favorite_artist: artistData }));

    fetch("/api/savefavoriteartist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artistData),
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

  return (
    <div className="flex md:flex-row flex-col h-full p-4 border-2 border-yellow-400 rounded-2xl shadow-2xl m-2 bg-yellow-50">
      <h2 className=" text-gray-300 text-3xl font-bold ml-2 ">Bilder</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap">
            {images.map((img, i) => (
              <SortableItem key={img.id} id={img.id}>
                <div className="border-2 w-48 h-48 rounded-2xl mt-2 ml-2 p-2 border-yellow-200 relative">
                  <ImageUploader
                    onImageChange={(image) => {
                      if (image === null) {
                        deleteImage(img.id); // Deine Funktion zum Löschen des Bildes
                      } else {
                        handleImageChange(img.id, image); // Normale Bildbehandlung
                      }
                    }}
                    initialImageUrl={
                      dataImages.find((image) => i === image.position)
                        ?.imageBase64 ?? undefined
                    }
                  />
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {images.some((img) => img.image) && (
        <div className=" text-yellow-500 font-bold border-2 p-2 h-30 rounded-2xl mt-2 animate-pulse">
          Speichere die Bilder nach dem (+) Hinzufügen
        </div>
      )}
      {images.some((img) => img.image) && (
        <button
          onClick={addPpics}
          className="border-2  h-30 m-2 border-gray-300 text-2xl font-bold text-gray-300 hover:bg-white rounded-2xl"
        >
          <div>Bilder speichern (jpg/png)</div>
        </button>
      )}

      <div className="flex flex-wrap md:flex-nowrap gap-2">
        {/*---------- über mich --------*/}
        <div className="flex-1">
          <h2 className="  text-gray-300 text-3xl font-bold m-2 ">Über Mich</h2>

          <div className="mb-4">
            {/* Name */}
            <h3
              onClick={() => setName(true)}
              className="ml-4 mt-4 text-gray-300 text-center font-semibold border-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              Name: {userData.name}
            </h3>
            {showName && (
              <PopUp onClose={() => setName(false)}>
                <h2 className="text-xl font-bold mb-4 text-gray-400 dark:text-gray-400">
                  Name
                </h2>
                <textarea
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
              onClick={() => setAlter(true)}
              className="ml-4 mt-4 text-gray-300 text-center font-semibold border-2 text-2xl hover:bg-white rounded-2xl shadow-lg"
            >
              Alter: {userData.alter}
            </h3>

            {!userData.alter && (
              <div className=" text-yellow-500 font-bold ml-10 border-2 p-2 rounded-2xl mt-2 animate-pulse">
                Du musst dein Alter angegeben, um angezeigt zu werden!
              </div>
            )}
            {showAlter && (
              <PopUp onClose={() => setAlter(false)}>
                <h2 className="text-xl font-bold mb-4  text-gray-400 dark:text-gray-400 ">
                  Alter
                </h2>

                <input
                  type="number"
                  min={18}
                  max={99}
                  defaultValue={userData.alter}
                  onChange={(e) => setTemp_Alter(e.target.value)}
                  className="w-24 text-center text-xl  text-black dark:text-black border-2 border-yellow-300 rounded-xl p-2 appearance-none focus:outline-none"
                />

                <div className="flex gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
                    onClick={async () => {
                      setAlter(false);
                      await updateUser({ alter: Temp_Alter });
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
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
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
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
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
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-2  text-2xl hover:bg-white rounded-2xl shadow-lg"
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
              className="ml-4  mt-4  text-gray-300 text-center font-semibold border-2  text-2xl hover:bg-white rounded-2xl shadow-lg  "
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
                          interest.name
                        )
                          ? userData.intressen.filter(
                              (n: string) => n !== interest.name
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
              className="ml-4  mt-4 text-gray-300 text-center font-semibold border-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
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
                              (n: string) => n !== suche.name
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
          </div>
        </div>

        {/*--------------- Genre -------------*/}
        <div className="flex-1">
          <h2 className=" text-gray-300 text-3xl font-bold m-2 ">Musik</h2>

          <div className="flex-1">
            <h3
              onClick={() => setGenres(true)}
              className="  mt-4 ml-4 mr-4 text-gray-300 text-center font-semibold border-2  text-2xl hover:bg-white rounded-2xl shadow-lg "
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
                              (n: string) => n !== genre.name
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
              className=" ml-4 mr-4 mb-4 mt-4 text-gray-300 text-center font-semibold border-2 text-2xl hover:bg-white rounded-2xl shadow-lg "
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
                      placeholder="Type here..."
                      onChange={(event) => setSerachInput(event.target.value)}
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
                  onClick={saveTrack}
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
              className=" ml-4 mr-4 mb-4 mt-4 text-gray-300 text-center font-semibold border-2 text-2xl hover:bg-white rounded-2xl shadow-lg "
            >
              Lieblingsinterpret
            </h3>

            {showFavoriteBand && (
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
                      placeholder="Type here..."
                      onChange={(event) =>
                        setSerachInput_Artist(event.target.value)
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

                <div className="space-y-2 mt-4 overflow-y-auto max-h-96">
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

                <button
                  onClick={saveArtist}
                  className="bg-yellow-500 text-white px-3 py-2 mt-5 rounded-md hover:bg-yellow-700 transition"
                >
                  Speichern
                </button>

                <div className="border-t-2 border-slate-200 mt-4 pt-4">
                  <p className=" text-yellow-500 font-bold w-max mt-4 rounded-full text-sm ">
                    Ausgewählter Interpret:
                  </p>
                  {userData.favorite_artist && (
                    <div className="mt-4 p-2 border-2 border-yellow-400 rounded-lg flex items-center gap-4">
                      <img
                        src={userData.favorite_artist?.image || "/fallback.jpg"}
                        alt={userData.favorite_artist?.name}
                        className="w-15 h-15"
                      />
                      <div>
                        <p className="text-slate-800 font-semibold text-sm">
                          {userData.favorite_artist?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </PopUp>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none", // wichtig für Mobile!
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
