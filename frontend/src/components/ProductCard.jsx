import { FaStar } from "react-icons/fa";
import { TbHeartPlus, TbHeartFilled } from "react-icons/tb";
import { useNavigate } from "react-router";
import { useWishlist } from "../contexts/WishlistContext";
import toRupee from "../utils/formatToRupee";
import { motion as Motion } from "motion/react";


const item = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeIn" },
  },
};

 const ProductCard = ({ product, newProduct }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const navigate = useNavigate();
  const isListed = wishlist.some((item) => item._id === product._id);

  return (
    <Motion.div
      variants={item}
      className=" w-full max-w-64 font-funnel bg-white rounded-2xl pb-3 border border-gray-400/20 shadow transition duration-300 hover:shadow-2xl z-0 cursor-pointer "
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className=" relative flex flex-col justify-center items-center p-4 bg-gray-50 rounded-t-2xl border-b border-gray-400/20 ">
        <div className="w-full absolute top-3 flex flex-row-reverse justify-between items-center">
          {new Date(product.createdAt).getDate() === new Date().getDate() &&
            newProduct && (
              <p className="bg-[#CFEBFE] text-[#1254E7] text-sm font-semibold mx-2.5 py-0.5 px-1.5 rounded-md">
                NEW
              </p>
            )}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              isListed
                ? await removeFromWishlist(product._id)
                : await addToWishlist(product);
            }}
            className=" text-pink-500 bg-pink-100 mx-2.5 p-1 rounded-full z-10 cursor-pointer"
          >
            {isListed ? <TbHeartFilled size={24} /> : <TbHeartPlus size={24} />}
          </button>
        </div>
        <img
          src={product.images[0]?.url?.replace(/^http:\/\//i, "https://")?.replace("/upload/", "/upload/f_auto,q_auto/")}
          alt={product.name?.substring(0, 15)}
          loading="lazy"
          fetchPriority="auto"
          width={200}
          height={100}
          className=" pixelated w-[200px] h-[200px] object-scale-down mix-blend-multiply  rounded-md"
        />
        {/* Rating and review count */}
        <div className=" absolute bottom-3 left-3 flex flex-row text-sm p-0.5 bg-white rounded-md shadow-2xs">
          <div className=" flex flex-row items-center gap-1 px-1 font-semibold ">
            {product.numReviews ? (Math.round(product.rating * 2) / 2).toFixed(1) : "New"}{" "}
            <FaStar className="text-[#52be76]" />
          </div>
          <p className="px-1  my-1 border-l border-gray-400/50 font-extralight text-gray-500">
            {product.numReviews || 0}
          </p>
        </div>
      </div>

      <h3 className="text-xs max-sm:text-sm md:text-base font-medium font-poppins text-gray-800 mx-3 my-2 ">
        {product.name?.substring(0, 23)}...
      </h3>
      <p className="text-[#878787] max-sm:text-xs text-xs mx-3 my-2">
        {product.description?.substring(0, 33)}...
      </p>
      <p className="text-orange-500 font-semibold text-lg mx-3 ">
        {toRupee(product.price)}
      </p>
      {product.price < 200 && (
        <p className="w-fit bg-amber-100 text-orange-500 font-funnel font-medium text-sm my-1.5 mx-2.5 px-1.5 py-0.5 rounded-md">
          Hot Deal
        </p>
      )}
      {product.numReviews >= 20 && (
        <p className="w-fit bg-violet-100 text-violet-500 font-funnel font-medium text-sm my-1.5 mx-2.5 px-1.5 py-0.5 rounded-md">
          Trending
        </p>
      )}
    </Motion.div>
  );
}

export default ProductCard;
