import DownloadContent from "../../components/DownloadContent";
import { Suspense } from "react";

export default function DownloadPage() {
  return (
    <main className="flex-1 w-full px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Download</h1>
        <Suspense
          fallback={
            <div className="text-sm sm:text-base">Loading download...</div>
          }
        >
          <DownloadContent />
        </Suspense>
      </div>
    </main>
  );
}
