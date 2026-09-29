import { NavLink } from "react-router";
import {
  BsLayoutSidebarInsetReverse,
  BsLayoutSidebarInset,
} from "react-icons/bs";
import { LuLayoutDashboard, LuUsers } from "react-icons/lu";
import { FiShoppingBag } from "react-icons/fi";
import { BsTruck, BsBadgeAd } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";
import { useRef } from "react";

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: LuLayoutDashboard },
  { path: "/admin/products", label: "Products", icon: FiShoppingBag },
  { path: "/admin/banners", label: "Banners", icon: BsBadgeAd },
  { path: "/admin/orders", label: "Orders", icon: BsTruck },
  { path: "/admin/users", label: "Users", icon: LuUsers },
];

const Sidebar = ({ isOpen, setIsOpen, logout }) => {
  const sidebarRef = useRef(null);

  // Handle outside click.
  // useEffect(() => {
  //   const handleOutsideClick = (e) => {
  //     if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
  //       setIsOpen(false);
  //     }
  //   }
  //   document.addEventListener('mousedown', handleOutsideClick);
  //   return () => document.removeEventListener('mousedown', handleOutsideClick);
  // },[]);

  return (
    <div
      ref={sidebarRef}
      className={` min-h-screen flex flex-col flex-shrink-0 transition-all duration-300 text-white p-2.5
              ${
                isOpen
                  ? "max-md:absolute top-0 z-40 w-60 bg-gray-950/80"
                  : "relative  w-15 bg-gray-900 border-r border-gray-600/60"
              }
              `}
    >
      <button
        className=" w-full flex justify-between items-center mb-6 cursor-w-resize"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen && (
          <span className="ml-2 text-lg text-nowrap font-bold ">
            Admin Panel
          </span>
        )}
        {isOpen ? (
          <BsLayoutSidebarInset className=" h-10 w-10 p-2.5 shrink-0 rounded-lg hover:bg-gray-600/20" />
        ) : (
          <BsLayoutSidebarInsetReverse className="h-10 w-10 p-2.5 shrink-0 rounded-lg hover:bg-gray-600/20" />
        )}
      </button>

      <ul className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="w-full">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  ` group relative w-full flex items-center rounded-lg hover:bg-blue-600/10 hover:text-blue-600 ${
                    isActive && "bg-gray-600/10 font-semibold"
                  }`
                }
              >
                <Icon className="h-10 w-10 p-2.5 shrink-0 " />
                {isOpen && <span className=" text-nowrap">{item.label}</span>}
                {/* Tooltip when closed */}
                {!isOpen && (
                  <span
                    className="absolute left-full top-1/2 -translate-y-1/2 z-10 ml-4
             rounded bg-gray-950 px-2 py-1 text-xs text-white
             whitespace-nowrap opacity-0 group-hover:opacity-100
             transition-opacity"
                  >
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="h-full flex items-end justify-center max-md:my-4 ">
        <button
          aria-label="Logout button"
          className=" relative flex items-center group w-full rounded-lg hover:bg-red-600/10 hover:text-red-600 cursor-pointer"
          onClick={async () => await logout()}
        >
          <AiOutlineLogout className="h-10 w-10 p-2.5 shrink-0" />

          {isOpen && "Logout"}
          {!isOpen && (
            <span
              className="absolute left-full top-1/2 -translate-y-1/2 z-10 ml-4
             rounded bg-gray-950 px-2 py-1 text-xs text-white
             whitespace-nowrap opacity-0 group-hover:opacity-100
             transition-opacity"
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
