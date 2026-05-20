import { useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PaystackCheckout from "../components/PaystackCheckout";

// ⬇️ Correct Paystack component import

const Order = () => {
  const navigate = useNavigate();

  // Cart
  const { cartItems, cartTotalAmount } = useSelector((state) => state.cart);

  // Logged-in user
  const storedUser = useSelector((state) => state.auth.user);
  // const localUser = JSON.parse(localStorage.getItem("user"));
  const user = storedUser;
  const userId = user?._id || user?.id;
  const token = user?.token;

  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
  });

  // API base url
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle order creation
  const handleOrder = async () => {
    if (!userId) {
      alert("You must be logged in to place an order");
      navigate("/login");
      return;
    }

    if (!form.fullName || !form.phone || !form.address) {
      alert("Please enter all fields");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    const orderItems = cartItems.map((item) => {
      const product = item.productId || item;
      return {
        name: product.name || item.name,
        qty: item.quantity || item.qty || 1,
        price: product.price || item.price || 0,
        product: product._id || product.id || item.productId || item.id,
        image: product.image || product.images?.[0] || item.image || "",
      };
    });

    const payload = {
      orderItems,
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        email: form.email,
      },
      paymentMethod: "Paystack",
      totalPrice: cartTotalAmount || 0,
    };

    console.log("PAYLOAD SENT TO SERVER:", payload);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setOrderCreated({
        ...data,
        customer: {
          fullName: form.fullName,
          email: form.email,
        },
      });
    } catch (err) {
      setLoading(false);
      alert("Failed to create order: " + err.message);
      console.error("Order creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Complete Your Order</h1>

      {/* Order Summary */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
        {cartItems.map((item) => {
          const product = item.productId || item;
          const name = product.name || item.name || "Product";
          const qty = item.quantity || item.qty || 1;
          const price = product.price || item.price || 0;
          return (
            <div
              key={product._id || item.id || name}
              className="flex justify-between border-b py-2"
            >
              <p>{name}</p>
              <p>
                {qty} × ₦{price}
              </p>
            </div>
          );
        })}
        <div className="flex justify-between mt-3 font-semibold">
          <span>Total:</span>
          <span>₦{cartTotalAmount}</span>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-semibold text-lg mb-2">Your Details</h2>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          className="border p-2 w-full mb-3"
          value={form.fullName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          className="border p-2 w-full mb-3"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email (for receipt)"
          className="border p-2 w-full mb-3"
          value={form.email}
          onChange={handleChange}
        />
        <textarea
          name="address"
          placeholder="Delivery Address"
          className="border p-2 w-full"
          rows="3"
          value={form.address}
          onChange={handleChange}
        />
      </div>

      {/* Place Order Button */}
      {!orderCreated && (
        <button
          disabled={loading}
          className="bg-blue-600 text-white w-full py-3 rounded text-lg"
          onClick={handleOrder}
        >
          {loading ? "proccessing..." : " Place Order"}
        </button>
      )}

      {/* Paystack Payment */}
      {orderCreated && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Pay with Paystack</h2>
          <PaystackCheckout order={orderCreated} />
        </div>
      )}
    </div>
  );
};

export default Order;
