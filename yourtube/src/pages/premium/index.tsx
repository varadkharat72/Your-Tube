import PremiumContent from "@/components/PremiumContent";
import React, { Suspense } from "react";

const Index = () => {
  return (
    <main className="flex-1 w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Premium</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <PremiumContent />
        </Suspense>
      </div>
    </main>
  );
};

export default Index;
