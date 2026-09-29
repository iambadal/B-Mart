import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useLocation, useNavigate } from "react-router";
import { CgSpinner } from "react-icons/cg";
import { MdOutlinePayment } from "react-icons/md";
import { TbDeviceMobile } from "react-icons/tb";
import { BsCashStack } from "react-icons/bs";
import { RiSecurePaymentFill } from "react-icons/ri";
import toRupee from "../utils/formatToRupee";
import { useCreateOrder } from "../Hooks/useOrders";
import { useToast } from "d9-toast";
import { useCreateRazorpayOrder, useVerifyPayment } from "../Hooks/usePayment";
import { useState } from "react";

const CheckoutPage = () => {
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const { cart } = useCart();
  const { user, accessToken: token, disabled } = useAuth();
  const location = useLocation();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const { mutateAsync: createRazorpayOrder, isPending: isLoading } =
    useCreateRazorpayOrder();
  const { mutateAsync: verifyPayment, isPending: isSubmitting } =
    useVerifyPayment();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // if "buy now", use that, else fallback to cart.
  const checkoutItems = location.state?.buyNow || cart;

  // Total price.
  const total = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (disabled) {
       showToast({
         message: "Please login your account.",
         type: "warning",
         duration: 2000,
         closable: true,
         progress: true,
       });
       return;
    }

    // collect shipping information.
    const formData = new FormData(e.target);
    const shippingData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      state: formData.get("state"),
      pinCode: formData.get("pinCode"),
      country: formData.get("country"),
      address: formData.get("address"),
    };

    const data = {
      items: checkoutItems?.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images[0]?.url,
        price: i.product.price,
        qty: i.quantity,
      })),
      shippingAddress: shippingData,
      totals: {
        itemsPrice: total,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: total,
      },
      COD: cashOnDelivery,
    };

    // Create order in DB & reserve stock.
    const order = await createOrder({ data, token });

    if (order && cashOnDelivery) {
      showToast({
        message: "Order confirmed.",
        type: "success",
        duration: 3000,
        closable: true,
        progress: true,
      });
      setTimeout(() => {
        navigate("/user/orders");
      }, 2000);
    }

    if (!cashOnDelivery) {
      // Create razorpay order.
      const razorpayData = await createRazorpayOrder({
        orderId: order?._id,
        amount: total,
        token,
      });

      if (!razorpayData.id) throw new Error("Failed to create Razorpay order");

      // Open Razorpay checkout.
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "My Cart",
        description: "Order Payment",
        order_id: razorpayData.id,
        handler: async (response) => {
          // Verify payment on backend...
          const verifyData = await verifyPayment({
            data: { ...response, meta: { orderId: order._id } },
            token,
          }); 

          if (verifyData.status === "success") {
            showToast({
              message: "Payment successful! Order confirmed.",
              type: "success",
              duration: 3000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });

            setTimeout(() => {
              navigate("/user/orders");
            }, 2000);
          } else if (verifyData.status === "failure") {
            showToast({
              message: "Payment verification failed!",
              type: "error",
              duration: 3000,
              closable: true,
              progress: true,
              pauseOnHover: true,
              pauseOnFocusLoss: true,
            });
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        },
        prefill: {
          name: shippingData.name,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        showToast({
          message: response.error?.description,
          type: "error",
          duration: 3000,
          closable: true,
          progress: true,
          pauseOnHover: true,
          pauseOnFocusLoss: true,
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      });
      rzp.open();
    }
  };

  return (
    <div className=" p-6 max-sm:p-3 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* left - Order Summary */}
      <div className="bg-gray-50 shadow p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        {checkoutItems.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            {checkoutItems.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="flex justify-between border-b py-2"
              >
                <span>
                  {product.name?.substring(0, 16)}...{" "}
                  <span className=" text-blue-800">× {quantity}</span>
                </span>
                <span>{toRupee((product.price * quantity).toFixed(2))}</span>
              </div>
            ))}

            <div className="flex justify-between mt-4 text-lg font-bold">
              <span>Total:</span>
              <span>{toRupee(total?.toFixed(2))}</span>
            </div>
          </>
        )}
      </div>

      {/* right - Shipping Form */}
      <form
        onSubmit={handlePlaceOrder}
        className="space-y-5 bg-white shadow p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold mb-2">Shipping Details</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          defaultValue={user?.username || ""}
          required
          className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          defaultValue={user?.email || ""}
          required
          className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          required
          className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md"
        />

        <div className=" grid grid-cols-2 max-sm:grid-cols-1 gap-5">
          <input
            type="text"
            name="city"
            placeholder="City"
            required
            className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md"
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            required
            className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md"
          />
          <input
            type="number"
            name="pinCode"
            placeholder="Pin Code"
            required
            className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            required
            className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md"
          />
        </div>

        <textarea
          name="address"
          placeholder="Full Address"
          required
          className="w-full p-2 ring-1 ring-gray-600 focus:ring-green-600 focus:outline-4 outline-green-600/15 rounded-md h-24"
        ></textarea>

        <h1 className="inline-flex items-center gap-2 font-medium text-lg mb-4 ">
          <MdOutlinePayment size={24} /> Payment Method
        </h1>

        {/* COD */}
        <div
          className={`flex flex-row items-center gap-3 px-3 py-2 rounded-md  text-gray-700 transition duration-300 cursor-pointer ${
            cashOnDelivery
              ? " bg-green-50 border-2 border-green-400"
              : "border border-gray-500/40"
          } `}
          onClick={() => setCashOnDelivery(true)}
        >
          <BsCashStack
            size={24}
            className={cashOnDelivery && "text-green-400"}
          />
          <div className=" flex flex-col gap-0.5 ">
            <h2 className="font-medium text-sm">Cash On Delivery</h2>
            <p className="text-xs">Pay when you receive your order</p>
          </div>
        </div>

        {/* Online */}
        <div
          className={`flex flex-row items-center gap-3 px-3 py-2 rounded-md  text-gray-700 transition duration-300 cursor-pointer ${
            !cashOnDelivery
              ? " bg-blue-50 border-2 border-blue-400"
              : "border border-gray-500/40"
          } `}
          onClick={() => setCashOnDelivery(false)}
        >
          <TbDeviceMobile
            size={24}
            className={!cashOnDelivery && "text-blue-400"}
          />
          <div className=" flex flex-col gap-0.5 ">
            <h2 className="font-medium text-sm">Online Payment</h2>
            <p className="text-xs">Secure payment with Razorpay</p>
          </div>
        </div>

        <button
          disabled={isLoading || isPending || isSubmitting}
          type="submit"
          className="bg-green-600 disabled:bg-neutral-400/50 text-white px-6 py-3 rounded-lg w-full flex items-center justify-center gap-2 font-semibold hover:bg-green-700 transition cursor-pointer"
        >
          {isPending ? (
            <>
              <CgSpinner className=" animate-spin" /> Processing...
            </>
          ) : (
            "Place Order"
          )}
        </button>
        <p className=" w-full inline-flex items-center justify-center gap-1 max-sm:text-xs text-center rounded-md bg-blue-500/10 px-2 py-1 text-blue-500">
          <RiSecurePaymentFill className=" shrink-0" />
          Your payment information is securely encrypted
        </p>
      </form>
    </div>
  );
};

export default CheckoutPage;
