"use client";

import { useUser } from "@/lib/AuthContext";
import { useRef, useState, useEffect } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";

interface VideoPlayerProps {
  video: any;
  nextVideoId?: string;
}

export function VideoPlayer({ video, nextVideoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const tapCount = useRef(0);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const limits = {
    free: 5 * 60,
    bronze: 7 * 60,
    silver: 10 * 60,
    gold: Infinity,
  };

  const currentPlan =
    (user?.plan?.toLowerCase() as keyof typeof limits) || "free";
  const limit = limits[currentPlan];

  function showPlayerControls() {
    setShowControls(true);
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }

  function toggleFullScreen() {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const player = e.currentTarget;

    if (player.currentTime >= limit) {
      player.pause();
      player.currentTime = limit;
    }
  };

  function handleTap(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const zone =
      x < rect.width / 3
        ? "left"
        : x > (2 * rect.width) / 3
          ? "right"
          : "center";
    tapCount.current++;
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      const count = tapCount.current;
      tapCount.current = 0;
      if (count === 1) {
        handleSingleTap(zone);
      } else if (count === 2) {
        handleDoubleTap(zone);
      } else if (count >= 3) {
        handleTripleTap(zone);
      }
    }, 400);
    showPlayerControls();
  }

  function handleSingleTap(zone: string) {
    const player = videoRef.current;
    if (!player) return;
    if (zone === "center") {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    }
  }

  function handleDoubleTap(zone: string) {
    const player = videoRef.current;
    if (!player) return;
    if (!Number.isFinite(player.duration)) return;
    if (zone === "left") {
      player.currentTime = Math.max(0, player.currentTime - 10);
    }
    if (zone === "right") {
      player.currentTime = Math.min(player.duration, player.currentTime + 10);
    }
  }

  function handleTripleTap(zone: string) {
    console.log("TRIPLE TAP:", zone);
    if (zone === "center") {
      if (nextVideoId) {
        router.push(`/watch/${nextVideoId}`);
      } else {
        console.log("No next video available");
      }
    }
    if (zone === "left") {
      console.log("Opening comments");
      setCommentsOpen(true);
    }
    if (zone === "right") {
      console.log("Leaving video page");
      window.history.back();
    }
  }

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, []);

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden">
      <div
        className=" relative  w-full  aspect-video rounded-lg   overflow-hidden bg-black"
        onPointerUp={handleTap}
        onMouseMove={showPlayerControls}
        onMouseEnter={() => {
          setShowControls(true);
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onPlay={() => {
            setIsPlaying(true);
            setShowControls(false);
            if (controlsTimer.current) {
              clearTimeout(controlsTimer.current);
            }
          }}
          onPause={() => {
            setIsPlaying(false);
            setShowControls(true);
            if (controlsTimer.current) {
              clearTimeout(controlsTimer.current);
            }
          }}
          onLoadedMetadata={() => {
            const player = videoRef.current;
            if (player) {
              setDuration(player.duration);
            }
          }}
          onTimeUpdate={(e) => {
            const player = e.currentTarget;
            setCurrentTime(player.currentTime);
            handleTimeUpdate(e);
          }}
        >
          <source
            src={`${process.env.BACKEND_URL}/${video.filepath.replace(
              /\\/g,
              "/",
            )}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {commentsOpen && (
          <div className="fixed left-0 right-0 top-20 bottom-0 z-40 bg-black/80">
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background overflow-y-auto">
              <button
                onClick={() => setCommentsOpen(false)}
                className="absolute right-4 top-4 text-xl"
              >
                ✕
              </button>
              <Comments videoId={video._id} />
            </div>
          </div>
        )}
        {showControls && (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              const player = videoRef.current;
              if (!player) return;
              if (player.paused) {
                player.play();
              } else {
                player.pause();
              }
            }}
            className="  absolute  top-1/2  left-1/2  -translate-x-1/2  -translate-y-1/2 w-12  h-12  sm:w-16  sm:h-16  rounded-full  bg-black/70  text-white flex  items-center justify-center text-xl sm:text-2xl hover:bg-black/90  z-10"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        )}
        {showControls && (
          <div
            className=" absolute  bottom-0 left-0  right-0 bg-black/70 px-2  sm:px-3  pb-2  pt-1 z-20"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
            }}
          >
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                const player = videoRef.current;
                if (!player) return;
                const value = Number(e.target.value);
                player.currentTime = value;
                setCurrentTime(value);
              }}
              className="  w-full  h-1 cursor-pointer appearance-none "
              style={{
                background: `linear-gradient(
                  to right,
                  #ef4444 0%,
                  #ef4444 ${duration ? (currentTime / duration) * 100 : 0}%,
                  #4b5563 ${duration ? (currentTime / duration) * 100 : 0}%,
                  #4b5563 100%
                )`,
              }}
            />
            <div className="  flex items-center  gap-2  sm:gap-3  mt-2    text-white  min-w-0 ">
              <button
                onClick={() => {
                  const player = videoRef.current;
                  if (!player) return;
                  if (player.paused) {
                    player.play();
                  } else {
                    player.pause();
                  }
                }}
                className="  hover:text-gray-300  text-base  sm:text-lg  shrink-0  w-6  sm:w-auto  "
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => {
                  const player = videoRef.current;
                  if (!player) return;
                  player.currentTime = Math.max(0, player.currentTime - 10);
                }}
                className="  hover:text-gray-300   shrink-0 text-sm   sm:text-base  "
              >
                ↶
              </button>
              <button
                onClick={() => {
                  const player = videoRef.current;
                  if (!player) return;
                  if (!Number.isFinite(player.duration)) {
                    return;
                  }
                  player.currentTime = Math.min(
                    player.duration,
                    player.currentTime + 10,
                  );
                }}
                className=" hover:text-gray-300  shrink-0   text-sm  sm:text-base"
              >
                ↷
              </button>
              <span className=" text-[10px]  sm:text-xs  md:text-sm  whitespace-nowrap shrink-0  ">
                {Math.floor(currentTime / 60)}:
                {String(Math.floor(currentTime % 60)).padStart(2, "0")}
                {" / "}
                {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, "0")}
              </span>
              <div className=" ml-auto  flex  items-center  gap-2  sm:gap-3  md:gap-4  shrink-0  ">
                <button
                  className="  hover:text-gray-300  text-sm  sm:text-base "
                  onClick={() => {
                    const player = videoRef.current;
                    if (!player) return;
                    player.muted = !player.muted;
                  }}
                >
                  🔊
                </button>
                <button className="  hover:text-gray-300 hidden  sm:block  ">
                  ⚙
                </button>
                <button className="  hover:text-gray-300  hidden  sm:block ">
                  ▣
                </button>
                <button
                  onClick={toggleFullScreen}
                  className=" hover:text-gray-300 text-base sm:text-lg "
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
