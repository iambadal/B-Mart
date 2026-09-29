import { useState } from "react";
import { FaNoteSticky, FaStar, FaCircleDot } from "react-icons/fa6";
import { useAuth } from "../contexts/AuthContext";
import { useFetchUserOrders } from "../Hooks/useUser";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import toRupee from "../utils/formatToRupee";
import ProductRating from "../components/ProductRating";
import { motion as Motion } from "motion/react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1, // delay between cards
    },
  },
};

const item = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeIn" },
  },
};

const OrdersPage = () => {
  const [showReviewModel, setShowReviewModel] = useState({
    close: true,
    id: null,
  });
  const [page, setPage] = useState(1); // current page number.
  const [orders, setOrders] = useState([]);
  const { accessToken } = useAuth();
  const limit = 3; // item per page.
  const { data, isLoading } = useFetchUserOrders(page, limit, accessToken);
  const Navigate = useNavigate();

  
  useEffect(() => {
    if (data?.items) {
      setOrders(data.items);
    }
  }, [data, page]);

  return (
    <>
      <div className="w-full relative font-poppins">
        <h1 className="text-lg text-gray-600 font-medium mb-3">
          My Orders({data.total})
        </h1>
        <Motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className=" w-full relative p-2 space-y-5 overflow-y-auto scroll-smooth"
        >
          {orders.length === 0 ? (
            <li>No orders available</li>
          ) : (
            orders.map((order, idx) => (
              <Motion.li
                variants={item}
                key={order.order_id || idx}
                onClick={() => Navigate(`/product/${order.product_id}`)}
                className=" w-full flex flex-row max-sm:flex-col gap-3 rounded-2xl bg-[#f4f4f8] overflow-hidden"
              >
                {/* Image */}
                <div className=" h-22 w-22 shrink-0 p-2 rounded-br-lg rounded-tl-lg outline-6 outline-white inset-shadow-2xs">
                  <img
                    src={
                      order.image?.replace(/^http:\/\//i, "https://") ||
                      "/no-image.png"
                    }
                    alt="product img"
                    loading="lazy"
                    className=" w-full h-full rounded-br-md rounded-tl-md object-contain mix-blend-multiply "
                  />
                </div>
                {/* Details */}
                <div className="m-4 w-full flex flex-row max-sm:flex-col justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    <h1 className=" text-sm text-gray-600">
                      {order.name?.substring(0, 25)}...
                    </h1>
                    <p className="text-xs text-gray-500">
                      Quantity: {order?.qty}
                    </p>
                    <p className="text-sm text-gray-600">
                      {toRupee(order.totalPrice)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className=" inline-flex items-center gap-2 text-sm text-gray-600">
                      <FaCircleDot size={18} className="text-green-600" />
                      {`${order.status} on ${order.updatedAt?.split("T")[0]}`}
                    </p>
                    <p className=" inline-flex items-center gap-2 text-xs text-gray-500">
                      <FaNoteSticky size={16} />{" "}
                      {order.note || "content unavailable"}
                    </p>
                    {/* Actions */}
                    <button
                      className=" w-fit inline-flex items-center gap-2 text-sm px-2 py-1 rounded-full text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer"
                      onClick={(e) =>{
                        e.stopPropagation();
                        setShowReviewModel({
                          close: false,
                          id: order.product_id,
                        })
                      }}
                    >
                      <FaStar size={18} /> Rate & Review
                    </button>
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

export default OrdersPage;
