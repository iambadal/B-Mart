import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModel from "../components/ConfirmModel";
import { logout } from "../api/AuthAPI";

const AdminLayout = () => {
  const { user, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isConfirm, setIsConfirm] = useState({
    showModel: false,
    action: null,
  });
  const Navigate = useNavigate();

  const accountLogout = async () => {
    await logout();
    localStorage.clear();
    Navigate("/login");
  };

  if (user?.role !== "admin" || !accessToken) {
    return <p>You have not admin permission.</p>;
  }

  return (
    <>
      <div className="admin-shell relative max-h-screen w-full flex bg-gray-900 overflow-hidden">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} logout={accountLogout} />
        <div className=" relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="h-full flex-1">
            <div className="max-sm:p-2 p-4 overflow-x-auto">
              <Outlet context={[isOpen, setIsConfirm]} />
            </div>
          </main>
        </div>
      </div>
      {isConfirm.showModel && (
        <ConfirmModel
          cancel={() => setIsConfirm({ showModel: false })}
          confirm={() => {
            isConfirm?.action();
            setIsConfirm({ showModel: false });
          }}
        />
      )}
    </>
  );
};

export default AdminLayout;
