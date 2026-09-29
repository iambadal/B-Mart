import React, { useState } from "react";
import { TbHeartPlus, TbHeartFilled } from "react-icons/tb";
import { useWishlist } from "../contexts/WishlistContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ProductGallery({ images = [], product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const { wishlist, addToWishlist } = useWishlist();
  const isListed = wishlist.some((item) => item._id === product._id);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative max-w-md max-sm:max-w-72">
      {/* Main Slider */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation={false}
        spaceBetween={10}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        className=" w-full mb-2 border border-gray-600/15 rounded-md overflow-hidden"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={
                img.url
                  ?.replace(/^http:\/\//i, "https://")
                  ?.replace("/upload/", "/upload/f_auto,q_auto/") ||
                img.thumb ||
                img.src
              }
              alt={`Product ${i + 1}`}
              loading="lazy"
              className="w-full h-80 md:h-96 p-6 object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105 cursor-zoom-in"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        spaceBetween={10}
        slidesPerView={4}
        watchSlidesProgress
        className="sm:border border-gray-600/15 rounded-md mb-6"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={
                img.url
                  ?.replace(/^http:\/\//i, "https://")
                  ?.replace("/upload/", "/upload/f_auto,q_auto/") ||
                img.thumb ||
                img.src
              }
              alt={`Thumbnail ${i + 1}`}
              loading="lazy"
              className="w-20 max-sm:hidden h-20 m-2 p-2 object-scale-down mix-blend-multiply rounded-lg cursor-pointer border border-gray-600/15 hover:border-blue-600"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Wishlist button */}
      <button
        disabled={isListed}
        onClick={(e) => {
          e.stopPropagation();
          addToWishlist(product);
        }}
        className=" absolute top-3 right-3 text-pink-600 bg-pink-600/5 mx-2.5 p-1 rounded-full z-10 cursor-pointer"
      >
        {isListed ? <TbHeartFilled size={24} /> : <TbHeartPlus size={24} />}
      </button>
    </div>
  );
}
