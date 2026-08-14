import WatchLaterContent from "@/components/WatchLaterContent";
import { Suspense } from "react";

export default function WatchLaterPage() {
  return (
    <main className="flex-1 w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          Watch later
        </h1>
        <Suspense fallback={<div>Loading watch later...</div>}>
          <WatchLaterContent />
        </Suspense>
      </div>
    </main>
  );
}
