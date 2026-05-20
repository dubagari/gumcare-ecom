import { useState } from "react";

const PaystackCheckout = ({ order }) => {
  const [loading, setLoading] = useState(false);
  const amount = order?.totalAmount ?? order?.totalPrice ?? 0;
  const email = order?.customer?.email || order?.email || "";
  const orderId = order?._id || order?.id;
  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const payWithPaystack = async () => {
    if (!orderId || !email || amount <= 0) {
      alert("Missing order, email or amount for Paystack payment.");
      return;
    }

    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const callbackUrl = `${window.location.origin}/payment-loading?orderId=${orderId}`;
      const response = await fetch(`${BACKEND_URL}/api/payment/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          amount,
          email,
          orderId,
          callback_url: callbackUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        alert(data.message || "Failed to initiate Paystack payment.");
        console.error("Paystack init failed:", data);
        setLoading(false);
        return;
      }

      window.location.href = data.data.authorization_url;
    } catch (error) {
      console.error("Paystack request failed:", error);
      alert("Unable to start Paystack payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={payWithPaystack}
      disabled={loading}
      className="bg-green-600 text-white py-3 px-4 rounded-xl w-full font-semibold hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading
        ? "Redirecting to Paystack..."
        : `Pay ₦${amount.toFixed(2)} with Paystack`}
    </button>
  );
};

export default PaystackCheckout;
