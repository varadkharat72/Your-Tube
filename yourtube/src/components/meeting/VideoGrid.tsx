import React from "react";
import VideoCard from "./VideoCard";

type Participant = {
  id: string;
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
};

type Props = {
  localStream: MediaStream | null;
  participants: Participant[];
  cameraOn: boolean;
  micOn: boolean;
  screenStream?: MediaStream | null;
  screenName?: string;
};

export default function VideoGrid({
  localStream,
  participants,
  cameraOn,
  micOn,
  screenStream,
  screenName = "Screen",
}: Props) {
  const hasScreen = Boolean(screenStream);

  const total = participants.length + 1 + (hasScreen ? 1 : 0);

  let columns = "grid-cols-1";

  if (total === 2) {
    columns = "grid-cols-1 sm:grid-cols-2";
  } else if (total <= 4) {
    columns = "grid-cols-2";
  } else {
    columns = "grid-cols-2 lg:grid-cols-3";
  }

  return (
    <div
      className={` grid ${columns} gap-2 sm:gap-3  w-full h-full min-h-0 min-w-0 overflow-hidden  place-content-center  auto-rows-fr `}
    >
      {hasScreen && (
        <ScreenCard stream={screenStream ?? null} name={screenName} />
      )}
      <VideoCard
        stream={localStream}
        name="You"
        muted
        cameraOff={!cameraOn}
        micOn={micOn}
      />
      {participants.map((participant) => (
        <VideoCard
          key={participant.id}
          stream={participant.cameraStream}
          name={participant.id?.slice(0, 8) || "Participant"}
          cameraOff={!participant.cameraStream}
        />
      ))}
    </div>
  );
}

function ScreenCard({
  stream,
  name,
}: {
  stream: MediaStream | null;
  name: string;
}) {
  return (
    <div className="  relative  min-h-0  min-w-0  h-full overflow-hidden rounded-lg sm:rounded-xl border sm:border-2 border-blue-500 shadow-lg ">
      <ScreenVideo stream={stream} />
      <div className=" absolute  left-1.5  bottom-1.5  sm:left-2  sm:bottom-2  max-w-[65%]  px-1.5  py-0.5  sm:px-2  sm:py-1  rounded-md sm:rounded-lg  bg-black/80  text-white text-[9px] sm:text-[10px]  truncate ">
        🖥️ {name}
      </div>
      <div className="  absolute  top-1.5  left-1.5 sm:top-2  sm:left-2 px-1.5  py-0.5  sm:px-2  sm:py-1 rounded-md sm:rounded-lg bg-blue-600/90 text-white text-[9px] sm:text-[10px]">
        Screen share
      </div>
    </div>
  );
}

function ScreenVideo({ stream }: { stream: MediaStream | null }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
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

    video.srcObject = stream;
    video.muted = false;

    video.play().catch((error) => {
      if (error?.name !== "AbortError") {
        console.error("SCREEN PLAY ERROR:", error);
      }
    });

    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className=" w-full h-full object-contain bg-black"
    />
  );
}
