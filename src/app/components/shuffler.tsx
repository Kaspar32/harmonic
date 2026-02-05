'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageSrc } from "@/lib/getImageSrc";

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}



type ImageItem = { imageBase64?: string };

export default function ImageStack({ images }: { images: ImageItem[] }) {
  const [stack, setStack] = useState<ImageItem[]>([]);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    setStack(images);
  }, [images]);

  const shuffleImages = () => {
    setStack(shuffleArray(stack));
  };

  return (
    <div className="relative w-48 h-48 cursor-pointer">
      {stack.length > 0 &&
        stack?.map((element, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-transform duration-300"
            style={{
              zIndex: stack.length - index,
              transform: `translate(${index * 1}px, ${index * 1}px)`,
            }}
          >
            <Image
              src={
                element?.imageBase64
                  ? getImageSrc(element.imageBase64)
                  : "/images/defaultProfile.png"
              }
              alt="Profilbild"
              fill
              className="object-cover border-2 border-yellow-500 rounded-2xl"
              onClick={() => setShowImage(true)}
            />

            {showImage && (
              <div
                className="fixed inset-0 position top-65 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]"
                onClick={() => setShowImage(false)}
              >
                <img
                  src={
                    element?.imageBase64
                      ? getImageSrc(element.imageBase64)
                      : "/images/defaultProfile.png"
                  }
                  className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl"
                  alt="Profilbild groß"
                />
              </div>
            )}

            
          </div>
        ))}

        
    </div>
  );
}
