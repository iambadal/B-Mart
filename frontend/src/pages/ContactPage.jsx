import { Link } from "react-router";
import { FaXTwitter, FaInstagram, FaFacebookF } from "react-icons/fa6";

const ContactPage = () => {
  return (
    <div className="w-full relative font-poppins">
      <h1 className="text-lg text-gray-600 font-medium mb-3">
        Help center
        <div className=" w-full relative p-2 my-4 ">
          {/* Contact form */}
          <div className="flex flex-col gap-2 p-3 rounded-md bg-gray-50 inset-shadow-2xs text-gray-500">
            <label htmlFor="name" className=" text-base">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              className=" font-extralight px-3 p-2 border border-gray-500/50 rounded-md"
            />
            <label htmlFor="email" className=" text-base">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="your@gmail.com"
              className="px-3 p-2 border border-gray-500/50 rounded-md"
            />
            <label htmlFor="msg" className=" text-base">
              Message
            </label>
            <textarea
              name="message"
              id="msg"
              placeholder="Enter your message..."
              className="px-3 p-2 border border-gray-500/50 rounded-md"
              maxLength={300}
            ></textarea>
            <button className=" mx-auto w-full max-w-2xl p-2 text-green-50 rounded-lg my-4 bg-green-400 hover:bg-green-500 cursor-pointer">
              Submit
            </button>
          </div>
          {/* Or */}
          <h3 className="font-medium text-lg my-4">Follow Us</h3>
          <div className="flex gap-3">
            <Link to="/" className="hover:text-green-400">
              <FaFacebookF size={24} />
            </Link>
            <Link to="/" className="hover:text-green-400">
              <FaInstagram size={24} />
            </Link>
            <Link to="/" className="hover:text-green-400">
              <FaXTwitter size={24} />
            </Link>
          </div>
        </div>
      </h1>
    </div>
  );
};

export default ContactPage;
