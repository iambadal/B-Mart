import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router";
import { register } from "../api/AuthAPI";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const data = await register(formData);
    console.log(data);
    if (data.type) {
      setMsg(data.message);
      navigate("/login");
    }
    setMsg(data.message);
  };

  return (
    <AuthForm
      isLogin={false}
      handleChange={handleChange}
      onSubmit={handleSubmit}
      formData={formData}
      msg={msg}
    />
  );
};

export default RegisterPage;
