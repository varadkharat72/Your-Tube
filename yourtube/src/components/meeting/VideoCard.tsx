import { useEffect, useRef } from "react";

type Props = {
  stream?: MediaStream | null;
  name?: string;
  muted?: boolean;
  cameraOff?: boolean;
  micOn?: boolean;
};

export default function VideoCard({
  stream,
  name = "Participant",
  muted = false,
  cameraOff = false,
  micOn = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (
      typeof window === "undefined" ||
      !stream ||
      !(stream instanceof window.MediaStream)
    ) {
      video.srcObject = null;
      return;
    }
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    video.muted = muted;
    video.play().catch((error) => {
      if (error?.name !== "AbortError") {
        console.error("VIDEO PLAY ERROR:", error);
      }
    });
    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream, muted]);

  return (
    <div className="relative w-full h-full min-h-0 bg-background text-foreground rounded-lg sm:rounded-xl overflow-hidden  border border-zinc-800 shadow-lg">
      {cameraOff || !stream ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-zinc-700 flex items-center justify-center text-lg sm:text-xl">
              👤
            </div>
            <p className="mt-2 text-[10px] sm:text-xs text-zinc-400">
              Camera off
            </p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover bg-black"
        />
      )}
      <div className="absolute left-1.5 sm:left-2 bottom-1.5 sm:bottom-2 max-w-[70%] px-2 py-1 rounded-md sm:rounded-lg bg-black/70 text-white text-[9px] sm:text-[10px] truncate">
        {name}
      </div>
      <div className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 px-2 py-1 rounded-md sm:rounded-lg bg-black/70 text-[9px] sm:text-[10px]">
        {micOn === false ? "🔇" : "🎙️"}
      </div>
    </div>
  );
}
