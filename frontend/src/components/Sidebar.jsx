import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  TbArrowBarRight,
  TbArrowBarToLeft,
  TbBasketBolt,
  TbToolsKitchen3,
} from "react-icons/tb";
import { TbCategoryPlus } from "react-icons/tb";
import { MdOutlineNewLabel } from "react-icons/md";
import { GiLargeDress, GiFruitBowl } from "react-icons/gi";
import { FaMobileScreen } from "react-icons/fa6";
import { motion as Motion } from "motion/react";

const Sidebar = () => {
  const [isActive, setIsActive] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const sidebarRef = useRef(null);
  const Navigate = useNavigate();

  // Handle outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      e.stopPropagation();
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsActive(false);
        setIsShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`${
        isActive ? " translate-x-0 w-[250px]" : " -translate-x-[200px] "
      } bg-white h-80 rounded-r-full border border-gray-400/20 fixed left-0 top-1/5 flex flex-row items-center z-50 transition-transform duration-300`}
    >
      <div
        className={` bg-white w-full h-fit p-3 text-[#334e86] rounded-r-xl space-y-2 `}
      >
        <button className="sidebarBtn" onClick={() => setIsShow((pre) => !pre)}>
          <TbCategoryPlus size={32} />
          Category
        </button>

        {isShow && (
          <ul className="space-y-2">
            <Motion.li
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="sidebarSubBtn"
              onClick={() => Navigate("category/Electronics")}
            >
              <FaMobileScreen />
              Electronics
            </Motion.li>
            <Motion.li
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="sidebarSubBtn"
              onClick={() => Navigate("category/Fashion")}
            >
              <GiLargeDress />
              Fashion
            </Motion.li>
            <Motion.li
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1 }}
              className="sidebarSubBtn"
              onClick={() => Navigate("category/Home")}
            >
              <TbToolsKitchen3 />
              Home & Kitchen
            </Motion.li>
            <Motion.li
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.5 }}
              className="sidebarSubBtn"
              onClick={() => Navigate("category/Grocery")}
            >
              <GiFruitBowl /> Grocery & Essentials
            </Motion.li>
          </ul>
        )}

        <Link
          to={`/featured/${encodeURIComponent("-rating,-numReviews")}`}
          className="sidebarBtn"
        >
          <TbBasketBolt size={32} /> Featured Products
        </Link>

        <Link
          to={`/new/${encodeURIComponent("-createdAt")}`}
          className="sidebarBtn"
        >
          <MdOutlineNewLabel size={32} /> New Arrivals
        </Link>
      </div>

      {/* open/close btn */}
      <button
        className=" mr-2 text-[#334e86]  cursor-pointer"
        onClick={() => {
          setIsShow(false);
          setIsActive((pre) => !pre);
        }}
      >
        {isActive ? (
          <TbArrowBarToLeft size={24} />
        ) : (
          <TbArrowBarRight size={24} />
        )}
      </button>
    </div>
  );
};

export default Sidebar;
