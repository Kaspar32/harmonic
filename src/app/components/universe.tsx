"use client";


import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function Universe() {

  function newPost()
  {


  }




  return (
    <div className="">
     

      {/*Container mit allen Nachrichten*/}
      <div className="w-full h-full bg-yellow-100 rounded-t-2xl">

       <div className="flex justify-end items-end">
         <svg
           onClick={newPost}
           xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24"
           fill="currentColor"
           className="size-10 active:inset-shadow bg-yellow-50 border-b-2 border-b-amber-100 border-t-2 border-t-white mt-10 font-extrabold text-lg md:text-3x p-2 text-yellow-500 shadow hover:bg-yellow-50 hover:shadow-md rounded-2xl "
         >
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      </div>


      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
      >
        <SwiperSlide>
      <div className="border-2 border-white rounded-2xl w-96 bg-yellow-50 p-2 mb-2 ml-2">

        <div className="flex-col">
        <Image
                  unoptimized
                  src={ "/images/defaultProfile.png"
                  }
                  height={70}
                  width={80}
                  className="rounded-4xl border-2 border-white "
                  alt="Profilbild"
          
                />

                <span className="text-yellow-600 font-bold">Kaspar: </span>
                <span className="text-gray-600">
        Ich gehe an ein Konzert von Smashing Pumpkins wer ist dabei?
        </span></div>

          <Image
                  unoptimized
                  src={ "/images/smshpump.jpg"
                  }
                  height={500}
                  width={500}
                  className="rounded-4xl border-2 border-white "
                  alt="Profilbild"
          
                />

        
        
        
        
        
        </div>
        </SwiperSlide>
        <SwiperSlide>
        test  
        
        </SwiperSlide>
        
        </Swiper>


      </div>



    </div>
  );
}
