import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const handleReturn = () => {
    toast.info("Returning to course details");
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Payment Cancelled</h1>
      <p className="mb-4">You have cancelled the payment. No charges were made.</p>
      <button
        onClick={handleReturn}
        className="px-4 py-2 bg-primary-600 text-white rounded"
      >
        Return to Course
      </button>
    </div>
  );
};

export default PaymentCancelPage;
