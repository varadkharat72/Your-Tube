import HistoryContent from "@/components/HistoryContent";
import React, { Suspense } from "react";

const index = () => {
  return (
    <main className="flex-1 w-full px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          Watch history
        </h1>
        <Suspense
          fallback={<div className="text-sm sm:text-base">Loading...</div>}
        >
          <HistoryContent />
        </Suspense>
      </div>
    </main>
  );
};

export default index;
