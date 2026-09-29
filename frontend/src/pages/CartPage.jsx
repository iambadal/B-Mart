import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router";
import { AiOutlineDelete } from "react-icons/ai";
import { PiMinus, PiPlus } from "react-icons/pi";
import toRupee from "../utils/formatToRupee";

const CartPage = () => {
  const { cart, addToCart, removeFromCart, decreaseQuantity } = useCart();

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <section className="bg-linear-to-b from-[#b7eaac] to-[#f4f4f8] min-h-screen w-full p-2.5 overflow-y-auto scroll-smooth">
      <div className="p-6 max-sm:p-3 max-w-3xl mx-auto max-sm:rounded-xl rounded-3xl shadow bg-white">
        <h1 className="max-sm:text-xl text-2xl font-bold mb-4">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {cart.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="flex justify-between items-center px-2 py-3 font-funnel border-b border-gray-400/50 "
              >
                <div className=" w-full flex flex-row items-center justify-between gap-5">
                  {/* Product image */}
                  <div
                    className="w-15 h-15 cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <img
                      className="w-full h-full object-center object-contain"
                      src={product.images[0]?.url?.replace(
                        /^http:\/\//i,
                        "https://"
                      )}
                      alt="product image"
                      loading="lazy"
                    />
                  </div>

                  <div className=" w-full flex flex-col gap-2.5 ">
                    <p>
                      {product.name?.substring(0, 20)}... (
                      <span className="px-1 text-orange-400 font-medium ">
                        {toRupee(product.price)} × {quantity}
                      </span>
                      )
                    </p>

                    <div className=" flex flex-row justify-between items-center gap-2">
                      {/* Cart manage actions */}
                      <div className="w-fit px-2 py-1 rounded-full flex items-center gap-3.5 bg-gray-300/50 ">
                        {/* Product quantity decrement */}
                        {quantity > 1 ? (
                          <button
                            className=" text-xl transition hover:text-red-500 focus:text-red-500 active:text-red-500 cursor-pointer"
                            onClick={() => decreaseQuantity(product)}
                          >
                            <PiMinus />
                          </button>
                        ) : (
                          <button
                            className=" text-xl transition hover:text-red-500 focus:text-red-500 active:text-red-500 cursor-pointer"
                            onClick={() => removeFromCart(product._id)}
                          >
                            <AiOutlineDelete className=" opacity-70" />
                          </button>
                        )}

                        {/* Product quantity increment */}
                        {quantity >= 1 && (
                          <button
                            className=" text-xl transition hover:text-green-600 focus:text-green-600 active:text-green-600 cursor-pointer"
                            onClick={() => addToCart(product)}
                          >
                            <PiPlus />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="text-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <h2 className="mt-4 max-sm:text-base text-lg font-bold">
              Total: {toRupee(total.toFixed(2))}
            </h2>

            {/*Checkout button */}
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg w-full mt-4 transition hover:bg-green-700 active:bg-green-700 focus:bg-green-700 cursor-pointer"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default CartPage;
