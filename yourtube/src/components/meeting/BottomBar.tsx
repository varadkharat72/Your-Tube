import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Copy,
  PhoneOff,
  Circle,
  Square,
} from "lucide-react";

interface BottomBarProps {
  micOn: boolean;
  cameraOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  formattedTime: string;
  toggleMic: () => void;
  toggleCamera: () => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  copyInvite: () => void;
  leaveMeeting: () => void;
}

export default function BottomBar({
  micOn,
  cameraOn,
  isScreenSharing,
  isRecording,
  formattedTime,
  toggleMic,
  toggleCamera,
  startScreenShare,
  stopScreenShare,
  startRecording,
  stopRecording,
  copyInvite,
  leaveMeeting,
}: BottomBarProps) {
  return (
    <div className="fixed bottom-3 sm:bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-16px)] sm:w-auto">
      <div className="   backdrop-blur  border border-zinc-800  rounded-2xl sm:rounded-full  px-2 py-2  sm:px-3 sm:py-2  md:px-5 md:py-3  flex items-center justify-center  gap-1.5  sm:gap-2  md:gap-3 shadow-2xl  w-full  sm:w-auto  ">
        <button
          onClick={toggleMic}
          title={micOn ? "Mute microphone" : "Unmute microphone"}
          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center ${
            micOn
              ? "bg-zinc-700 hover:bg-zinc-600"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {micOn ? (
            <Mic size={18} className="sm:w-5 sm:h-5 md:w-[23px] md:h-[23px]" />
          ) : (
            <MicOff
              size={18}
              className="sm:w-5 sm:h-5 md:w-[23px] md:h-[23px]"
            />
          )}
        </button>
        <button
          onClick={toggleCamera}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center ${
            cameraOn
              ? "bg-zinc-700 hover:bg-zinc-600"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {cameraOn ? (
            <Video
              size={18}
              className="sm:w-5 sm:h-5 md:w-[23px] md:h-[23px]"
            />
          ) : (
            <VideoOff
              size={18}
              className="sm:w-5 sm:h-5 md:w-[23px] md:h-[23px]"
            />
          )}
        </button>

        {/* SCREEN SHARE */}
        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          title={isScreenSharing ? "Stop presenting" : "Share screen"}
          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center ${
            isScreenSharing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-zinc-700 hover:bg-zinc-600"
          }`}
        >
          <Monitor
            size={18}
            className="sm:w-5 sm:h-5 md:w-[23px] md:h-[23px]"
          />
        </button>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          title={
            isRecording ? `Stop recording ${formattedTime}` : "Start recording"
          }
          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center ${
            isRecording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-zinc-700 hover:bg-zinc-600"
          }`}
        >
          {isRecording ? (
            <Square size={17} className="sm:w-5 sm:h-5" fill="currentColor" />
          ) : (
            <Circle
              size={19}
              className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"
              fill="currentColor"
            />
          )}
        </button>
        <button
          onClick={copyInvite}
          title="Copy invite link"
          className=" shrink-0  w-10 h-10  sm:w-11 sm:h-11  md:w-14 md:h-14  rounded-full  bg-zinc-700  hover:bg-zinc-600 flex items-center justify-center  "
        >
          <Copy size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />
        </button>
        <button
          onClick={leaveMeeting}
          title="Leave meeting"
          className="  shrink-0  w-11 h-10 sm:w-12 sm:h-11 md:w-16 md:h-16 rounded-full bg-red-600  hover:bg-red-700  flex items-center justify-center  "
        >
          <PhoneOff
            size={21}
            className="sm:w-6 sm:h-6 md:w-[27px] md:h-[27px]"
          />
        </button>
      </div>
      {isRecording && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 sm:mb-3 whitespace-nowrap">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-xl">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-pulse" />
            <span>Recording</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      )}
    </div>
  );
}
