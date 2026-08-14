import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const handleviews = async () => {
      if (user) {
        try {
          return await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        return await axiosInstance.post(`/history/views/${video?._id}`);
      }
    };
    handleviews();
  }, [user]);

  useEffect(() => {
    const checkDownloaded = async () => {
      if (!user) return;
      try {
        const res = await axiosInstance.get(`/download/${user._id}`);
        const alreadyDownloaded = res.data.some(
          (item: any) => item.videoid?._id === video._id,
        );
        setIsDownload(alreadyDownloaded);
      } catch (err) {
        console.log(err);
      }
    };
    checkDownloaded();
  }, [user, video]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);

          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWatchLater = async () => {
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchLater(!isWatchLater);
      } else {
        setIsWatchLater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axiosInstance.post(`/download/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.alreadyDownloaded) {
        setIsDownload(true);
        return;
      }
      setDownloading(true);
      let value = 0;
      const timer = setInterval(() => {
        value += 10;
        setProgress(value);
        if (value >= 100) {
          clearInterval(timer);
          setDownloading(false);
          setIsDownload(true);
        }
      }, 300);
    } catch (error: any) {
      setDownloading(false);
      if (error.response?.status === 403) {
        alert(error.response.data.message);
        return;
      }
      console.log(error);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight break-words">
        {video.videotitle}
      </h1>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Avatar className="w-9 h-9 sm:w-10 sm:h-10 shrink-0">
            <AvatarFallback>{video.videochanel[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate">
              {video.videochanel}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">1.2M subscribers</p>
          </div>
          <Button className="ml-1 sm:ml-2 shrink-0">Subscribe</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center rounded-full border shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full px-3 sm:px-4"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 ${isLiked ? "fill-black text-black" : ""}`}
              />
              <span className="text-xs sm:text-sm">
                {likes.toLocaleString()}
              </span>
            </Button>
            <div className="w-px h-5 sm:h-6" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full px-3 sm:px-4"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 ${isDisliked ? "fill-black text-black" : ""}`}
              />
              <span className="text-xs sm:text-sm">
                {dislikes.toLocaleString()}
              </span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full px-3 ${isWatchLater ? "text-primary" : ""}`}
            onClick={handleWatchLater}
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">
              {isWatchLater ? "Saved" : "Watch Later"}
            </span>
            <span className="sm:hidden">
              {isWatchLater ? "Saved" : "Later"}
            </span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full px-3">
            <Share className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={downloading}
            className={`rounded-full px-3 ${isDownload ? "text-primary" : ""}`}
            onClick={handleDownload}
          >
            {downloading ? (
              <span className="text-xs sm:text-sm whitespace-nowrap">
                {progress}% Downloading...
              </span>
            ) : (
              <>
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {isDownload ? "Downloaded" : "Download"}
                </span>
                <span className="sm:hidden">
                  {isDownload ? "Saved" : "Download"}
                </span>
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-muted/40">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm font-medium mb-2">
          <span>{video.views.toLocaleString()} views</span>
          <span className="hidden sm:inline">•</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>
        <div
          className={`text-sm leading-relaxed break-words ${showFullDescription ? "" : "line-clamp-3"}`}
        >
          <p>
            Sample video description. This would contain the actual video
            description from the database.
          </p>
        </div>

        {/* SHOW MORE */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
