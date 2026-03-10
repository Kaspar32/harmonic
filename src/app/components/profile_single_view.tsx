import Image from "next/image";
import { useState, useEffect } from "react";
import { UserType } from "../types/User";
import { useUser } from "@/app/context/UserContext";




type Props = {
selectedProfileIndex: number;
fromWhere: string;
};

export default function ProfileSingleView( {selectedProfileIndex, fromWhere}:Props) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [Images, setImages] = useState<{ image_path: string[]; user_id: string }>();

  const {user}= useUser();

  async function fetchusers() {

    let res1 = await fetch(`/api/getmatchbyid?id=${user?.uuid}`);
   
    

    if(fromWhere=="likesComponent")
    {
       res1 = await fetch(`/api/getlikesbyid?id=${user?.uuid}`);
    }
    
    const data1 = await res1.json();
    const allUsers = await Promise.all(
      data1.map(async (like: { to: string }) => {
        try {
          const res3 = await fetch(`/api/getuserbyid?id=${like.to}`);
          const users = await res3.json();
          return users[0];
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.to}:`,
            err,
          );
          return null;
        }
      }),
    );
    const validUsers = allUsers.map((user) => (Boolean(user) ? user : null));


    console.log("fetchUsers:   ", validUsers);

    setUsers(validUsers);

    const res2 = await fetch(`/api/getallpicsbyuserid?id=${validUsers[selectedProfileIndex].uuid}`);
    if (!res2.ok) return;
    const data2 = await res2.json();
    setImages(data2);
    


  }


  useEffect(() => {

    fetchusers();
  }, [user]);

  const [imageIndex, setImageIndex]= useState(0);

   function handleClick() {
    if (!users[selectedProfileIndex]) return;

    const imageLength = Images?.image_path ? Images.image_path.length : 0;
    
    if (Images && Images?.image_path && Images?.image_path.length === 0) return;
    setImageIndex((prev) => (prev + 1) % imageLength);
  }

  return (
    <div className="flex flex-col items-center overflow-y-auto max-h-[80vh] gap-2 p-4">
      <h2 className="text-2xl font-bold mb-4 text-yellow-600">
        <p className="text-yellow-500">{users[selectedProfileIndex]?.name}</p>
      </h2>

    
      <Image
        onClick={handleClick}
        src={`/images/${Images?.image_path?.[imageIndex] ?? "defaultProfile.png"}`}
        width={1000}
        height={1000}
        alt=""

        className="border-2 border-yellow-500 rounded-2xl p-1"
      />

      <div className="flex gap-4 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6 text-yellow-600"
        >
          <path d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z" />
        </svg>
      </div>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Geschlecht:</span>{" "}
        {users[selectedProfileIndex]?.geschlecht}
      </p>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Alter:</span>{" "}
        {users[selectedProfileIndex]?.alter}
      </p>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Grösse (cm):</span>{" "}
        {users[selectedProfileIndex]?.groesse}
      </p>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Musikgeneres:</span>{" "}
        {users[selectedProfileIndex]?.genres?.join(", ")}
      </p>

      <div className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl p-2">
        <span className="font-semibold text-gray-400">Lieblingslied:</span>
        <div className="border-3 rounded-3xl border-yellow-500 py-1 px-3 text-center  break-normal">
          {users[selectedProfileIndex]?.favorite_track ? (
            <div className="flex items-center gap-1">
              <Image
                src={
                  users[selectedProfileIndex]?.favorite_track?.image ||
                  "/images/Home.png"
                }
                alt="Album Cover"
                height={30}
                width={30}
                style={{ objectFit: "cover" }} // schneidet es sauber zu
                quality={100}
              />
              <div className="md:w-full max-w-[120px]">
                <div className="font-semibold text-yellow-500">
                  {users[selectedProfileIndex]?.favorite_track?.name}
                </div>
                <div className="text-sm text-yellow-500">
                  {users[selectedProfileIndex]?.favorite_track?.artist}
                </div>
              </div>
            </div>
          ) : (
            <p>Keine Daten</p>
          )}
        </div>
      </div>

      <div className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Lieblingsinterpret:</span>{" "}
        <div className="border-3 border-yellow-500 rounded-3xl py-1 px-3 text-center  break-normal">
          {users[selectedProfileIndex]?.favorite_artist ? (
            <div className="flex items-center gap-1 ">
              <Image
                src={
                  users[selectedProfileIndex]?.favorite_artist?.favorite_artist1
                    ?.image || "/images/Home.png"
                }
                alt="Lieblingsinterpret Bild"
                height={30}
                width={30}
                style={{ objectFit: "cover" }} // schneidet es sauber zu
                quality={100}
              />
              <div className="md:w-full max-w-[120px]">
                <div className="font-semibold text-yellow-500">
                  {
                    users[selectedProfileIndex]?.favorite_artist
                      ?.favorite_artist1?.name
                  }
                </div>
              </div>
            </div>
          ) : (
            <p>Keine Daten</p>
          )}
        </div>
      </div>
    </div>
  );
}
