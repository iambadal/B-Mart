import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router";
import { RxCross1 } from "react-icons/rx";
import { RiDeleteBinFill } from "react-icons/ri";
import { TbShoppingCartCog } from "react-icons/tb";
import { MdOutlinePayments } from "react-icons/md";
import { motion as Motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import toRupee from "../utils/formatToRupee";

const MiniCart = ({ isOpen, onClose, cartBtnRef }) => {
  const { cart, removeFromCart } = useCart();
  const cartRef = useRef();
  const navigate = useNavigate();

  // Close cart when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        !cartBtnRef.current.contains(event.target)
      ) {
        onClose(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Motion.div
      ref={cartRef}
      initial={{ y: "-10px", opacity: 0 }}
      animate={{ y: "0", opacity: 1 }}
      exit={{ y: "-10px", opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-20 max-sm:right-0 right-5 w-full max-w-80 bg-white shadow-2xl rounded-xl p-4 font-funnel z-50"
    >
      <div className=" flex flex-row justify-between items-center border-b border-gray-400/50 pb-2">
        <h2 className="text-lg font-bold">Your Cart</h2>
        <button
          onClick={() => onClose((prev) => !prev)}
          className=" p-1.5 rounded-full hover:bg-gray-200/50 hover:text-rose-500 active:bg-gray-200/50 active:text-rose-500 transition cursor-pointer"
        >
          <RxCross1 />
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="text-center text-rose-500 py-2">No items yet</p>
      ) : (
        <div className="space-y-3 py-3 h-fit max-h-72 overflow-y-auto scroll-smooth scrollbar">
          {cart.map(({ product, quantity }) => (
            <div
              key={product._id}
              className="flex justify-between items-center not-last:border-b pb-2 border-gray-200/60 pr-2"
            >
              <div
                className=" flex flex-row justify-center items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <img
                  src={product.images[0]?.url?.replace(
                    /^http:\/\//i,
                    "https://"
                  )}
                  alt="product image"
                  width={50}
                  height={50}
                />
                <div>
                  <p className="font-medium">
                    {product.name?.substring(0, 16)}...
                  </p>
                  <p className="text-sm text-gray-600">
                    {toRupee(product.price)} × {quantity}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(product._id)}
                className="text-[#334e86] hover:text-rose-500 active:text-rose-500 focus:text-rose-500 transition cursor-pointer"
              >
                <RiDeleteBinFill size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className=" w-full flex items-center justify-center gap-1 text-center text-gray-600 font-medium text-base pt-4 hover:text-[#334e86] cursor-pointer"
        onClick={() => navigate("/cart")}
      >
        Manage cart <TbShoppingCartCog />
      </button>
      {/* Checkout button */}
      <button
        disabled={cart.length === 0}
        className="bg-[#52be76] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-white text-base px-6 py-3 rounded-full w-full mt-4 transition hover:bg-[#49a969] cursor-pointer"
        onClick={() => navigate("/checkout")}
      >
        Proceed to Checkout
        <MdOutlinePayments />
      </button>
    </Motion.div>
  );
};

export default MiniCart;
