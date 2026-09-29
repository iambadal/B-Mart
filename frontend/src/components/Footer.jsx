import { Link } from "react-router";
import { FaXTwitter, FaInstagram, FaFacebookF } from "react-icons/fa6";


 const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white px-6 py-8 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-bold text-lg mb-2">MyCart <span className="text-green-500">.</span></h3>
          <p>Your one-stop shop for all products.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Quick Links</h3>
          <ul className=" flex gap-3 space-y-1">
            <li>
              <Link to="/" className="hover:text-green-400">
                About
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-green-400">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-green-400">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Follow Us</h3>
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
      </div>
      <div className="text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} B-Mart. Built by <a href="https://github.com/iambadal" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Badal Pujhari</a>.
      </div>
    </footer>
  );
}

export default Footer