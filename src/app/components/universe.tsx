"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useState } from "react";

export default function Universe() {
  interface Post {
    author: string;
    content: string;
    image: string;
  }
  const [post, setPost] = useState<Post[]>([
    { author: "Kaspar", content: "Hallo das ist ein Post", image: "vdd" },
    { author: "Kaspar", content: "Hallo das ist ein 2ter Post", image: "vdd" },
    { author: "Kaspar", content: "Hallo das ist ein 3ter Post", image: "vdd" },
    { author: "Kaspar", content: "Hallo das ist ein 4ter Post", image: "vdd" },
  ]);

  function newPost() {}

  const [text, setText] = useState("");

  function addComment(index: number) {
  setPost((prevPosts) =>
    prevPosts.map((post, i) =>
      i === index
        ? { ...post, content: `${post.content}\n${text}` }
        : post
    )
  );
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

        <Swiper spaceBetween={20} slidesPerView={3} loop={true}>
          {post.map((post, index) => (
            <SwiperSlide>
              <div className="border-2 border-white rounded-2xl w-96 bg-yellow-50 p-2 mb-2 ml-2">
                <div>{post.author}:</div>

                <div>{post.content}</div>

                <input
      
                  onChange={(e) => setText(e.target.value)}
                ></input>
                <button onClick={()=>{addComment(index)}}>Comment</button>
              </div>
            </SwiperSlide>
          ))}

          <SwiperSlide>test</SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
