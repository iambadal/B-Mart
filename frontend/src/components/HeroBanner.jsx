import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useFetchBanners } from "../Hooks/useUser";
import { Link } from "react-router";

const HeroBanner = () => {
  const { data } = useFetchBanners();

  const banners = data?.banner ?? [];

  return (
    <div className="hero-shell relative mx-auto mt-[70px] p-2 bg-linear-to-b from-[#f4f4f8] to-[#eef2ff]">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        {banners.length > 0 ? (
          banners.map((banner, idx) => (
            <SwiperSlide key={banner._id || idx}>
              <div className="hero-slide relative max-sm:aspect-[3/2] aspect-[12/2] rounded-2xl m-2 overflow-hidden">
                <img
                  src={banner.banner?.url
                    ?.replace(/^http:\/\//, "https://")
                    ?.replace("/upload/", "/upload/f_auto,q_auto/")}
                  alt={banner.title || "Banner image"}
                  loading="eager"
                  fetchPriority="high"
                  width={1280}
                  height={384}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Overlay */}
                <div className="w-full h-full absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white px-4">
                  <div className="text-center">
                    <h2 className="max-sm:text-xl text-2xl font-bold">
                      {banner.title}
                    </h2>

                    <p className="max-sm:text-base text-lg mt-2">
                      {banner.subtitle}
                    </p>

                    <Link
                      to={`/category/${banner.category}`}
                      className="mt-4 inline-block bg-[#7ed88a20] backdrop-blur px-4 py-2 rounded-lg hover:bg-[#52be76] active:bg-[#52be76] cursor-pointer transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          /* --- THIS IS YOUR NEW CUSTOM PORTFOLIO FALLBACK BANNER --- */
          <SwiperSlide>
            <div className="hero-slide hero-fallback relative max-sm:aspect-[3/2] aspect-[12/2] rounded-2xl m-2 overflow-hidden bg-[#334e86]">
              <div className="w-full h-full absolute inset-0 flex flex-col justify-center items-center text-white px-4">
                <div className="text-center">
                  <h2 className="max-sm:text-2xl text-4xl font-bold text-white tracking-wide">
                    Welcome to B-Mart
                  </h2>
                  <p className="max-sm:text-base text-lg mt-3 text-blue-100 max-w-2xl mx-auto">
                    A premium e-commerce experience. Developed and curated by <span className="font-bold text-white">Badal Pujhari</span>.
                  </p>
                  <a href="#featured" className="mt-6 inline-block bg-[#52be76] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#44a062] active:scale-95 transition-all shadow-md">
                    Start Shopping
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default HeroBanner;
