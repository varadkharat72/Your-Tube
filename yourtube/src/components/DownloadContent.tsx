"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Play, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function DownloadContent() {
  const [download, setDownload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadDownload();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDownload = async () => {
    if (!user) return;
    try {
      const downloadData = await axiosInstance.get(`/download/${user._id}`);
      setDownload(downloadData.data);
    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromDownload = async (downloadId: string) => {
    try {
      await axiosInstance.delete(`/download/${downloadId}`);
      setDownload((prev) => prev.filter((item) => item._id !== downloadId));
    } catch (error) {
      console.error("Error removing download:", error);
    }
  };

  if (loading) {
    return (
      <div className=" w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 ">
        <p className="text-sm text-gray-500">Loading downloads...</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="  w-full  px-3  sm:px-4  md:px-6  lg:px-8  py-10  sm:py-12 text-center ">
        <Download className="  w-12  h-12  sm:w-16  sm:h-16  mx-auto mb-4 " />
        <h2 className=" text-lg sm:text-xl font-semibold mb-2 ">
          Save videos for later
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Sign in to access your download playlist.
        </p>
      </div>
    );
  }
  if (download.length === 0) {
    return (
      <div className=" w-full px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12 text-center ">
        <Download className=" w-12 h-12 sm:w-16  sm:h-16 mx-auto mb-4 " />
        <h2 className=" text-lg sm:text-xl font-semibold mb-2 ">
          No videos downloaded
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Videos you download will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className=" w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
      <div className=" flex items-center justify-between gap-3 mb-4 sm:mb-6 ">
        <p className=" text-sm sm:text-base text-gray-600 ">
          {download.length} {download.length === 1 ? "video" : "videos"}
        </p>
        <Button size="sm" className=" flex items-center  gap-1.5 shrink-0">
          <Play className="w-4 h-4" />
          <span className="hidden xs:inline">Play all</span>
          <span className="xs:hidden">Play</span>
        </Button>
      </div>
      <div className=" w-full min-w-0 space-y-4 sm:space-y-5">
        {download.map((item) => (
          <div
            key={item._id}
            className=" relative flex items-start gap-3 sm:gap-4 w-full min-w-0 group "
          >
            <Link
              href={`/watch/${item.videoid._id}`}
              className=" shrink-0 w-32 xs:w-36 sm:w-40 md:w-48 lg:w-56 "
            >
              <div className=" relative w-full aspect-video rounded-md overflow-hidden bg-gray-200">
                <video
                  src={`${process.env.BACKEND_URL}/${item.videoid?.filepath}`}
                  className=" w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 "
                  muted
                  preload="metadata"
                />
              </div>
            </Link>

            <div className=" flex-1 min-w-0 pr-8 sm:pr-10 ">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className=" font-medium text-sm sm:text-base leading-snug line-clamp-2 break-words group-hover:text-blue-600 transition-colors ">
                  {item.videoid?.videotitle}
                </h3>
              </Link>
              <p className=" text-xs sm:text-sm text-gray-600 mt-1 break-words">
                {item.videoid?.videochanel}
              </p>
              <p className=" text-xs sm:text-sm text-gray-500 mt-1 break-words ">
                {item.videoid?.views?.toLocaleString()} views
                <span className="mx-1">•</span>
                {formatDistanceToNow(new Date(item.videoid?.createdAt))} ago
              </p>
              <p className=" text-[11px] sm:text-xs text-gray-400 mt-1 ">
                Added {formatDistanceToNow(new Date(item.createdAt))} ago
              </p>
            </div>
            <div className=" absolute right-0 top-0 shrink-0 ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className=" w-8 h-8 sm:w-9 sm:h-9 "
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onClick={() => handleRemoveFromDownload(item._id)}
                  >
                    <X className="w-4 h-4 mr-2 shrink-0" />
                    <span>Remove from downloads</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
