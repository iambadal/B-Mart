import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { FaOpencart } from "react-icons/fa";
import { FiSearch, FiShoppingCart, FiUser, FiX } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import MiniCart from "./MiniCart";
import { useCart } from "../contexts/CartContext";

const Navbar = ({
  searchTerm,
  setSearchTerm,
  searchbar = true,
  searchContent = false,
  content,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isOpenCart, setIsOpenCart] = useState(false);
  const searchRef = useRef(null);
  const cartBtnRef = useRef();
  const { cartCount } = useCart();

  // Sticky navbar.
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile search when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowMobileSearch(false);
      }
    };
    if (showMobileSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileSearch]);

  return (
    <>
      {/* Navbar */}
      <nav
        className={` w-full flex items-center justify-between px-4 md:px-6 py-3 max-sm:shadow-none shadow-xl font-funnel text-[#334e86] z-50 transition-transform duration-500 ${
          isSticky
            ? "fixed top-0 left-0 bg-white"
            : "absolute top-0 left-0 bg-white "
        }`}
      >
        {/* Logo */}
        <Link
          to={"/"}
          className="flex items-center gap-2 mr-4 text-[20px] md:text-2xl font-bold text-[#334e86]"
        >
          <img src="/vite.svg" alt="B-Mart Logo" className="w-8 h-8 rounded-md shadow-sm" />
          B-Mart
        </Link>

        {/* Desktop Search */}
        {searchbar && (
          <div className=" relative hidden sm:flex flex-col w-full max-w-lg max-h-fit">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg inset-shadow-sm inset-shadow-gray-400/50 focus:outline-none "
                value={searchTerm}
                onChange={setSearchTerm}
                autoFocus={true}
              />
            </div>
            {/* Search content */}
            {searchContent && (
              <div className=" absolute top-16 left-0 w-full flex flex-col gap-3 rounded-b-md bg-white">
                {content?.items?.length < 6 &&
                  content?.items.map((item, idx) => (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={idx}
                      className=" inline-flex items-center gap-4 px-3 py-4 not-last:border-b border-gray-400/25 hover:text-blue-500"
                    >
                      <img
                        src={item.images[0]?.url || "/no-image.png"}
                        alt="product img"
                        width={50}
                        height={50}
                        loading="lazy"
                        className="rounded-md object-center object-cover mix-blend-multiply"
                      />
                      <Link to={`/product/${item._id}`}>
                        {item.name?.substring(0, 25)}...
                      </Link>
                    </Motion.div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Icons */}
        <div className="flex items-center gap-4 ml-4">
          {/* Mobile Search Toggle */}
          {searchbar && (
            <button
              className="sm:hidden p-2.5 group cursor-pointer"
              onClick={() => setShowMobileSearch((prev) => !prev)}
            >
              {showMobileSearch ? (
                <FiX className="w-5 h-5 md:h-6 md:w-6 transition-colors group-hover:text-rose-500 focus:text-red-500 active:text-red-500" />
              ) : (
                <FiSearch className="w-5 h-5 md:h-6 md:w-6 transition-colors group-hover:text-[#52be76] focus:text-[#52be76] active:text-[#52be76]" />
              )}
            </button>
          )}
          {/* Cart button */}
          <button
            ref={cartBtnRef}
            aria-label="Cart Button"
            onClick={() => setIsOpenCart(true)}
            className="relative p-2.5 group cursor-pointer"
          >
            <FiShoppingCart className=" w-5 h-5 md:h-6 md:w-6 transition-colors group-hover:text-[#52be76] focus:text-[#52be76] active:text-[#52be76]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#52be76] text-white text-xs px-1 rounded-full transition-colors group-hover:bg-[#334e86] focus:bg-[#334e86] active:bg-[#334e86]">
                {cartCount}
              </span>
            )}
          </button>

          <Link to="/user" className="p-2.5 group cursor-pointer">
            <FiUser className=" w-5 h-5 md:h-6 md:w-6 transition-colors group-hover:text-[#52be76] focus:text-[#52be76] active:text-[#52be76]" />
          </Link>
        </div>
      </nav>

      {/* Mobile Sticky Search */}
      {searchbar && (
        <AnimatePresence>
          {showMobileSearch && (
            <Motion.div
              ref={searchRef}
              className=" sm:hidden fixed top-[52px] left-0 w-full bg-white my-2 px-4 py-2 shadow-xl z-40"
              initial={{ y: "-10px", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "-10px", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="relative w-full font-funnel">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg inset-shadow-sm inset-shadow-gray-400/50 focus:outline-none "
                  autoFocus={true}
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>
              
              {/* Search content */}
              {searchContent && (
                <div className=" absolute top-16 left-0 w-full flex flex-col gap-3 rounded-b-md bg-white">
                  {content?.items?.length < 6 &&
                    content?.items.map((item, idx) => (
                      <Motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className=" inline-flex items-center gap-4 px-3 py-4 not-last:border-b border-gray-400/25 hover:text-blue-500"
                      >
                        <img
                          src={item.images[0]?.url || "/no-image.png"}
                          alt="product img"
                          width={50}
                          height={50}
                          loading="lazy"
                          className="rounded-md object-center object-cover mix-blend-multiply"
                        />
                        <Link to={`/product/${item._id}`}>
                          {item.name?.substring(0, 25)}...
                        </Link>
                      </Motion.div>
                    ))}
                </div>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      )}
      {/* Mini Cart */}
      <AnimatePresence mode="wait">
        {isOpenCart && (
          <MiniCart
            isOpen={isOpenCart}
            onClose={setIsOpenCart}
            cartBtnRef={cartBtnRef}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
