import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router";

const PrivateRoute = ({ children }) => {
  const { accessToken, loading } = useContext(AuthContext);

  if (loading) return <p>Checking authentication...</p>;

  // if (!accessToken) return <p>You are not logged in</p>;

  return accessToken ? children : <Navigate to={"/login"} />;
};

export default PrivateRoute;
