import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";

import { auth } from "@/lib/firebase";

export default function MobilePage() {
  const [mobile, setMobile] = useState("");
  const router = useRouter();
  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axiosInstance.post("/mobile/save", {
        userId: user._id,
        mobile,
      });
      router.push("/otp?method=mobile");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-[430px] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h18M3 19h18M7 8h10v8H7z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Verify your mobile
        </h1>
        <p className="text-center text-sm sm:text-base mt-3 mb-6 sm:mb-8">
          Enter your mobile number to receive a verification code.
        </p>
        <div className="flex items-center w-full border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-200 transition">
          <div className="px-3 sm:px-4 py-3 sm:py-4 font-semibold text-sm sm:text-base shrink-0">
            +91
          </div>
          <input
            type="tel"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="9876543210"
            className="flex-1 min-w-0 px-3 sm:px-4 py-3 sm:py-4 outline-none text-base sm:text-lg"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full h-12 sm:h-14 mt-6 sm:mt-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-base sm:text-lg transition"
        >
          Continue
        </button>
        <p className="text-center text-xs sm:text-sm mt-6 sm:mt-8 leading-relaxed">
          We'll send a one-time password (OTP) to verify your number.
        </p>
      </div>
    </div>
  );
}
