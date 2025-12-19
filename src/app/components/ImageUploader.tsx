"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

type ImageUploaderProps = {
  onImageChange: (image: File | null) => void;
  initialImageUrl?: string;
};

export default function ImageUploader({
  onImageChange,
  initialImageUrl,
}: ImageUploaderProps) {
  // const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImageUrl) {
      setPreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      //   setImage(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      onImageChange(selectedFile);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    //   setImage(null);
    setPreviewUrl(null);
    onImageChange(null);
  };

  return (
    <div className="flex justify-center items-center ">
      <button className="absolute bottom-2  cursor-pointer">
        <Image
          src="/images/circle-plus.svg"
          width={20}
          height={20}
          alt="Add"
          className=""
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="absolute inset-0 opacity-0 cursor-pointer "
        ></input>
      </button>
      <div className="flex flex-wrap">
        {previewUrl && (
          <div className="">
            <Image
              src={previewUrl}
              alt={`preview`}
              width={43}
              height={43}
              className=" h-43 w-45 rounded-2xl  object-cover "
            />

            {/* Löschen-Button oben rechts */}
            <button
              onClick={() => handleRemoveImage()}
              className="absolute left-27 top-40 border-0"
              title="Bild löschen"
            >
              X
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
