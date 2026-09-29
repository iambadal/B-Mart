import { useState, useContext } from "react";
import AuthForm from "../components/AuthForm";
import { login } from "../api/AuthAPI";
import { useNavigate } from "react-router";
import { AuthContext } from "../contexts/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [msg, setMsg] = useState(null);
  const { setUser, setAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    
    const data = await login(formData);

    // If login is successful, the backend returns 'user' and 'tokens' objects
    if (data && data.user) {
      if (data.user.status === "Banned") {
        setMsg("Your account is temporarily locked!");
        return;
      }
      
      // Fix: Access the token from the nested 'tokens' object
      setAccessToken(data.tokens.accessToken);
      setUser(data.user);

      // ADD THESE TWO LINES: Force persistence to browser storage
      localStorage.setItem("accessToken", data.tokens.accessToken); 
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect based on role
      data.user?.role === "admin" ? navigate("/admin") : navigate("/");
    } else {
      // If login fails, the error response usually contains a 'message'
      setMsg(data?.message || "Login failed. Please check your credentials.");
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-email", { state: { email: formData.email } });
      }
    }
  };

  return (
    <AuthForm
      isLogin={true}
      handleChange={handleChange}
      onSubmit={handleSubmit}
      formData={formData}
      msg={msg}
    />
  );
};

export default LoginPage;
