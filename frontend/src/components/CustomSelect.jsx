import { useEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import { RiArrowDownWideLine, RiArrowUpWideLine } from "react-icons/ri";

const CustomSelect = ({
  selected,
  handleSelect,
  options,
  className,
  hoverStyle,
  bottom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef();

  // Handle select.
  // const handleSelect = (value) => {
  //   setSelected((prev) => ({ ...prev, category: value }));
  //   setIsOpen(false);
  // };

  // Handle outside click.
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div
      ref={selectRef}
      className="relative w-full min-w-28 text-neutral-50 font-funnel "
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={` flex items-center justify-between px-2 py-1.5 rounded-md text-left cursor-pointer ${className}`}
      >
        {selected || "Select"}
        {isOpen ? <RiArrowUpWideLine /> : <RiArrowDownWideLine />}
      </button>
      {isOpen && (
        <AnimatePresence mode="wait">
          <Motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute ${
              bottom ? "top-full" : "bottom-full"
            } w-full my-1 p-1 z-20 rounded-t-md rounded-b-md space-y-2 opacity-80 backdrop-blur-3xl  ${className} `}
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                name="category"
                onClick={() => {
                  handleSelect(opt.value);
                  setIsOpen(false);
                }}
                className={`px-2.5 py-1.5 rounded-md transition cursor-pointer ${hoverStyle} `}
              >
                {opt.label}
              </li>
            ))}
          </Motion.ul>
        </AnimatePresence>
      )}
    </div>
  );
};

export default CustomSelect;
