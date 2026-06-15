import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const query = new URLSearchParams(location.search);
  const mock = query.get("mock") === "true";
  const orderId = query.get("orderId");
  const paymentId = query.get("payment_id");
  const signature = query.get("signature");
  const courseId = query.get("courseId");

  useEffect(() => {
    const verify = async () => {
      try {
        if (mock) {
          // Mock verification just redirects to enroll flow via backend verify endpoint
          await api.post("/payments/verify", { mock: true, orderId });
        } else {
          await api.post("/payments/verify", {
            mock: false,
            orderId,
            payment_id: paymentId,
            signature,
            courseId,
          });
        }
        setStatus("success");
        setMessage("Payment successful! Redirecting to your course...");
        toast.success("Payment verified");
        setTimeout(() => navigate(`/learn/${courseId}`), 3000);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
        toast.error("Verification failed");
      }
    };
    verify();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {status === "verifying" && (
        <div className="text-center">
          <p className="text-xl font-medium">Verifying payment...</p>
        </div>
      )}
      {status === "success" && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Payment Successful!</h1>
          <p>{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Payment Failed</h1>
          <p>{message}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
