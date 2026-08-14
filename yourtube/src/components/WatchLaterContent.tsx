"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function WatchLaterContent() {
  const [watchLater, setWatchLater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadWatchLater();
    }
  }, [user]);

  const loadWatchLater = async () => {
    if (!user) return;
    try {
      const watchLaterData = await axiosInstance.get(`/watch/${user?._id}`);
      setWatchLater(watchLaterData.data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading watch later...</div>;
  }

  const handleRemoveFromWatchLater = async (watchLaterId: string) => {
    try {
      console.log("Removing from history:", watchLaterId);
      setWatchLater(watchLater.filter((item) => item._id !== watchLaterId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />

        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Save videos for later
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Sign in to access your Watch later playlist.
        </p>
      </div>
    );
  }

  if (watchLater.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No videos saved
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Videos you save for later will appear here.
        </p>
      </div>
    );
  }
  // const videos = "/video/vdo.mp4";

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col xs:flex-row sm:flex-row justify-between items-start xs:items-center sm:items-center gap-3">
        <p className="text-sm text-gray-600">{watchLater.length} videos</p>
        <Button className="flex items-center gap-2 w-full xs:w-auto sm:w-auto">
          <Play className="w-4 h-4" />
          Play all
        </Button>
      </div>
      <div className="space-y-4">
        {watchLater.map((item) => (
          <div
            key={item._id}
            className=" flex  gap-3  sm:gap-4 group w-full min-w-0 "
          >
            <Link href={`/watch/${item.videoid._id}`} className="shrink-0">
              <div className=" relative w-32  sm:w-40 md:w-48  lg:w-52 aspect-video  bg-background  rounded  overflow-hidden ">
                <video
                  src={`${process.env.BACKEND_URL}/${item.videoid?.filepath}`}
                  className=" w-full  h-full object-cover  group-hover:scale-105  transition-transform  duration-200 "
                />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className=" font-medium text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 mb-1 ">
                  {item.videoid.videotitle}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {item.videoid.videochanel}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                {item.videoid.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                Added {formatDistanceToNow(new Date(item.createdAt))} ago
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className=" shrink-0  opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity "
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveFromWatchLater(item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from Watch later
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
