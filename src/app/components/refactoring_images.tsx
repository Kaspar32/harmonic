"use client";

import { use, useEffect, useState } from "react";
import { convertImagesToBase64 } from "@/lib/convertToImageBase64";
import Image from "next/image";

export default function Refactoring_Images() {
  const [imagesContainer, setImagesContainer] = useState<
    {
      image?: File | null;
      imageBase64?: string;
      position?: number;
      previewUrl?: string;
    }[]
  >([
    { position: 0 },
    { position: 1 },
    { position: 2 },
    { position: 3 },
    { position: 4 },
  ]);

  const [imagesData, setImagesData] = useState<string[]>([]);

  useEffect(() => {
    async function fetchImagesData() {
      const res2 = await fetch(`/api/getPicsData`);
      if (!res2.ok) return;
      const imagesData = await res2.json();

      console.log("Empfangene Bilderdaten:", imagesData);

      setImagesData(imagesData.profile_pics);
    }

    fetchImagesData();
  }, []);

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const file = e.target.files?.[0] as File | null;

    if (!file) return;

    setImagesContainer((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        image: file,
        previewUrl: URL.createObjectURL(file),
      };
      return updated;
    });
  }

  useEffect(() => {
    console.log("Aktueller Zustand der Bilder:", imagesContainer);
  }, [imagesContainer]);

  async function savePictures() {
    const res0 = await fetch("/api/auth");
    if (!res0.ok) return;

    const data = await res0.json();

    const base64Array = await convertImagesToBase64(imagesContainer);

    const payload = imagesContainer.map((img, index) => ({
      id: `${data.uuid}-img-${img.position}`,
      image_base64: base64Array[index],
      position: img.position,
    }));

    const res = await fetch("/api/addprofilepics_refactoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    window.location.reload();
  }

  async function deleteImage(imageName: string) {
    const res0 = await fetch("/api/auth");
    if (!res0.ok) return;

    const data = await res0.json();

    //const imageid = imageName;

    await fetch("/api/deleteImageinFolder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Imageid: imageName }),
    });

    // Aktualisiere den State nach dem löschen

    setImagesData((prev) => prev.filter((img) => !img.startsWith(imageName)));
  }

  return (
    <div className=" flex flex-wrap">
      {imagesContainer.map((img, index) => (
        <div
          key={index}
          className="mb-4 border-2 rounded-2xl ml-2 p-2 border-yellow-200 relative"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, index)}
            className="opacity-100 relative  w-30  text-gray-600"
          />

          <img
            src={
              img?.previewUrl
                ? img.previewUrl
                : imagesData?.[index]
                  ? `/images/${imagesData[index]}`
                  : undefined
            }
            className="w-40 h-40 object-cover"
          />

          {imagesData[index] ? (
            <div onClick={() => deleteImage(`${imagesData[index]}`)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 text-gray-400 absolute top-50 right-18"
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ) : (
            <button onClick={savePictures}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 text-gray-400 absolute top-49 right-18"
              >
                <path
                  fillRule="evenodd"
                  d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
