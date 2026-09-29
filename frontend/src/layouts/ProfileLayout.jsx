import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { FiPower } from "react-icons/fi";
import { LuUserCog } from "react-icons/lu";
import { HiOutlineInboxStack } from "react-icons/hi2";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { useState } from "react";
import { useFetchUsersData } from "../Hooks/useUser";
import { logout } from "../api/AuthAPI";

const ProfileLayout = () => {
  const { accessToken, disabled } = useAuth();
  const [openSidebar, setOpenSidebar] = useState(false);
  const Navigate = useNavigate();
  const { data } = useFetchUsersData(accessToken);

  if (disabled) {
    <p>Please login</p>;
    return;
  }

  const accountLogout = async () => {
    await logout();
    localStorage.clear();
    Navigate(0);
  };

  return (
    <section className=" flex justify-center p-3">
      <Navbar />
      <div className="relative w-full max-w-7xl mt-18 flex flex-row gap-4">
        <aside
          className={` max-sm:fixed top-20 left-0 z-40 flex flex-col gap-4 font-poppins ${
            openSidebar
              ? "max-sm:ml-0 bg-white rounded-md"
              : "max-sm:-ml-[300px]"
          } transition-all duration-300  bg-amber-3000 `}
        >
          <div className=" relative w-full min-w-72 flex flex-row items-center gap-3 p-4 rounded-md shadow bg-white ">
            <img
              src={
                data?.user?.avatar?.url?.replace(/^http:\/\//i, "https://") ||
                "/profile.webp"
              }
              alt="avatar"
              className=" w-16 h-16 rounded-full p-0.5 inset-ring-1 inset-shadow-2xs inset-ring-gray-500/50"
            />
            <div>
              <p className="text-xs text-gray-600">Hello,</p>
              <h1 className="font-medium text-gray-600">
                {data?.user?.username}
              </h1>
            </div>
            {/* Close */}
            {openSidebar && (
              <button
                className="hidden w-11 absolute right-0 p-1.5 rounded-l-full max-sm:inline-flex items-center justify-center bg-[#f4f4f8] text-gray-600 inset-shadow-2xs cursor-pointer"
                onClick={() => setOpenSidebar(false)}
              >
                <GoSidebarExpand size={24} />
              </button>
            )}
            {!openSidebar && (
              <button
                className=" hidden w-11 absolute
             -right-11 p-1.5 rounded-r-full max-sm:inline-flex items-center justify-center bg-white text-gray-600 inset-shadow-2xs cursor-pointer"
                onClick={() => setOpenSidebar(true)}
              >
                <GoSidebarCollapse size={24} />
              </button>
            )}
          </div>

          <div className="  p-4 rounded-md shadow bg-white">
            <h1 className=" inline-flex gap-5 items-center font-medium text-gray-500">
              <LuUserCog size={30} /> ACCOUNT SETTINGS
            </h1>
            <ul className="flex flex-col text-sm text-gray-600 border-b border-gray-400/45 pb-4">
              <li
                className=" pl-13 py-3 hover:bg-blue-400/10 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  Navigate("/user");
                  setOpenSidebar(false);
                }}
              >
                Profile Information
              </li>
              <li
                className=" pl-13 py-3 hover:bg-blue-400/10 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  Navigate("address");
                  setOpenSidebar(false);
                }}
              >
                Manage Addresses
              </li>
              <li
                className=" pl-13 py-3 hover:bg-blue-400/10 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  Navigate("account");
                  setOpenSidebar(false);
                }}
              >
                Manage Account
              </li>
            </ul>
            <h1 className=" inline-flex gap-5 items-center font-medium text-gray-500 mt-4">
              <HiOutlineInboxStack size={30} />
              MY STUFF
            </h1>
            <ul className="flex flex-col text-sm text-gray-600 border-b border-gray-400/45 pb-4">
              <li
                className=" pl-13 py-3 hover:bg-blue-400/10 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  Navigate("orders");
                  setOpenSidebar(false);
                }}
              >
                My Orders
              </li>
              <li
                className=" pl-13 py-3 hover:bg-blue-400/10 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  Navigate("reviews");
                  setOpenSidebar(false);
                }}
              >
                My Reviews & Ratings
              </li>
              <li
                className=" pl-13 py-3 hover:bg-blue-400/10 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  Navigate("wishlist");
                  setOpenSidebar(false);
                }}
              >
                My Wishlist
              </li>
            </ul>
            <button
              className=" mt-4 inline-flex items-center gap-6 font-medium text-gray-500 hover:text-red-500 cursor-pointer"
              onClick={async () => accountLogout()}
            >
              <FiPower size={26} /> Logout
            </button>
          </div>
        </aside>
        <main className=" w-full p-4 rounded-md bg-white shadow">
          <Outlet context={[accountLogout]} />
        </main>
      </div>
    </section>
  );
};

export default ProfileLayout;
