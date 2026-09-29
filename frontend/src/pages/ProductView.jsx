import { useCart } from "../contexts/CartContext";
import { useNavigate, useParams } from "react-router";
import { useFetchProduct, useFetchProductById } from "../Hooks/useProducts";
import { TbShoppingCartCog } from "react-icons/tb";
import { MdOutlinePayments } from "react-icons/md";
import { LuMailQuestion } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { RiStickyNoteAddLine, RiSecurePaymentFill } from "react-icons/ri";
import { TbUserCheck, TbCalendarClock } from "react-icons/tb";
import Navbar from "../components/Navbar";
import { useEffect, useMemo, useState , lazy, Suspense} from "react";
import ProductRating from "../components/ProductRating";
import { useAuth } from "../contexts/AuthContext";
import ProductCard from "../components/ProductCard";
import { motion as Motion } from "motion/react";
const ProductGallery = lazy(() => import("../components/ProductGallery"));

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

const ProductDetail = () => {
  const [openRatingModel, setOpenRatingModel] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const { user, disabled } = useAuth();

  const {
    data: product,
    isLoading,
    isFetched,
  } = useFetchProductById(productId);

  const [filters, setFilters] = useState({ tags: [] });

  useEffect(() => {
    if (product?.tags?.length > 1) {
      setFilters({ tags: product.tags.slice(1) });
    }
  }, [product?.tags]);

  const { data: similarProducts, isFetching } = useFetchProduct(
    filters,
    0,
    5,
    "",
    user?.role
  );

  
  // Memoize gallery to prevent remounts on filters update.
  const gallery = useMemo(() => {
    if (!product?.images?.length) return null;
    return <ProductGallery images={product.images} product={product} />;
  }, [product?.images]);

  const handleBuyNow = () => {
    // Direct Checkout without cart.
    navigate("/checkout", { state: { buyNow: [{ product, quantity: 1 }] } });
    // Add to cart first then checkout.
    // addToCart(product, 1);
    // navigate("/checkout");
  };

  // fallback if there isa no project.
  if (!product) return;

  return (
    <>
      <Navbar searchbar={false} />
      <div className=" relative min-h-screen max-sm:p-3 p-6 mt-16 bg-white bg-blue-3000 font-poppins ">
        <div className=" grid xl:grid-cols-2 gap-3 max-sm:gap-0 mb-8">
          {/* Product Images */}
          <div className=" w-full h-fit flex flex-col items-center gap-3 bg-green-3000 ">
            <Suspense fallback={<p>Loading...</p>}>
              {gallery}
            </Suspense>
            
            {/* Product actions */}
            <div className=" bg-white max-sm:fixed bottom-0 left-0 w-full flex justify-center gap-6 p-3 ">
              <button
                onClick={() => {
                  addToCart(product, 1);
                }}
                className=" w-full max-w-40 outline outline-gray-600/20 text-gray-800 flex items-center justify-center gap-2 px-3 py-2.5 max-sm:text-[15px] text-lg font-medium rounded-lg cursor-pointer"
              >
                <TbShoppingCartCog /> Add to cart
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full max-w-40 outline outline-yellow-500/10 text-gray-800 bg-yellow-400 flex items-center justify-center gap-2 px-3 py-2.5 max-sm:text-[15px] text-lg font-medium rounded-lg cursor-pointer"
              >
                <MdOutlinePayments /> Buy now
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className=" max-sm:p-0 md:h-[600px] overflow-y-auto scroll-auto bg-amber-3000">
            <Motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="p-3 "
            >
              <ul className="flex flex-row flex-wrap gap-4 max-sm:gap-2 mb-3 text-xs text-gray-500">
                <li
                  className=" hover:text-blue-500 active:text-blue-500 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  {"Home >"}
                </li>
                {isFetched &&
                  product.tags.map((t, i) => (
                    <li
                      key={i}
                      className=" hover:text-blue-500 active:text-blue-500 transition duration-200 cursor-pointer"
                      onClick={() => navigate(`/tags/${t}`)}
                    >
                      {t}
                      {","}
                    </li>
                  ))}
              </ul>

              {/* Title */}
              <h1 className=" text-lg max-sm:text-base font-medium mb-3 text-wrap">
                {product.name}
              </h1>

              {/* Rating and review count */}
              <div className=" flex flex-row gap-3 font-poppins mb-3">
                <div className=" px-2 rounded-md flex items-center gap-1.5 bg-green-600 text-gray-50 ">
                  <p>{(Math.round(product.rating * 2) / 2).toFixed(1)}</p>
                  <FaStar size={16} />
                </div>
                <p className=" font-extralight text-slate-600">
                  {`${product.numReviews} reviews`}
                </p>
              </div>

              {/* Price */}
              <p className="text-xl font-semibold mb-3">₹{product.price}</p>
              {/* Description */}
              <h2 className="text-lg font-poppins font-semibold text-gray-700 mb-1 ">
                Description
              </h2>
              <Motion.p
                variants={item}
                className="text-gray-600 max-sm:text-sm text-wrap mb-3 "
              >
                {product.description}
              </Motion.p>

              {/* All details */}
              <h2 className="text-lg font-poppins font-semibold text-gray-700 mb-1.5 ">
                All details
              </h2>
              <ul className=" grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-3 gap-6 mb-3 border border-gray-600/20 rounded-lg p-3 inset-shadow-2xs inset-shadow-gray-600/20">
                {Object.keys({
                  ...product.metadata?.dimensions,
                  ...product.metadata?.extra,
                }).map((key, i) => (
                  <Motion.li
                    variants={item}
                    key={i}
                    className=" grid grid-cols-2 content-center text-gray-500 py-2 max-sm:px-2 px-3 rounded-md bg-blue-300/5"
                  >
                    <span className=" content-center font-medium text-gray-600 pr-3">
                      {key} :
                    </span>
                    <span className="content-center text-right">
                      {product.metadata?.dimensions[key] ||
                        product.metadata?.extra[key]}
                    </span>
                  </Motion.li>
                ))}
              </ul>

              {/* Rating */}
              <h2 className="text-lg font-poppins font-semibold text-gray-700 mb-1.5 ">
                Rating and reviews
              </h2>
              <div className=" flex items-center justify-between mb-3">
                <p className=" flex items-center gap-1.5 text-gray-600">
                  <FaStar size={18} className="text-yellow-500" />
                  {(Math.round(product.rating * 2) / 2).toFixed(1)} based on{" "}
                  {product.numReviews} reviews
                </p>

                {/* Review button */}
                {!disabled && (
                  <button
                    className="bg-amber-600/5 text-amber-400 p-2 rounded-full transition-colors hover:bg-amber-600/10 active:bg-amber-600/10 cursor-pointer"
                    onClick={() => setOpenRatingModel(true)}
                  >
                    <RiStickyNoteAddLine size={20} />
                  </button>
                )}
              </div>

              {/* Reviews */}
              {product.reviews.length > 0 &&
                product.reviews.map((r, i) => {
                  if (i <= 6) {
                    return (
                      <Motion.div
                        variants={item}
                        key={i}
                        className=" border border-gray-600/25 rounded-md p-2 my-3"
                      >
                        <div className=" flex items-center gap-2 mb-2">
                          <div className=" w-fit px-2 rounded-md flex items-center font-medium gap-1.5 bg-blue-300/25 text-gray-950 ">
                            <p>{r.rating}</p>
                            <FaStar size={16} className="text-green-600" />
                          </div>
                          ~
                          <h1 className="text-base font-medium text-gray-800">
                            {r.title}
                          </h1>
                        </div>

                        <p className=" my-3 text-sm font-light text-wrap">
                          {r.comment}
                        </p>

                        <div className=" flex items-center justify-end gap-4 text-xs text-slate-600 font-poppins font-extralight">
                          <p className=" flex items-center gap-0.5">
                            <TbUserCheck />
                            {r.name}
                          </p>
                          <p className=" flex items-center gap-0.5">
                            <TbCalendarClock />
                            {r.createdAt.split("T")[0]}
                          </p>
                        </div>
                      </Motion.div>
                    );
                  }
                })}
              <p className=" text-center text-blue-800/70 hover:text-blue-700 cursor-pointer">
                View all reviews
              </p>

              {/* FAQ */}
              <h2 className=" w-full inline-flex items-center justify-between text-lg font-poppins font-semibold text-gray-700 my-2 ">
                Questions and Answers
                <button className="bg-blue-600/5 text-blue-400 p-2 rounded-full transition-colors hover:bg-blue-600/10 active:bg-blue-600/10 cursor-pointer">
                  <LuMailQuestion size={20} />
                </button>
              </h2>
              {product.questionAnswer.length > 0 &&
                product.questionAnswer.map((qa, i) => {
                  if (i <= 6) {
                    return (
                      <Motion.div
                        variants={item}
                        key={i}
                        className="border border-gray-600/25 rounded-md p-2 my-3 space-y-2 "
                      >
                        <h1 className="font-medium">Q: {qa.question}</h1>
                        <p className="text-wrap text-gray-700">
                          A: {qa.answer}
                        </p>
                      </Motion.div>
                    );
                  }
                })}

              <p className=" text-center text-blue-800/70 hover:text-blue-700 cursor-pointer">
                View all FAQ
              </p>

              <>
                <p className=" flex flex-wrap items-center gap-1 text-sm justify-center text-center my-4 text-gray-600">
                  <RiSecurePaymentFill size={28} />
                  Safe and Secure Payments. 100% Authentic products.
                </p>
              </>
            </Motion.div>
          </div>
        </div>
        {/* Similar products */}
        <div className=" p-3 border border-gray-600/25 rounded-md">
          <h1 className="text-lg max-sm:text-base font-medium mb-3 font-poppins text-gray-700">
            Similar Products
          </h1>
          <div className=" flex flex-wrap items-center max-sm:justify-center gap-6 max-sm:mb-15">
            {/* Product lists */}
            {similarProducts?.items?.length === 0 ? (
              <p>No products available</p>
            ) : (
              similarProducts.items.map((item, idx) => {
                if (item._id.toString() !== productId) {
                  return (
                    <Motion.div
                      variants={container}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.3 }}
                      key={idx}
                      className=" w-64"
                    >
                      <ProductCard key={idx} product={item} />{" "}
                    </Motion.div>
                  );
                }
              })
            )}
          </div>
        </div>
        {openRatingModel && (
          <ProductRating
            productId={productId}
            close={() => setOpenRatingModel(false)}
          />
        )}
      </div>
    </>
  );
};

export default ProductDetail;
