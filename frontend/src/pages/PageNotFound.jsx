import { Link } from "react-router";

const PageNotFound = () => {

  return (
    <div className=" min-h-screen w-full flex items-center justify-center bg-white">
      <div className=" flex flex-col items-center justify-center">
        <img src="/sadface.gif" alt="gif image" width={200} height={200} />
        <p>Page Not Found !</p>
        <Link to={"/"} className=" font-medium text-blue-400">Home</Link>
      </div>
    </div>
  );
};

export default PageNotFound;
