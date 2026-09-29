import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "d9-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { showToast } = useToast();

  // Load cart from localStorage.
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // Save cart to localStorage.
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add cart.
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast({
      message: "Product added to cart.",
      type: "success",
      duration: 3000,
      closable: true,
      progress: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
    });
  };

  // Remove cart.
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.product._id !== id));
    showToast({
      message: "Product removed from cart.",
      type: "warning",
      duration: 3000,
      closable: true,
      progress: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
    });
  };

  // Change quantity.
  const decreaseQuantity = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);

      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return console.log("No products exists.");
    });
    showToast({
      message: "Decrement product quantity.",
      type: "info",
      duration: 3000,
      closable: true,
      progress: true,
      pauseOnHover: true,
      pauseOnFocusLoss: true,
    });
  };

  // Clear cart.
  const clearCart = () =>{ setCart([]);
     showToast({
       message: "Removed all product from cart.",
       type: "info",
       duration: 3000,
       closable: true,
       progress: true,
       pauseOnHover: true,
       pauseOnFocusLoss: true,
     });
  };

  // Cart count.
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch cart from backend (after login).
  //   const loadCartFromBackend = async (token) => {
  //     try {
  //       const res = await axios.get("/api/cart", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       if (res.data?.items) {
  //         setCart(
  //           res.data.items.map(({ product, quantity }) => ({ product, quantity }))
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Cart load error:", error);
  //     }
  //   };

  // Sync local cart with backend (on login).
  //   const syncCartWithBackend = async (token) => {
  //     try {
  //       if (cart.length > 0) {
  //         await axios.post(
  //           "/api/cart/sync",
  //           {
  //             items: cart.map(({ product, quantity }) => ({
  //               product: product._id,
  //               quantity,
  //             })),
  //           },
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );
  //         clearCart(); // clear local after pushing.
  //       }
  //       await loadCartFromBackend(token); // always load latest backend cart.
  //     } catch (error) {
  //       console.error("Cart sync failed:", error);
  //     }
  //   };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
        cartCount,
        // syncCartWithBackend,
        // loadCartFromBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
