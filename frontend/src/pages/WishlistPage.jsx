import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router";
import { MdDeleteOutline } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import toRupee from "../utils/formatToRupee";
import { useFetchUserWishlist } from "../Hooks/useUser";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { motion as Motion } from "motion/react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1, // delay between cards
    },
  },
};

const WishlistPage = () => {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [page, setPage] = useState(1); // current page number.
  const [wishlists, setWishlists] = useState([]);
  const { accessToken } = useAuth();
  const limit = 6; // item per page.
  const { data, isLoading } = useFetchUserWishlist(page, limit, accessToken);

  useEffect(() => {
    if (data?.items) {
      setWishlists(data.items);
    }
  }, [data, page]);

  return (
    <div className=" w-full relative font-poppins ">
      <h1 className="text-lg text-gray-600 font-medium mb-3">
        Wishlist({data.total})
      </h1>
      <div className="w-full relative py-2 overflow-y-auto scroll-smooth">
        <Motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-sm:gap-5"
        >
          {wishlists.length === 0 ? (
            <p>No item in wishlist</p>
          ) : (
            wishlists.map((p) => (
              <Motion.div
                initial={{ opacity: 0 }}
                whileInView={{
                  opacity: 1,
                  transition: { duration: 0.6, ease: "easeIn" },
                }}
                onClick={() => navigate(`/product/${p.product._id}`)}
                key={p._id}
                className=" mx-auto w-56 p-2 rounded-4xl bg-[#f4f4f8] z-0 transition hover:shadow-xl active:shadow-xl focus:shadow-xl cursor-pointer"
              >
                <div className="relative bg-gray-200 p-2 rounded-3xl">
                  <img
                    src={p.product.images[0]?.url?.replace(
                      /^http:\/\//i,
                      "https://"
                    )}
                    alt={p.product.name?.substring(0, 10)}
                    loading="lazy"
                    className=" h-[200px] w-[200px] object-center object-contain mix-blend-multiply "
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(p.product._id);
                    }}
                    className=" absolute top-2 right-2 p-1 rounded-full bg-red-600/20 text-red-500 z-10 transition hover:bg-red-300 active:bg-red-300 cursor-pointer"
                  >
                    <MdDeleteOutline size={20} />
                  </button>
                </div>

                <p className="max-sm:text-base font-medium mt-2 mx-2.5">
                  {p.product.name?.substring(0, 15)}...
                </p>
                <div className="mt-2 mx-2.5  flex flex-row gap-2">
                  <p className=" flex items-center gap-1">
                    {Math.round((p.product.rating * 2) / 2).toFixed(1)}
                    <FaStar color="#52be76" />
                  </p>
                  <p className="text-orange-500 font-semibold">
                    {toRupee(p.product.price)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(p.product);
                  }}
                  className="w-full text-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/25 font-medium my-3 p-2 rounded-4xl z-10 transition  cursor-pointer"
                >
                  Add to Cart
                </button>
              </Motion.div>
            ))
          )}
        </Motion.div>
      </div>
      {/* Page actions button */}
      <div className=" relative w-full h-fit flex items-center justify-center gap-10 my-3 font-medium text-gray-500">
        <button
          disabled={page === 1 || isLoading}
          className=" w-fit h-fit hover:text-orange-400 cursor-pointer"
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        <p className=" h-fit w-fit text-sm font-funnel">{page}</p>
        <button
          disabled={page === data.totalPages || isLoading}
          className=" w-fit h-fit hover:text-green-400 cursor-pointer"
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WishlistPage;
