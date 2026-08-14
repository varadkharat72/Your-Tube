"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const historyData = await axiosInstance.get(`/history/${user._id}`);
      setHistory(historyData.data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      setHistory((prev) => prev.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 py-6">
        <p className="text-sm text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full px-4 py-12 text-center">
        <Clock className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Keep track of what you watch
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="w-full px-4 py-12 text-center">
        <Clock className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4" />

        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No watch history yet
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Videos you watch will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {history.length} {history.length === 1 ? "video" : "videos"}
        </p>
      </div>
      <div className="w-full space-y-4">
        {history.map((item) => {
          const video = item.videoid;
          if (!video) return null;

          return (
            <div
              key={item._id}
              className="  group  relative  w-full  min-w-0   flex  flex-col  sm:flex-row  gap-3  sm:gap-4  pb-4 border-b "
            >
              <Link
                href={`/watch/${video._id}`}
                className=" block w-full sm:w-48 md:w-56 lg:w-64 shrink-0"
              >
                <div className="  relative  w-full  aspect-video overflow-hidden rounded-l ">
                  <video
                    src={`${process.env.BACKEND_URL}/${video.filepath}`}
                    className=" w-full  h-full object-cover transition-transform duration-200  group-hover:scale-105 "
                    muted
                    preload="metadata"
                  />
                </div>
              </Link>
              <div className=" flex-1 min-w-0 pr-10 sm:pr-8 ">
                <Link href={`/watch/${video._id}`}>
                  <h3 className=" font-medium  text-sm  sm:text-base  md:text-lg leading-snug line-clamp-2 break-words group-hover:text-blue-600 transition-colors ">
                    {video.videotitle}
                  </h3>
                </Link>
                <p className="  text-xs sm:text-sm text-gray-600 mt-1 truncate ">
                  {video.videochanel}
                </p>
                <p className=" text-xs sm:text-sm text-gray-600 mt-1 ">
                  {video.views?.toLocaleString?.() || 0} views
                  {" • "}
                  {video.createdAt
                    ? formatDistanceToNow(new Date(video.createdAt))
                    : "Unknown"}{" "}
                  ago
                </p>
                <p className=" text-xs text-gray-500  mt-2">
                  Added{" "}
                  {item.createdAt
                    ? formatDistanceToNow(new Date(item.createdAt))
                    : "Unknown"}{" "}
                  ago
                </p>
              </div>
              <div className="  absolute  top-0 right-0  sm:static sm:self-start shrink-0 ">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="  h-8  w-8  sm:h-9 sm:w-9 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity "
                    >
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={() => handleRemoveFromHistory(item._id)}
                      className="  cursor-pointer text-sm "
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove from watch history
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
