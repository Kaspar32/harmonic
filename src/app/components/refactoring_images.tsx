"use client";

import { use, useEffect, useState } from "react";
import { convertImagesToBase64 } from "@/lib/convertToImageBase64";
import { positionalKeys } from "framer-motion";

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

  const [uuid, setUuid] = useState<string>("");

  useEffect(() => {
    async function fetchImagesData() {
      const res2 = await fetch(`/api/getPicsData`);
      if (!res2.ok) return;
      const imagesData = await res2.json();

      console.log("Empfangene Bilderdaten:", imagesData);

      setImagesData(imagesData.profile_pics);
      setUuid(imagesData.uuid);
        



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
  }


  async function deleteImage(index: number) {

    const res0 = await fetch("/api/auth");
    if (!res0.ok) return;

    const data = await res0.json();

    const imageid = `${data.uuid}-img-${index}`;

    await fetch("/api/deleteImageinFolder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Imageid: imageid 
       }),
    });


    setImagesContainer((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        previewUrl: undefined,
      };
      return updated;
    });
  }

  const fileMap = new Map(
  imagesData.map(file => [file.split("-img-")[0] + "-img-" + file.split("-img-")[1].split(".")[0], file])
);



  return (
    <div className="m-4">
      <h1>Refactoring Images</h1>

      {imagesContainer.map((img, index) => (

        
        <div key={index} className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, index)}
          />
          <img
            src={img.previewUrl || `/images/${fileMap.get(`${uuid}-img-${img.position}`) || null}`}
            className="w-32 h-32 object-cover"
          />

          <div onClick={() => deleteImage(index)}>Löschen</div>
        </div>
        
      ))}

      <button onClick={savePictures}>Speichere die Bilder</button>
    </div>
  );
}
