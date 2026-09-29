import { createContext, useContext, useEffect, useState } from "react";
import { useUserWishlistAdd, useUserWishlistDelete } from "../Hooks/useUser";
import { useAuth } from "./AuthContext";
import { useToast } from "d9-toast";
import { useQueryClient } from "@tanstack/react-query";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const wishlistQueriesData = queryClient.getQueriesData({
    queryKey: ["userWishlist"],
    exact: false,
  });
  const { mutateAsync: productAddToWishlist, isPending } = useUserWishlistAdd();
  const { mutateAsync: productRemoveFromWishlist, isPending: isLoading } =
    useUserWishlistDelete();

  // Load wishlist from localstorage.
  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedList);
  }, []);
  

  // Save wishlist to localstorage.
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add to wishlist.
  const addToWishlist = async (product) => {
    setWishlist((prev) => {
      // Check the product  is already in wishlist.
      const exists = prev.some((item) => item._id === product._id);
      // if it exists, just return the current wishlist.
      if (exists) {
        return prev;
      }
      // if it doesn't exist, add it.
      return [...prev, product];
    });
    await handleAddToWishlist(product);
    showToast({
      message: "Product added to wishlist.",
      type: "success",
      duration: 3000,
      closable: true,
      progress: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
    });
  };

  const handleAddToWishlist = async (product) => {
    const formData = new FormData();
    formData.append("product_id", product._id);
    await productAddToWishlist({ fd: formData, accessToken });
  };

  //  Remove from wishlist
  const removeFromWishlist = async (id) => {
    setWishlist((prev) => prev.filter((item) => item._id !== id));
    await productRemoveFromWishlist({ productId: id, accessToken });
    showToast({
      message: "Product removed from wishlist.",
      type: "warning",
      duration: 3000,
      closable: true,
      progress: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
    });
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
