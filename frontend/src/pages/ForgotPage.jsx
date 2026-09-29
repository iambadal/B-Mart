import { MdAlternateEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { motion as Motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { useToast } from "d9-toast";
import { forgotPassword, resetPassword } from "../api/AuthAPI";

const ForgotPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handelSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newData = Object.fromEntries(formData.entries());
    if (newData.password !== newData.cPassword) {
      showToast({
        message: "Invalid password or mismatched.",
        type: "warning",
        duration: 3000,
        closable: true,
        progress: true,
        pauseOnHover: true,
        pauseOnFocusLoss: true,
      });
      return;
    }
    if (token) {
      setIsLoading(true);
      const res = await resetPassword({ ...newData, token });
      console.log(res);
      
      if (res.status === "success") {
        setIsLoading(false);
        showToast({
          message: "Password reset successfully",
          type: "info",
          duration: 3000,
          closable: true,
          progress: true,
          pauseOnHover: true,
          pauseOnFocusLoss: true,
        });
         navigate("/login");
      }
    } else {
      setIsLoading(true);
      const res = await forgotPassword(newData);
      if (res.status === "success") {
        setIsLoading(false);
        showToast({
          message: "Password reset link sent, Pleas check your inbox.",
          type: "info",
          duration: 3000,
          closable: true,
          progress: true,
          pauseOnHover: true,
          pauseOnFocusLoss: true,
        });
       
      }
    }
  };

  return (
    <section className="auth-page bg-linear-to-b from-[#b7eaac] to-[#f4f4f8] min-h-screen w-full flex flex-col items-center justify-evenly">
      <Motion.form
        onSubmit={handelSubmit}
        initial={{ opacity: 0.5, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "circOut" }}
        className="auth-panel bg-[#fbfbfb] px-6 py-3 rounded-3xl shadow-2xl w-full max-w-[420px] h-fit border-b-4 border-r-4 border-[#e5e4ef] text-center font-funnel "
      >
        <h1 className="text-center font-bold text-xl text-[#314884] mb-8 mt-4">
          {token ? " New password" : "Reset password"}
        </h1>

        {!token && (
          <div className="relative mt-8 ">
            <label
              htmlFor="email"
              className="bg-[#fbfbfb] absolute -top-3 left-4 px-0.5 text-[15px] text-[#52be76]"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
              required
              className="w-full px-7.5 py-2 rounded-md text-gray-500 border-2 border-[#52be76] focus:outline-4 outline-[#b7eaac]"
            />
            <MdAlternateEmail className=" absolute bottom-3 text-xl text-[#52be76] opacity-70 left-2" />
          </div>
        )}
        {/* Passwords */}
        {token && (
          <>
            <div className="relative mt-8 ">
              <label
                htmlFor="password"
                className="bg-[#fbfbfb] absolute -top-3 left-4 px-0.5 text-[15px] text-[#52be76]"
              >
                Password
              </label>

              <input
                type={showPass ? "text" : "password"}
                name="password"
                id="password"
                pattern=".{8,}"
                title="Eight or more characters"
                required
                className="w-full px-7.5 py-2 rounded-md text-gray-500 border-2 border-[#52be76] focus:outline-4 outline-[#b7eaac]"
              />
              {showPass ? (
                <FiEyeOff
                  onClick={() => setShowPass(!showPass)}
                  className=" absolute right-2 top-3 text-xl text-[#52be76] cursor-pointer"
                />
              ) : (
                <FiEye
                  onClick={() => setShowPass(!showPass)}
                  className=" absolute right-2 top-3 text-xl text-[#52be76] cursor-pointer"
                />
              )}

              <TbLockPassword className=" absolute bottom-3 text-xl text-[#52be76] opacity-70 left-2" />
            </div>
            <div className="relative mt-8">
              <label
                htmlFor="cPassword"
                className="bg-[#fbfbfb] absolute -top-3 left-4 px-0.5 text-[15px] text-[#52be76]"
              >
                Confirm Password
              </label>

              <input
                type="text"
                name="cPassword"
                id="cPassword"
                pattern=".{8,}"
                title="Eight or more characters"
                required
                className="w-full px-7.5 py-2 rounded-md text-gray-500 border-2 border-[#52be76] focus:outline-4 outline-[#b7eaac]"
              />

              <TbLockPassword className=" absolute bottom-3 text-xl text-[#52be76] opacity-70 left-2" />
            </div>
          </>
        )}
        <button
          className=" mt-8 w-full bg-[#5ec879] text-white p-2.5 rounded-md hover:bg-[#7ed88a] cursor-pointer mb-4"
          type="submit"
        >
          {token ? "Submit" : " Send"}
        </button>
        <button
          disabled={isLoading}
          type="button"
          className=" text-gray-500 hover:text-blue-500 font-medium cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </Motion.form>
    </section>
  );
};

export default ForgotPage;
