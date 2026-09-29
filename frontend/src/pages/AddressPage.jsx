import { BiSolidEdit } from "react-icons/bi";
import { CgClose, CgSpinner } from "react-icons/cg";
import { useFetchAddress, useUpdateAddress } from "../Hooks/useUser";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "d9-toast";
import { useState } from "react";

const Address = () => {
  const [isOnEdit, setIsOnEdit] = useState(false);
  const { accessToken } = useAuth();
  const { data } = useFetchAddress(accessToken);
  const { showToast } = useToast();
  const { mutateAsync: updateAddress, isPending } = useUpdateAddress();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const addresses = Object.fromEntries(formData.entries());
    await updateAddress(
      { fd: addresses, accessToken },
      {
        onSuccess: () => {
          setIsOnEdit(false);
          showToast({
            message: "Your address is successfully updated.",
            type: "success",
            duration: 3000,
            closable: true,
            progress: true,
            pauseOnHover: true,
            pauseOnFocusLoss: true,
          });
        },
      }
    );
  };

  return (
    <div className=" relative font-poppins">
      <h1 className="text-lg text-gray-600 font-medium mb-3">
        Manage Addresses
      </h1>
      {/* Actions */}
      <div className="absolute top-0 right-0">
        {!isOnEdit && (
          <button
            className=" text-gray-500 bg-[#f4f4f8] p-0.5 inset-shadow-2xs rounded-md hover:text-green-600 cursor-pointer"
            onClick={() => setIsOnEdit(true)}
          >
            <BiSolidEdit size={24} />
          </button>
        )}
        {isOnEdit && (
          <button
            className=" text-gray-500 bg-[#f4f4f8] p-0.5 inset-shadow-2xs rounded-md hover:text-red-600 cursor-pointer"
            onClick={() => setIsOnEdit(false)}
          >
            <CgClose size={24} />
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-md border-0 border-gray-400/20"
      >
        <div className=" grid grid-cols-1 md:grid-cols-2 max-md:grid-cols-1 gap-5">
          <div className=" p-2 border border-gray-400/20 rounded-md">
            <label
              htmlFor="name"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              Full name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Full Name"
              defaultValue={data?.name || ""}
              disabled={!isOnEdit}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40"
            />
          </div>
          <div className=" p-2 border border-gray-400/20 rounded-md">
            <label
              htmlFor="email"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              Email ID
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              defaultValue={data?.email || ""}
              disabled={!isOnEdit}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40"
            />
          </div>
          <div className=" p-2 border border-gray-400/20 rounded-md">
            <label
              htmlFor="phone"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              10-digit mobile number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              placeholder="Phone Number"
              disabled={!isOnEdit}
              defaultValue={data?.phone || ""}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40"
            />
          </div>
          <div className=" p-2 border border-gray-400/20 rounded-md">
            <label
              htmlFor="cty"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              City/District/Town
            </label>
            <input
              type="text"
              name="city"
              id="cty"
              placeholder="City"
              disabled={!isOnEdit}
              defaultValue={data?.city || ""}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40"
            />
          </div>
          <div className=" p-2 border border-gray-400/20 rounded-md">
            <label
              htmlFor="st"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              State
            </label>
            <input
              type="text"
              name="state"
              id="st"
              placeholder="State"
              disabled={!isOnEdit}
              defaultValue={data?.state || ""}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40"
            />
          </div>
          <div className=" p-2 border border-gray-400/20 rounded-md">
            <label
              htmlFor="pc"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              Pincode
            </label>
            <input
              type="number"
              name="pinCode"
              id="pc"
              placeholder="Pin Code"
              disabled={!isOnEdit}
              defaultValue={data?.pinCode || ""}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40"
            />
          </div>

          <div className=" p-2 border border-gray-400/20 rounded-md">
            <label
              htmlFor="cu"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              Country
            </label>
            <input
              type="text"
              name="country"
              id="cu"
              placeholder="Country"
              disabled={!isOnEdit}
              defaultValue={data?.country || ""}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40"
            />
          </div>
          <div className=" p-2 border border-gray-400/20 rounded-md ">
            <label
              htmlFor="ad"
              className="font-medium px-1 rounded-xs text-gray-500 bg-[#f4f4f8] inset-shadow-2xs"
            >
              Address
            </label>
            <textarea
              style={{ resize: !isOnEdit && "none" }}
              name="address"
              id="ad"
              placeholder="Full Address"
              disabled={!isOnEdit}
              defaultValue={data?.address || ""}
              required
              className="w-full p-2 my-1 rounded-md outline-gray-400/40 h-24"
            ></textarea>
          </div>
        </div>
        <button
          disabled={isPending}
          hidden={!isOnEdit}
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
      </form>
    </div>
  );
};

export default Address;
