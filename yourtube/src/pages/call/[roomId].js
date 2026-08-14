import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useWebRTC from "@/hooks/useWebRTC";
import socket from "@/lib/socket";
import JoinScreen from "@/components/meeting/JoinScreen";
import VideoGrid from "@/components/meeting/VideoGrid";

export default function CallPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [mounted, setMounted] = useState(false);
  const [screenPinned, setScreenPinned] = useState(true);

  const {
    localVideoRef,
    screenPreviewRef,
    localStream,
    screenStream,
    joined,
    participants,
    micOn,
    cameraOn,
    isScreenSharing,
    screenSharer,
    isRecording,
    joinMeeting,
    leaveMeeting,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
  } = useWebRTC(typeof roomId === "string" ? roomId : null);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  if (!mounted || typeof roomId !== "string") {
    return (
      <div className="h-screen w-full bg-background text-foreground flex items-center justify-center overflow-hidden">
        Loading meeting...
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden">
        <JoinScreen
          localStream={localStream}
          onJoin={joinMeeting}
          cameraOn={cameraOn}
          micOn={micOn}
          toggleCamera={toggleCamera}
          toggleMic={toggleMic}
        />
      </div>
    );
  }

  const currentSocketId = socket.id || null;
  const isLocalScreenSharer = Boolean(
    screenSharer && currentSocketId && screenSharer === currentSocketId,
  );
  const remoteScreenParticipant = participants.find(
    (participant) =>
      participant.id === screenSharer && participant.screenStream,
  );
  const remoteScreenStream = remoteScreenParticipant?.screenStream || null;
  const hasScreen =
    isScreenSharing && (isLocalScreenSharer || Boolean(remoteScreenStream));

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col overflow-hidden bg-background text-foreground">
      <header className="min-h-14 shrink-0 px-3 sm:px-4 py-2 border-b border-zinc-800  flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base font-semibold truncate">
            YourTube Meet
          </h1>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">
            Room: {roomId}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-[10px] sm:text-xs text-zinc-500 whitespace-nowrap">
            {participants.length + 1}{" "}
            {participants.length === 0 ? "participant" : "participants"}
          </span>
          {hasScreen && (
            <button
              type="button"
              onClick={() => setScreenPinned((value) => !value)}
              className="hidden sm:block px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs whitespace-nowrap"
            >
              {screenPinned ? "Unpin screen" : "Pin screen"}
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden p-2 sm:p-3">
        {hasScreen && screenPinned ? (
          <div className="relative w-full h-full min-h-0 bg-zinc-950 rounded-lg sm:rounded-xl overflow-hidden border border-zinc-800">
            {isLocalScreenSharer ? (
              <>
                <video
                  ref={screenPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-blue-600/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs">
                  You are sharing your screen
                </div>
              </>
            ) : (
              <RemoteScreen stream={remoteScreenStream} />
            )}
            <div className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 w-[110px] xs:w-[130px] sm:w-[180px] md:w-[220px] aspect-video rounded-lg overflow-hidden border-2 border-white shadow-2xl bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 text-[8px] sm:text-[10px] bg-black/70 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                You
              </div>
            </div>
            <div className="absolute left-2 bottom-2 sm:left-3 sm:bottom-3 max-w-[55%] flex gap-1.5 sm:gap-2 overflow-x-auto">
              {participants
                .filter((participant) => participant.cameraStream)
                .slice(0, 4)
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="shrink-0 w-[90px] sm:w-[140px] md:w-[170px] aspect-video rounded-lg overflow-hidden border border-white/30 bg-black shadow-xl"
                  >
                    <RemoteCamera
                      stream={participant.cameraStream}
                      name={participant.id.slice(0, 8)}
                    />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-0 overflow-auto flex items-center justify-center">
            <VideoGrid
              localStream={localStream}
              participants={participants}
              cameraOn={cameraOn}
              micOn={micOn}
              screenStream={
                isLocalScreenSharer ? screenStream : remoteScreenStream
              }
              screenName={
                isLocalScreenSharer
                  ? "You are sharing"
                  : screenSharer
                    ? screenSharer.slice(0, 8)
                    : "Screen"
              }
            />
          </div>
        )}
      </main>
      <footer className="min-h-[64px] sm:min-h-[72px] shrink-0  border-t border-zinc-800 px-2 sm:px-3 py-2 overflow-x-auto">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 min-w-max">
          <button
            type="button"
            onClick={toggleMic}
            className={`h-10 sm:h-11 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap ${
              micOn
                ? "bg-zinc-800 hover:bg-zinc-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <span className="hidden sm:inline">
              {micOn ? "🎙️ Mic" : "🔇 Off"}
            </span>
            <span className="sm:hidden">
              {micOn ? "🎙️" : "🔇"}
            </span>
          </button>
          <button
            type="button"
            onClick={toggleCamera}
            className={`h-10 sm:h-11 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap ${
              cameraOn
                ? "bg-zinc-800 hover:bg-zinc-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <span className="hidden sm:inline">
              {cameraOn ? "📷 Camera" : "🚫 Off"}
            </span>
            <span className="sm:hidden">
              {cameraOn ? "📷" : "🚫"}
            </span>
          </button>
          <button
            type="button"
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`h-10 sm:h-11 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap ${
              isScreenSharing
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <span className="hidden sm:inline">
              {isScreenSharing ? "Stop share" : "Share"}
            </span>
            <span className="sm:hidden">
              {isScreenSharing ? "⏹" : "🖥️"}
            </span>
          </button>
          {hasScreen && (
            <button
              type="button"
              onClick={() => setScreenPinned((value) => !value)}
              className="h-10 sm:h-11 px-2.5 sm:px-4 rounded-lg sm:rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-medium"
            >
              {screenPinned ? "📌" : "📍"}
            </button>
          )}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`h-10 sm:h-11 px-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            <span className="hidden sm:inline">
              {isRecording ? "⏹ Stop" : "⏺ Record"}
            </span>
            <span className="sm:hidden">
              {isRecording ? "⏹" : "⏺"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              leaveMeeting();
              router.push("/");
            }}
            className="h-10 sm:h-11 px-3 sm:px-5 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-700 text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap"
          >
            Leave
          </button>
        </div>
      </footer>
    </div>
  );
}

function RemoteScreen({ stream }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (
      typeof window === "undefined" ||
      !(stream instanceof window.MediaStream)
    ) {
      video.srcObject = null;
      return;
    }
    video.srcObject = stream;
    video.muted = false;
    video.play().catch((error) => {
      if (error?.name !== "AbortError") {
        console.error("REMOTE SCREEN PLAY ERROR:", error);
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
      ref={ref}
      autoPlay
      playsInline
      className="w-full h-full object-contain bg-black"
    />
  );
}

function RemoteCamera({ stream, name }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (
      typeof window === "undefined" ||
      !(stream instanceof window.MediaStream)
    ) {
      video.srcObject = null;
      return;
    }
    video.srcObject = stream;
    video.muted = false;
    video.play().catch((error) => {
      if (error?.name !== "AbortError") {
        console.error("REMOTE CAMERA PLAY ERROR:", error);
      }
    });
    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={ref}
        autoPlay
        playsInline
        className="w-full h-full object-cover bg-black"
      />
      <div className="absolute bottom-1 left-1 bg-black/70 rounded px-1.5 py-0.5 text-[8px] sm:text-[9px]">
        {name}
      </div>
    </div>
  );
}