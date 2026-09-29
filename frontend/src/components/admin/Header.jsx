import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { user } = useAuth();
  return (
    <div className="admin-header sticky top-0 w-full z-30 px-3 py-2.5 content-center bg-gray-900/10 backdrop-blur-3xl text-neutral-50">
      <h1 className=" w-fit text-lg  rounded-lg px-3 py-1.5 font-semibold font-funnel hover:bg-gray-800/80 ">
        ADMIN ~ {user?.username}
      </h1>
    </div>
  );
};

export default Header;
