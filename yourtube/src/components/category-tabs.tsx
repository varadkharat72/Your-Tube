"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "News",
  "Sports",
  "Technology",
  "Comedy",
  "Education",
  "Science",
  "Travel",
  "Food",
  "Fashion",
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className=" w-full max-w-full overflow-x-auto overflow-y-hidden mb-4 sm:mb-6 pb-1 sm:pb-2 scrollbar-hide ">
      <div className="flex w-max min-w-full gap-2 px-1">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "secondary"}
            className=" shrink-0 whitespace-nowrap h-9 px-3 text-sm sm:h-10 sm:px-4 "
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
