import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BiSolidEdit, BiSolidCamera } from "react-icons/bi";
import { CgClose, CgSpinner } from "react-icons/cg";
import { MdOutlineSecurity } from "react-icons/md";
import { useUpdateUserData } from "../Hooks/useUser";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "d9-toast";
import { useNavigate } from "react-router";

const Profile = () => {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditModeOn, setIsEditModeOn] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    url: "",
    public_id: "",
    status: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarURL, setAvatarURL] = useState("");
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(["user", accessToken]);
  const { mutateAsync: updateUserData, isPending } = useUpdateUserData();
  const { showToast } = useToast();

  // Handle file change.
  const handleFileChange = (e) => {
    const IMG = e.target.files[0];
    setAvatar(IMG);
    // Set preview url
    const objURL = URL.createObjectURL(IMG);
    setAvatarURL(objURL);
  };

  // Handle form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", userData.name);
    formData.append("email", userData.email);
    formData.append("phone", userData.phone);
    if (avatar) formData.append("avatar", avatar);
    if (userData.public_id) formData.append("public_id", userData.public_id);

    await updateUserData(
      { fd: formData, accessToken },
      {
        onSuccess: (result) => {
          showToast({
            message: result.message || (result.status === "success" ? "Your data is successfully updated." : "Profile update failed."),
            type: result.status === "success" ? "success" : "error",
            duration: 3000,
            closable: true,
            progress: true,
            pauseOnHover: true,
            pauseOnFocusLoss: true,
          });
          setIsEditModeOn({ name: false, email: false, phone: false });
          if (result.message?.includes("Verify your new email")) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            setAccessToken(null);
            setUser(null);
            navigate("/verify-email", { state: { email: userData.email } });
          }
          // setUserData({
          //   name: "",
          //   email: "",
          //   phone: "",
          //   url: "",
          //   public_id: "",
          //   status: "",
          // });
          // setAvatar(null);
          // setAvatarURL("");
        },
        onError: () => {
          setIsEditModeOn({ name: false, email: false, phone: false });
        },
      }
    );
  };

  // Initial data on first mount...
  useEffect(() => {
    setUserData({
      name: data?.user?.username || "",
      email: data?.user?.email || "",
      phone: data?.user?.phone || "",
      url: data?.user?.avatar.url || "",
      public_id: data?.user?.avatar.public_id || "",
      status: data?.user?.status === "Unbanned" && "Good",
    });
  }, [
    data?.user?.username,
    data?.user?.email,
    data?.user?.phone,
    data?.user?.avatar.url,
    data?.user?.avatar.public_id,
    data?.user?.status,
  ]);

  // Revoke objURL,
  useEffect(() => {
    return () => avatarURL && URL.revokeObjectURL(avatarURL);
  }, [avatarURL]);

  return (
    <div className=" font-poppins ">
      {/* Personal */}
      <>
        <h1 className="text-lg text-gray-600 font-medium">
          Personal Information
        </h1>
        <form className=" relative my-3" onSubmit={handleSubmit}>
          <div className="relative flex flex-row max-sm:flex-col items-center gap-5 p-3 border border-gray-400/40 rounded-md ">
            {/*Image upload */}
            <div className="relative p-0.5 rounded-full border border-gray-400/20">
              <img
                src={
                  avatarURL
                    ? avatarURL
                    : userData.url.replace(/^http:\/\//i, "https://") ||
                      "/profile.webp"
                }
                alt="avatar"
                className="w-20 h-20 rounded-full"
              />
              <label
                hidden={!isEditModeOn.name}
                htmlFor="avatar"
                className=" absolute top-0 left-0 h-full w-full flex items-center justify-center bg-white/5 text-gray-800 backdrop-blur-xs rounded-full cursor-pointer "
              >
                <BiSolidCamera size={24} />
              </label>
              <input
                type="file"
                name="avatar"
                id="avatar"
                accept="image/png, image/jpg, image/webp"
                onChange={handleFileChange}
                hidden
              />
            </div>

            {/* Actions btn */}
            <div className=" absolute right-1 top-1 z-20">
              <button
                hidden={isEditModeOn.name}
                type="button"
                className="bg-[#f4f4f8] p-1 rounded-md inset-shadow-2xs text-gray-500 hover:text-green-400 cursor-pointer"
                onClick={() =>
                  setIsEditModeOn((prev) => ({ ...prev, name: true }))
                }
              >
                <BiSolidEdit size={24} />
              </button>
              <button
                hidden={!isEditModeOn.name}
                type="button"
                className="bg-[#f4f4f8] p-1 rounded-md inset-shadow-2xs text-gray-500 hover:text-red-400 cursor-pointer"
                onClick={() =>
                  setIsEditModeOn((prev) => ({ ...prev, name: false }))
                }
              >
                <CgClose size={24} />
              </button>
            </div>

            {/* Name */}
            <div className=" w-full max-w-72 relative flex flex-col gap-3">
              <label
                hidden={!isEditModeOn.name}
                className=" absolute -top-2 left-3 text-xs px-0.5 text-gray-500/50 bg-white"
              >
                Full Name
              </label>
              <input
                disabled={!isEditModeOn.name}
                className={`w-full px-3 py-2 rounded-md text-gray-700 outline-0 max-sm:text-center ${
                  isEditModeOn.name &&
                  "border border-gray-600/60 ring-3 ring-gray-600/10 max-sm:text-left "
                } `}
                type="text"
                name="username"
                id="username"
                placeholder="Full Name"
                value={userData.name}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <button
                disabled={isPending}
                hidden={!isEditModeOn.name}
                type="submit"
                className=" flex items-center justify-center gap-2 p-2 bg-blue-400 text-blue-50 font-medium rounded-md cursor-pointer"
              >
                {isPending ? (
                  <>
                    <CgSpinner size={24} className=" animate-spin" /> Saving...{" "}
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </form>
      </>

      {/* Email address */}
      <>
        <h1 className="text-lg text-gray-600 font-medium">Email Address</h1>
        <form className=" relative my-3" onSubmit={handleSubmit}>
          <div className="relative flex flex-row max-sm:flex-col items-center gap-5 p-3 border border-gray-400/40 rounded-md">
            {/* Actions btn */}
            <div className=" absolute right-1 top-1 z-20">
              <button
                hidden={isEditModeOn.email}
                type="button"
                className="bg-[#f4f4f8] p-1 rounded-md inset-shadow-2xs text-gray-500 hover:text-green-400 cursor-pointer"
                onClick={() =>
                  setIsEditModeOn((prev) => ({ ...prev, email: true }))
                }
              >
                <BiSolidEdit size={24} />
              </button>
              <button
                hidden={!isEditModeOn.email}
                type="button"
                className="bg-[#f4f4f8] p-1 rounded-md inset-shadow-2xs text-gray-500 hover:text-red-400 cursor-pointer"
                onClick={() =>
                  setIsEditModeOn((prev) => ({ ...prev, email: false }))
                }
              >
                <CgClose size={24} />
              </button>
            </div>

            {/* Name */}
            <div className=" w-full max-w-72 relative flex flex-col gap-3">
              <label
                hidden={!isEditModeOn.email}
                className=" absolute -top-2 left-3 text-xs px-0.5 text-gray-500/50 bg-white"
              >
                Email Address
              </label>
              <input
                disabled={!isEditModeOn.email}
                className={`w-full px-3 py-2 rounded-md text-gray-700 outline-0 ${
                  isEditModeOn.email &&
                  "border border-gray-600/60 ring-3 ring-gray-600/10 "
                }`}
                type="email"
                name="email"
                id="email"
                placeholder="Email address"
                value={userData.email}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, email: e.target.value }))
                }
              />

              <button
                disabled={isPending}
                hidden={!isEditModeOn.email}
                type="submit"
                className=" flex items-center justify-center gap-2 p-2 bg-blue-400 text-blue-50 font-medium rounded-md cursor-pointer"
              >
                {isPending ? (
                  <>
                    <CgSpinner size={24} className=" animate-spin" /> Saving...{" "}
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </form>
      </>

      {/* Phone number */}
      <>
        <h1 className="text-lg text-gray-600 font-medium">Phone Number</h1>
        <form className=" relative my-3" onSubmit={handleSubmit}>
          <div className="relative flex flex-row max-sm:flex-col items-center gap-5 p-3 border border-gray-400/40 rounded-md">
            {/* Actions btn */}
            <div className=" absolute right-1 top-1 z-20">
              <button
                hidden={isEditModeOn.phone}
                type="button"
                className="bg-[#f4f4f8] p-1 rounded-md inset-shadow-2xs text-gray-500 hover:text-green-400 cursor-pointer"
                onClick={() =>
                  setIsEditModeOn((prev) => ({ ...prev, phone: true }))
                }
              >
                <BiSolidEdit size={24} />
              </button>
              <button
                hidden={!isEditModeOn.phone}
                type="button"
                className="bg-[#f4f4f8] p-1 rounded-md inset-shadow-2xs text-gray-500 hover:text-red-400 cursor-pointer"
                onClick={() =>
                  setIsEditModeOn((prev) => ({ ...prev, phone: false }))
                }
              >
                <CgClose size={24} />
              </button>
            </div>

            {/* Name */}
            <div className=" w-full max-w-72 relative flex flex-col gap-3">
              <label
                hidden={!isEditModeOn.phone}
                className=" absolute -top-2 left-3 text-xs px-0.5 text-gray-500/50 bg-white"
              >
                Phone Number
              </label>
              <input
                disabled={!isEditModeOn.phone}
                className={`w-full px-3 py-2 rounded-md text-gray-700 outline-0 ${
                  isEditModeOn.phone &&
                  "border border-gray-600/60 ring-3 ring-gray-600/10 "
                }`}
                type="text"
                name="ph"
                id="ph"
                placeholder="Phone Number"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <button
                disabled={isPending}
                hidden={!isEditModeOn.phone}
                type="submit"
                className=" flex items-center justify-center gap-2 p-2 bg-blue-400 text-blue-50 font-medium rounded-md cursor-pointer"
              >
                {isPending ? (
                  <>
                    <CgSpinner size={24} className=" animate-spin" /> Saving...{" "}
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </form>
      </>

      <h1 className="text-lg text-gray-600 font-medium my-3">Account Status</h1>
      <p className="inline-flex items-center gap-1.5 pl-4 text-green-400 ">
        <MdOutlineSecurity size={24} /> {userData.status}
      </p>
    </div>
  );
};

export default Profile;
