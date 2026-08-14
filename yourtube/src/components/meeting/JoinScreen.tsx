import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, ArrowRight } from "lucide-react";

interface JoinScreenProps {
  localStream: MediaStream | null;
  onJoin: () => void;
  cameraOn: boolean;
  micOn: boolean;
  toggleCamera: () => void;
  toggleMic: () => void;
}

export default function JoinScreen({
  localStream,
  onJoin,
  cameraOn,
  micOn,
  toggleCamera,
  toggleMic,
}: JoinScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (
      typeof window === "undefined" ||
      !localStream ||
      !(localStream instanceof MediaStream)
    ) {
      video.srcObject = null;
      return;
    }
    video.srcObject = localStream;
    video.muted = true;
    video.play().catch((error) => {
      if (error?.name !== "AbortError") {
        console.error("JOIN PREVIEW ERROR:", error);
      }
    });
    return () => {
      if (video.srcObject === localStream) {
        video.srcObject = null;
      }
    };
  }, [localStream]);

  return (
    <div className="  h-full  w-full  min-h-0  min-w-0  overflow-y-auto  overflow-x-hidden  flex  items-center  justify-center  p-3  sm:p-5  md:p-6  ">
      <div className="  w-full  max-w-5xl  min-h-0  flex  flex-col  lg:flex-row  items-center  justify-center  gap-5  sm:gap-6  lg:gap-8  py-3  sm:py-5 ">
        <div className="  relative  w-full  sm:w-[90%]  md:w-[80%]  lg:w-[62%]  aspect-video  rounded-xl sm:rounded-2xl overflow-hidden   border  border-zinc-800  shadow-2xl  shrink-0 ">
          {cameraOn && localStream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="  w-14  h-14  sm:w-20  sm:h-20  mx-auto  rounded-full  flex  items-center  justify-center  ">
                  <VideoOff size={26} className="sm:w-[30px] sm:h-[30px] " />
                </div>

                <p className="mt-3 text-xs sm:text-sm ">Camera is off</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <div className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg  bg-background text-foreground text-[9px] sm:text-xs">
              {cameraOn ? "Camera on" : "Camera off"}
            </div>
          </div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <div className="  px-2  py-1    sm:px-2.5  sm:py-1  rounded-lg   bg-background text-foreground  text-[9px]  sm:text-xs  flex  items-center  gap-1  sm:gap-1.5  ">
              {micOn ? <Mic size={11} /> : <MicOff size={11} />}
              {micOn ? "Mic on" : "Mic off"}
            </div>
          </div>
        </div>
        <div className="  w-full  sm:w-[90%]  md:w-[80%]   lg:w-[38%]  max-w-sm  flex  flex-col  justify-center  min-h-0 ">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Ready to join?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Check your camera and microphone before joining.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={toggleMic}
              className={` w-full  h-10  sm:h-11  rounded-xl  flex  items-center  justify-center  gap-1.5   sm:gap-2  text-[11px]  sm:text-xs  font-medium  transition  ${micOn ? " bg-background hover:bg-zinc-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              {micOn ? "Mic on" : "Mic off"}
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              className={`  w-full  h-10  sm:h-11  rounded-xl  flex  text-foreground  items-center  justify-center  gap-1.5  sm:gap-2  text-[11px]  sm:text-xs  font-medium  transition  ${cameraOn ? " bg-background hover:bg-zinc-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
              {cameraOn ? "Camera on" : "Camera off"}
            </button>
          </div>
          <button
            type="button"
            onClick={onJoin}
            className="  mt-3  w-full  h-11  sm:h-12  rounded-xl  bg-red-600  hover:bg-red-700  flex  items-center justify-center gap-2 text-sm  sm:text-base font-semibold  transition  "
          >
            Join meeting
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
