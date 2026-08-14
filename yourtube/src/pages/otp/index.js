import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";

export default function OTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  useEffect(() => {
    if (!router.isReady) return;
    if (!user?._id) return;
    if (router.query.method !== "mobile") {
      return;
    }

    const fetchOtp = async () => {
      try {
        const response = await axiosInstance.get(`/otp/get/${user._id}`);
        const fetchedOtp = String(response.data?.otp || "");
        if (!fetchedOtp) {
          return;
        }
        if (!/^\d{6}$/.test(fetchedOtp)) {
          return;
        }
        const otpArray = fetchedOtp.split("");
        setOtp(otpArray);
        setTimeout(() => {
          if (inputs.current[5]) {
            inputs.current[5].focus();
          }
        }, 100);
      } catch (error) {
        console.error("FETCH OTP ERROR:", error?.response?.data || error);
      }
    };
    fetchOtp();
  }, [router.isReady, router.query.method]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) {
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length !== 6) {
      return;
    }
    const newOtp = pasted.split("");
    setOtp(newOtp);
    setTimeout(() => {
      inputs.current[5]?.focus();
    }, 50);
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      alert("Please enter 6 digit OTP");
      return;
    }
    if (!user?._id) {
      alert("User not found");
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.post("/otp/verify", {
        userId: user._id,
        otp: finalOtp,
      });
      alert("OTP Verified Successfully");
      router.push("/");
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
    }
  };
  const isMobile = router.query.method === "mobile";

  return (
    <div className="min-h-screen w-full min-w-0 flex items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-md min-w-0 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 md:p-10">
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
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
                d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center leading-tight">
          Verify your {isMobile ? "mobile" : "email"}
        </h1>

        <p className="text-center mt-3 mb-6 sm:mb-8 text-sm sm:text-base text-gray-500 leading-relaxed">
          Your 6-digit code has been sent via {isMobile ? "SMS" : "email"}
        </p>

        {/* OTP INPUTS */}
        <div
          className="grid grid-cols-6 gap-2 sm:gap-3 mb-7 sm:mb-8 w-full"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              value={digit}
              maxLength={1}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="
              min-w-0
              w-full
              h-12
              sm:h-14
              md:h-16
              rounded-lg
              sm:rounded-xl
              border-2
              border-gray-200
              text-center
              text-xl
              sm:text-2xl
              font-bold
              outline-none
              focus:border-indigo-500
              focus:ring-2
              sm:focus:ring-4
              focus:ring-indigo-100
              transition
            "
            />
          ))}
        </div>

        {/* VERIFY BUTTON */}
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="
          w-full
          h-12
          sm:h-14
          rounded-xl
          bg-indigo-600
          hover:bg-indigo-700
          text-white
          font-semibold
          text-base
          sm:text-lg
          disabled:opacity-60
          transition
        "
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="text-center mt-5 sm:mt-6 text-xs sm:text-sm text-gray-500 leading-relaxed">
          {isMobile
            ? "Mobile OTP is automatically filled."
            : "Enter the OTP received in your email."}
        </p>
      </div>
    </div>
  );
}
