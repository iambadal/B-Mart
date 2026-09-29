import { useCart } from "../contexts/CartContext";

export default function Cart() {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map(({ product, quantity }) => (
            <div
              key={product._id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p>₹{product.price} × {quantity}</p>
              </div>
              <button
                onClick={() => removeFromCart(product._id)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="text-right font-bold text-lg">
            Total: ${total.toFixed(2)}
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
