"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, ThumbsUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function LikedVideosContent() {
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadLikedVideos();
    }
  }, [user]);

  const loadLikedVideos = async () => {
    if (!user) return;
    try {
      const likedData = await axiosInstance.get(`/like/${user?._id}`);
      setLikedVideos(likedData.data);
    } catch (error) {
      console.error("Error loading liked videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlikeVideo = async (videoId: string, likedVideoId: string) => {
    if (!user) return;
    try {
      console.log("Unliking video:", videoId, "for user:", user.id);
      setLikedVideos(likedVideos.filter((item) => item._id !== likedVideoId));
    } catch (error) {
      console.error("Error unliking video:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <ThumbsUp className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Keep track of videos you like
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Sign in to see your liked videos.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-4 py-6 text-sm text-gray-500">
        Loading liked videos...
      </div>
    );
  }

  if (likedVideos.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <ThumbsUp className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No liked videos yet
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Videos you like will appear here.
        </p>
      </div>
    );
  }
  const videos = "/video/vdo.mp4";

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-xs sm:text-sm text-gray-600">
          {likedVideos.length} videos
        </p>
        <Button className="flex items-center gap-2 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Play all
        </Button>
      </div>
      <div className="space-y-4 sm:space-y-5">
        {likedVideos.map((item) => (
          <div
            key={item._id}
            className="  flex  flex-col  sm:flex-row  gap-3  sm:gap-4 group w-full  min-w-0 pb-4 sm:pb-5 border-b "
          >
            <Link
              href={`/watch/${item.videoid._id}`}
              className="  shrink-0  w-full sm:w-40  md:w-48 lg:w-56 "
            >
              <div className=" relative  w-full   aspect-video  rounded-lg  overflow-hidden  bg-black  ">
                <video
                  src={`${process.env.BACKEND_URL}/${item.videoid?.filepath}`}
                  className="  w-full  h-full  object-cover  group-hover:scale-105  transition-transform duration-200 "
                />
              </div>
            </Link>
            <div className=" flex-1 min-w-0 pr-8  sm:pr-0 ">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className=" font-medium text-sm sm:text-base  line-clamp-2  break-words group-hover:text-blue-600 mb-1">
                  {item.videoid.videotitle}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {item.videoid.videochanel}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {item.videoid.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
              </p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                Liked {formatDistanceToNow(new Date(item.createdAt))} ago
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="  absolute  top-1  right-1  sm:static  sm:top-auto sm:right-auto w-8  h-8 sm:w-9  sm:h-9 shrink-0 opacity-100  sm:opacity-0 sm:group-hover:opacity-100 "
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => handleUnlikeVideo(item.videoid._id, item._id)}
                  className="text-sm cursor-pointer"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from liked videos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
