import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Script from "next/dist/client/script";

export default function PremiumContent() {
  const { user, setUser } = useUser();
  const currentPlan = user?.plan?.toLowerCase() ?? "free";
  const plan = [
    {
      name: "Free",
      color: "text-gray-500",
      bg: "bg-gray-500",
      price: `0/month`,
      limit: "5 minutes video watching",
      download: "Download 1 video/day",
    },
    {
      name: "Bronze",
      color: "text-amber-700",
      bg: "bg-amber-700",
      price: `10/month`,
      limit: "7 minutes video watching",
      download: "Download unlimited videos/day",
    },
    {
      name: "Silver",
      color: "text-slate-400",
      bg: "bg-slate-400",
      price: `50/month`,
      limit: "10 minutes video watching",
      download: "Download unlimited videos/day",
    },
    {
      name: "Gold",
      color: "text-yellow-500",
      bg: "bg-yellow-500",
      price: `100/month`,
      limit: "Unlimited video watching",
      download: "Download unlimited videos/day",
    },
  ];

  const handleUpgrade = async (plan: any) => {
    try {
      const res = await axiosInstance.post("/premium/create-order", {
        userId: user?._id,
        plan: plan.name.toLowerCase(),
      });
      const order = res.data.order;
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "YourTube",
        description: `${plan.name} Premium Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          await axiosInstance.post("/premium/verify", {
            userId: user?._id,
            plan: plan.name.toLowerCase(),
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          alert("Premium Activated");
        },
        theme: {
          color: "#FF0000",
        },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancelSubscription = async () => {
    try {
      const res = await axiosInstance.post("/premium/cancel", {
        userId: user?._id,
      });

      setUser(res.data.user);

      alert("Subscription Cancelled");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="w-full min-w-0 px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="flex flex-col gap-5 sm:gap-6">
          {/* Heading */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Choose Your Plan
          </h1>
          <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-4  sm:gap-5 lg:gap-6  w-full ">
            {plan.map((plan) => (
              <div
                key={plan.name}
                className=" w-full min-w-0 rounded-xl border border-gray-200 p-5 sm:p-6  lg:p-8  shadow-lg    transition-all duration-300  hover:-translate-y-1  sm:hover:-translate-y-2 hover:shadow-2xl "
              >
                <h2
                  className={` text-xl sm:text-2xl  font-bold  tracking-tight  ${plan.color} `}
                >
                  {plan.name}
                </h2>
                <p className=" mt-2 sm:mt-3 text-3xl sm:text-4xl font-extrabold  break-words ">
                  ₹{plan.price}
                </p>
                <hr className="my-4" />
                <div className="space-y-2">
                  <p className="text-sm sm:text-base leading-relaxed">
                    • {plan.limit}
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed">
                    • {plan.download}
                  </p>
                </div>
                {currentPlan === plan.name.toLowerCase() ? (
                  <>
                    <Button
                      disabled
                      className=" mt-5 sm:mt-6 w-full min-h-10 bg-green-600  text-foreground cursor-default "
                    >
                      Activated
                    </Button>
                    {currentPlan !== "free" && (
                      <Button
                        variant="destructive"
                        className="  mt-3  w-full min-h-10 "
                        onClick={handleCancelSubscription}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    className=" mt-5 sm:mt-6 w-full min-h-10 rounded-lg px-4 py-2 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 "
                  >
                    Get Premium {plan.name}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
