import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { MdAlternateEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AiFillNotification } from "react-icons/ai";
import { motion as Motion } from "motion/react";
import { useNavigate, Navigate } from "react-router";

const AuthForm = ({ isLogin, handleChange, onSubmit, formData, msg }) => {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="auth-page bg-linear-to-b from-[#b7eaac] to-[#f4f4f8] min-h-screen w-full flex flex-col justify-center">
      <div className=" flex flex-row items-center justify-evenly p-2.5">
        <div className="max-xl:hidden text-center ">
          {isLogin ? (
            <>
              <Motion.h1
                initial={{ opacity: 0, y: "-100px" }}
                animate={{ opacity: 1, y: "0px" }}
                transition={{ delay: "0.1" }}
                className="font-medium font-funnel text-4xl text-[#314884] mb-4"
              >
                Welcome back
              </Motion.h1>
              <Motion.p
                initial={{ opacity: 0, y: "-100px" }}
                animate={{ opacity: 1, y: "0px" }}
                className="font-medium font-funnel text-lg text-[#314884]"
              >
                Get access to your Orders, Wishlist and Recommendations
              </Motion.p>
            </>
          ) : (
            <>
              <Motion.h1
                initial={{ opacity: 0, y: "-100px" }}
                animate={{ opacity: 1, y: "0px" }}
                transition={{ delay: "0.1" }}
                className="font-medium font-funnel text-4xl text-[#314884] mb-4"
              >
                Looks like you're new here!
              </Motion.h1>
              <Motion.p
                initial={{ opacity: 0, y: "-100px" }}
                animate={{ opacity: 1, y: "0px" }}
                className="font-medium font-funnel text-lg text-[#314884]"
              >
                Register with your email to get started
              </Motion.p>
            </>
          )}

          <Motion.img
            initial={{ opacity: 0, x: "-100px" }}
            animate={{ opacity: 1, x: "0px" }}
            transition={{ delay: 0.1 }}
            src="/shop.webp"
            alt="shop image"
            className="w-[800px] h-[500px] object-center object-fill drop-shadow-2xl rotate-y-12 "
          />
        </div>

        <Motion.div
          initial={{ opacity: 0, y: "100px" }}
          animate={{ opacity: 1, y: "0px" }}
          transition={{ delay: 0.3 }}
          className="auth-panel bg-[#fbfbfb] px-6 py-3 rounded-3xl shadow-2xl w-full max-w-[420px] border-b-4 border-r-4 border-[#e5e4ef] font-funnel "
        >
          <h2 className="text-center font-bold text-xl text-[#314884] mb-8 mt-4">
            {isLogin ? "Login" : "Register"}
          </h2>

          {/* Messages */}
          {msg && (
            <Motion.p
              initial={{ opacity: 0, x: "-12px" }}
              animate={{ opacity: 1, x: "0px" }}
              className="text-sm text-[#e43e51] flex gap-2 pb-4"
            >
              <AiFillNotification className="text-xl text-[#bddae5]" />
              {msg}
            </Motion.p>
          )}
          <form onSubmit={onSubmit} className="space-y-3 mt-4 text-[#314884]">
            {!isLogin && (
              <div className="relative">
                <label
                  htmlFor="username"
                  className="bg-[#fbfbfb] absolute -top-3 left-4 px-0.5 text-[15px] text-[#52be76]"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-7.5 py-2 rounded-md border-2 border-[#52be76] focus:outline-4 outline-[#b7eaac]"
                />
                <FiUser className=" absolute bottom-3 text-xl text-[#52be76] opacity-70 left-2" />
              </div>
            )}

            <div className="relative mt-8">
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
                value={formData.email}
                onChange={handleChange}
                pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                required
                className="w-full px-7.5 py-2 rounded-md border-2 border-[#52be76] focus:outline-4 outline-[#b7eaac]"
              />
              <MdAlternateEmail className=" absolute bottom-3 text-xl text-[#52be76] opacity-70 left-2" />
            </div>

            <div className="relative mt-8">
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
                value={formData.password}
                onChange={handleChange}
                pattern=".{8,}"
                title="Eight or more characters"
                required
                className="w-full px-7.5 py-2 rounded-md border-2 border-[#52be76] focus:outline-4 outline-[#b7eaac]"
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

            {isLogin && (
              <div className="flex justify-between text-sm">
                <p className="cursor-pointer hover:text-blue-500" onClick={() => navigate("/forgot-password")}>Forgot password?</p>
                <p className="cursor-pointer hover:text-blue-500" onClick={() => navigate("/verify-email")}>Verify email</p>
              </div>
            )}

            <p className="text-xs text-justify">
              By continuing, you agree to MyCart's Terms of Use and Privacy
              Policy.
            </p>

            <button
              type="submit"
              className="w-full bg-[#5ec879] text-white p-2.5 rounded-md hover:bg-[#7ed88a] cursor-pointer mb-4"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="text-center mt-2 text-sm text-[#314884]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                isLogin ? navigate("/register") : navigate("/login");
              }}
              className="text-blue-500 font-medium cursor-pointer"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </Motion.div>
      </div>
    </section>
  );
};

export default AuthForm;
