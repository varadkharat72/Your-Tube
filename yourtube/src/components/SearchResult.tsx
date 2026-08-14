import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SearchResult = ({ query }: any) => {
  if (!query.trim()) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <p className="text-gray-600 text-sm sm:text-base">
          Enter a search term to find videos and channels.
        </p>
      </div>
    );
  }

  const [video, setvideos] = useState<any>(null);

  const videos = async () => {
    //   const allVideos = [
    //     {
    //       _id: "1",
    //       videotitle: "Amazing Nature Documentary",
    //       filename: "nature-doc.mp4",
    //       filetype: "video/mp4",
    //       filepath: "/videos/nature-doc.mp4",
    //       filesize: "500MB",
    //       videochanel: "Nature Channel",
    //       Like: 1250,
    //       views: 45000,
    //       uploader: "nature_lover",
    //       createdAt: new Date().toISOString(),
    //     },
    //     {
    //       _id: "2",
    //       videotitle: "Cooking Tutorial: Perfect Pasta",
    //       filename: "pasta-tutorial.mp4",
    //       filetype: "video/mp4",
    //       filepath: "/videos/pasta-tutorial.mp4",
    //       filesize: "300MB",
    //       videochanel: "Chef's Kitchen",
    //       Like: 890,
    //       views: 23000,
    //       uploader: "chef_master",
    //       createdAt: new Date(Date.now() - 86400000).toISOString(),
    //     },
    //   ];
    //   let results = allVideos.filter(
    //     (vid) =>
    //       vid.videotitle.toLowerCase().includes(query.toLowerCase()) ||
    //       vid.videochanel.toLowerCase().includes(query.toLowerCase()),
    //   );
    // setvideos(results);
  };

  useEffect(() => {
    videos();
  }, [query]);

  if (!video) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No results found
        </h2>
        <p className="text-sm sm:text-base">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }

  const hasResults = video ? video.length > 0 : true;

  if (!hasResults) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No results found
        </h2>
        <p className="text-sm sm:text-base">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }

  const vids = "/video/vdo.mp4";

  return (
    <div className="w-full space-y-4 sm:space-y-6 px-2 sm:px-0">
      {video.length > 0 && (
        <div className="space-y-4 sm:space-y-5">
          {video.map((video: any) => (
            <div
              key={video._id}
              className="  flex  flex-col  sm:flex-row gap-3 sm:gap-4 group  w-full  min-w-0 "
            >
              <Link
                href={`/watch/${video._id}`}
                className="w-full sm:w-64 md:w-72 lg:w-80 shrink-0"
              >
                <div className="  relative  w-full aspect-video bg-background  rounded-md sm:rounded-lg  overflow-hidden ">
                  <video
                    src={vids}
                    className="  w-full  h-full  object-cover  group-hover:scale-105  transition-transform duration-200 "
                  />
                  <div className="  absolute  bottom-2 right-2 text-[10px]  sm:text-xs  px-1.5 py-0.5 rounded bg-black/70 text-white ">
                    {formatDistanceToNow(new Date(video.createdAt))}
                  </div>
                </div>
              </Link>
              <div className=" flex-1  min-w-0  py-0 sm:py-1 ">
                <Link href={`/watch/${video._id}`}>
                  <h3 className="  font-medium  text-base  sm:text-lg  line-clamp-2  group-hover:text-blue-600  mb-1.5 sm:mb-2  ">
                    {video.videotitle}
                  </h3>
                </Link>
                <div className=" flex flex-wrap items-center gap-x-2 gap-y-1 text-xs  sm:text-sm mb-2 ">
                  <span>{video.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(video.createdAt))} ago
                  </span>
                </div>
                <Link
                  href={`/channel/${video.uploader}`}
                  className=" flex items-center gap-2 mb-2 hover:text-blue-600 min-w-0 "
                >
                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-xs">
                      {video.videochanel?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className=" text-xs sm:text-sm  truncate ">
                    {video.videochanel}
                  </span>
                </Link>
                <p className=" text-xs sm:text-sm line-clamp-2  text-gray-600 ">
                  Sample video description that would show search-relevant
                  content and help users understand what the video is about
                  before clicking.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasResults && (
        <div className="text-center py-6 sm:py-8 px-2">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing {video.length} results for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
