import {
  MdOutlineSecurity,
  MdPassword,
  MdPowerSettingsNew,
  MdSupportAgent,
} from "react-icons/md";
import { TbUserEdit, TbUserMinus } from "react-icons/tb";
import { useAuth } from "../contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router";
import { useDeleteUser } from "../Hooks/useUser";

const AccountPage = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(["user", accessToken]);
  const { mutateAsync: deleteAccount, isPending } = useDeleteUser();
  const [accountLogout] = useOutletContext();
  const navigate = useNavigate();

  const deleteUser = async () => {
    await deleteAccount(
      { token: accessToken },
      {
        onSuccess: () => {
          localStorage.clear();
        },
      }
    );
  };

  return (
    <div className="font-poppins ">
      <h1 className="text-lg text-gray-600 font-medium mb-3">Manage Account</h1>
      <div className="w-full h-full flex items-center justify-center py-4">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15">
          <li className=" w-full max-w-52 flex flex-col items-center justify-center gap-3 p-4 rounded-md border border-gray-400/20">
            <MdOutlineSecurity size={44} className="text-gray-400/40" />
            <h1 className="font-medium text-gray-500">Account Status</h1>
            <p className="text-green-500">
              {(data?.user?.status === "Unbanned" && "Very good") ||
                "Not available"}
            </p>
          </li>
          <li className=" w-full max-w-52 flex flex-col items-center justify-center gap-3 p-4 rounded-md border border-gray-400/20">
            <TbUserMinus size={44} className="text-gray-400/40" />
            <h1 className="font-medium text-gray-500">Delete Account</h1>
            <button
              disabled={isPending}
              className="px-2 py-1 text-sm rounded-md text-red-500 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
              onClick={async () => await deleteUser()}
            >
              Delete
            </button>
          </li>
          <li className=" w-full max-w-52 flex flex-col items-center justify-center gap-3 p-4 rounded-md border border-gray-400/20">
            <MdPassword size={44} className="text-gray-400/40" />
            <h1 className="font-medium text-gray-500">Update Password</h1>
            <button
              className="px-2 py-1 text-sm rounded-md text-green-500 bg-green-500/10 hover:bg-green-500/20 cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Update
            </button>
          </li>
          <li className=" w-full max-w-52 flex flex-col items-center justify-center gap-3 p-4 rounded-md border border-gray-400/20">
            <MdPowerSettingsNew size={44} className="text-gray-400/40" />
            <h1 className="font-medium text-gray-500">Account Logout</h1>
            <button
              className="px-2 py-1 text-sm rounded-md text-red-500 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
              onClick={async () => await accountLogout()}
            >
              Logout
            </button>
          </li>
          <li className=" w-full max-w-52 flex flex-col items-center justify-center gap-3 p-4 rounded-md border border-gray-400/20">
            <TbUserEdit size={44} className="text-gray-400/40" />
            <h1 className="font-medium text-gray-500">Update Profile</h1>
            <button
              className="px-2 py-1 text-sm rounded-md text-green-500 bg-green-500/10 hover:bg-green-500/20 cursor-pointer"
              onClick={() => navigate("/user")}
            >
              Update
            </button>
          </li>
          <li className=" w-full max-w-52 flex flex-col items-center justify-center gap-3 p-4 rounded-md border border-gray-400/20">
            <MdSupportAgent size={44} className="text-gray-400/40" />
            <h1 className="font-medium text-gray-500">Help Center</h1>
            <button
              className="px-2 py-1 text-sm rounded-md text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer"
              onClick={() => navigate("/user/help")}
            >
              Get Help
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccountPage;
