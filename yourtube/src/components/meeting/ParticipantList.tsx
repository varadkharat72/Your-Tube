import { Mic, MicOff, Monitor, Video, VideoOff } from "lucide-react";

type Participant = {
  id: string;
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
};

type Props = {
  participants: Participant[];
  micOn: boolean;
  cameraOn: boolean;
  screenSharer: string | null;
};

export default function ParticipantList({
  participants,
  micOn,
  cameraOn,
  screenSharer,
}: Props) {
  return (
    <aside className="  w-full  md:w-64  lg:w-72  xl:w-80  shrink-0  border-t  md:border-t-0  md:border-l  border-zinc-800 bg-zinc-950 flex flex-col min-h-0 ">
      <div className="p-3 sm:p-4 border-b border-zinc-800 shrink-0">
        <h2 className="font-semibold text-white text-sm sm:text-base">
          Participants ({participants.length + 1})
        </h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-zinc-800">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-white text-sm truncate">You</span>

            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              {micOn ? (
                <Mic size={16} className="sm:w-[17px] sm:h-[17px]" />
              ) : (
                <MicOff
                  size={16}
                  className="sm:w-[17px] sm:h-[17px] text-red-500"
                />
              )}
              {cameraOn ? (
                <Video size={16} className="sm:w-[17px] sm:h-[17px]" />
              ) : (
                <VideoOff
                  size={16}
                  className="sm:w-[17px] sm:h-[17px] text-red-500"
                />
              )}
            </div>
          </div>
        </div>
        {participants.map((participant) => {
          const isPresenting = screenSharer === participant.id;
          return (
            <div
              key={participant.id}
              className="px-3 sm:px-4 py-3 sm:py-4 border-b border-zinc-800"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white truncate min-w-0">
                  {participant.id?.slice(0, 8) || "Participant"}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {isPresenting && (
                    <Monitor
                      size={16}
                      className="sm:w-[17px] sm:h-[17px] text-green-500"
                    />
                  )}

                  {participant.cameraStream ? (
                    <Video
                      size={16}
                      className="sm:w-[17px] sm:h-[17px] text-zinc-400"
                    />
                  ) : (
                    <VideoOff
                      size={16}
                      className="sm:w-[17px] sm:h-[17px] text-red-500"
                    />
                  )}
                </div>
              </div>
              {isPresenting && (
                <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-green-500">
                  Presenting screen
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="  h-44  sm:h-48  md:h-52  lg:h-56  shrink-0 border-t border-zinc-800 flex flex-col  ">
        <div className="p-3 sm:p-4 border-b border-zinc-800 font-semibold text-sm sm:text-base">
          Chat
        </div>
        <div className="flex-1 flex items-center justify-center text-xs sm:text-sm text-zinc-600 px-4 text-center">
          Chat coming soon
        </div>
        <div className="p-2.5 sm:p-3">
          <input
            disabled
            placeholder="Type message..."
            className="  w-full  px-3 py-2  rounded-lg  bg-zinc-900  border border-zinc-800  text-xs  sm:text-sm  text-zinc-500  outline-none "
          />
        </div>
      </div>
    </aside>
  );
}
