"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";

export default function VideoCard({ video }: any) {
  const [duration, setDuration] = useState("");

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.currentTarget;

    const totalSeconds = Math.floor(videoElement.duration);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      setDuration(
        `${hours}:${String(minutes).padStart(2, "0")}:${String(
          seconds,
        ).padStart(2, "0")}`,
      );
    } else {
      setDuration(`${minutes}:${String(seconds).padStart(2, "0")}`);
    }
  };

  return (
    <Link href={`/watch/${video?._id}`} className="group block w-full min-w-0">
      <div className="space-y-2 sm:space-y-3 w-full">
        <div className="relative w-full aspect-video rounded-md sm:rounded-lg overflow-hidden bg-gray-100">
          <video
            src={`${process.env.BACKEND_URL}/${video?.filepath?.replace(
              /\\/g,
              "/",
            )}`}
            onLoadedMetadata={handleLoadedMetadata}
            preload="metadata"
            className="  w-full  h-full object-cover  group-hover:scale-105  transition-transform duration-200 "
          />
          {duration && (
            <div className="  absolute  bottom-1 right-1  sm:bottom-2 sm:right-2  bg-black/80  text-white text-[10px] sm:text-xs px-1  sm:px-1.5  py-0.5  rounded ">
              {duration}
            </div>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3 w-full min-w-0">
          <Avatar className="w-8 h-8 sm:w-9 sm:h-9 shrink-0">
            <AvatarFallback className="text-xs sm:text-sm">
              {video?.videochanel?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="  font-medium  text-xs  sm:text-sm  line-clamp-2  leading-5  group-hover:text-blue-600  break-words">
              {video?.videotitle}
            </h3>
            <p className="text-xs sm:text-sm mt-1 truncate">
              {video?.videochanel}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
              {video?.views?.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video?.createdAt))} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
