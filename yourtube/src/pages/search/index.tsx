import SearchResult from "@/components/SearchResult";
import { useRouter } from "next/router";
import React, { Suspense } from "react";

const Index = () => {
  const router = useRouter();
  const { q } = router.query;

  return (
    <main className="flex-1 w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <div className="w-full max-w-6xl mx-auto">
        {q && (
          <div className="mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4 break-words">
              Search results for "{q}"
            </h1>
          </div>
        )}
        <Suspense fallback={<div>Loading search results...</div>}>
          <SearchResult query={q || ""} />
        </Suspense>
      </div>
    </main>
  );
};

export default Index;
