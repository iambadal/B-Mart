import { FaStar } from "react-icons/fa";
import { TbUserCheck, TbCalendarClock } from "react-icons/tb";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  useDeleteUserProductReview,
  useFetchUserReviews,
} from "../Hooks/useUser";
import { useAuth } from "../contexts/AuthContext";
import ProductRating from "../components/ProductRating";
import { motion as Motion } from "motion/react";
import { useToast } from "d9-toast";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1, // delay between cards
    },
  },
};

const ReviewsPage = () => {
  const [showReviewModel, setShowReviewModel] = useState({
    close: true,
    id: null,
  });
  const [page, setPage] = useState(1); // current page number.
  const [products, setProducts] = useState([]);
  const { accessToken } = useAuth();
  const limit = 3; // item per page.
  const { showToast } = useToast();
  const Navigate = useNavigate();

  const { data, isLoading } = useFetchUserReviews(page, limit, accessToken);
  const { mutateAsync: deleteReview, isPending } = useDeleteUserProductReview();

  // Handle product reviews delete.
  const handleReviewDelete = async (productId) => {
    await deleteReview(
      { accessToken, productId },
      {
        onSuccess: () => {
          showToast({
            message: "Review is deleted.",
            type: "success",
            duration: 3000,
            closable: true,
            progress: true,
            pauseOnHover: true,
            pauseOnFocusLoss: true,
          });
        },
        onError: () => {
          showToast({
            message: "Error to deleted.",
            type: "error",
            duration: 3000,
            closable: true,
            progress: true,
            pauseOnHover: true,
            pauseOnFocusLoss: true,
          });
        },
      }
    );
  };

  useEffect(() => {
    if (data?.items) {
      setProducts(data.items);
    }
  }, [data, page]);

  return (
    <>
      <div className="w-full relative font-poppins">
        <h1 className="text-lg text-gray-600 font-medium mb-3">
          My Reviews({data.total})
        </h1>
        {/* Reviews */}
        <Motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className=" w-full relative p-2 space-y-5 overflow-y-auto scroll-smooth"
        >
          {products?.length === 0 ? (
            <li>No reviews</li>
          ) : (
            products.map((item, idx) => (
              <Motion.li
                initial={{ opacity: 0 }}
                whileInView={{
                  opacity: 1,
                  transition: { duration: 0.6, ease: "easeIn" },
                }}
                key={item.product._id || idx}
                onClick={() => Navigate(`/product/${item.product._id}`)}
                className=" w-full flex flex-row max-sm:flex-col gap-3 rounded-2xl bg-[#f4f4f8] "
              >
                {/* Image */}
                <div className=" h-22 w-22  shrink-0 p-2 rounded-br-lg rounded-tl-lg outline-6 outline-white inset-shadow-2xs">
                  <img
                    src={
                      item.product?.image?.replace(/^http:\/\//i, "https://") ||
                      "/no-image.png"
                    }
                    alt="product img"
                    loading="lazy"
                    className=" h-full w-full rounded-br-md rounded-tl-md object-contain mix-blend-multiply "
                  />
                </div>
                {/* Details */}
                <div className=" sm:w-full shrink m-2 space-y-3">
                  <h1 className=" text-[15px] text-gray-500">
                    {item.product?.name?.substring(0, 25)}...
                  </h1>
                  <div className=" flex items-center gap-3 mb-2">
                    <div className=" w-fit px-2 rounded-md flex items-center font-medium gap-1.5 bg-blue-300/25 text-gray-950 ">
                      <p>{item.reviews[0]?.rating}</p>
                      <FaStar size={16} className="text-green-600" />
                    </div>

                    <h1 className="text-base font-medium text-gray-700">
                      {item.reviews[0]?.title}
                    </h1>
                  </div>
                  <p className="text-sm text-gray-700 text-wrap">
                    {item.reviews[0]?.comment}
                  </p>
                  {/* Actions */}
                  <div className=" flex flex-row items-center justify-between ">
                    <div className="flex gap-4 text-gray-500/50 transition-colors duration-300">
                      <button
                        className=" hover:text-green-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReviewModel({
                            close: false,
                            id: item.product._id,
                          });
                        }}
                      >
                        <AiFillEdit size={24} />
                      </button>
                      <button
                        disabled={isPending}
                        className=" hover:text-red-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReviewDelete(item.product._id);
                        }}
                      >
                        <AiFillDelete size={24} />
                      </button>
                    </div>
                    {/* Dates */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-poppins font-extralight">
                      <p className=" flex items-center gap-0.5">
                        <TbUserCheck />
                        {item.reviews[0]?.name}
                      </p>
                      <p className=" flex items-center gap-0.5">
                        <TbCalendarClock />
                        {item.reviews[0]?.createdAt?.split("T")[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </Motion.li>
            ))
          )}
        </Motion.ul>

        {/* Page actions button */}
        <div className=" relative w-full h-fit flex items-center justify-center gap-10 my-2 font-medium text-gray-500">
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

      {/* Add rating/review model */}
      {!showReviewModel.close && (
        <ProductRating
          close={() => setShowReviewModel({ close: true, id: null })}
          productId={showReviewModel.id}
        />
      )}
    </>
  );
};

export default ReviewsPage;
