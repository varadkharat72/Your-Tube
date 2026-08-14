import { Copy, Video } from "lucide-react";

type Props = {
  roomId?: string | string[];
};

export default function MeetingHeader({ roomId }: Props) {
  const room = Array.isArray(roomId) ? roomId[0] : roomId;
  const copyInvite = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/call/${room}`,
      );
      alert("Invite link copied");
    } catch (error) {
      console.error("Copy invite error:", error);
    }
  };

  return (
    <header className="  h-16 sm:h-18  md:h-20  shrink-0  border-b  border-zinc-800  bg-background text-foreground  flex items-center justify-between  px-3  sm:px-4  md:px-5 gap-3  ">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 bg-background text-foreground">
        <div className="  w-9  h-9  sm:w-10  sm:h-10  rounded-lg  sm:rounded-xl  bg-red-600  flex  items-center  justify-center  shrink-0 ">
          <Video size={18} className="sm:w-[21px] sm:h-[21px]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">
            YourTube Meet
          </h1>
          <p className="text-[10px] sm:text-xs text-zinc-500 truncate max-w-[180px] sm:max-w-[300px] md:max-w-[500px]">
            Room: {room || "Loading..."}
          </p>
        </div>
      </div>
      <button
        onClick={copyInvite}
        className="  shrink-0  flex items-center  justify-center  gap-1.5  sm:gap-2 px-3  sm:px-4  py-2  rounded-l  sm:rounded-xl  bg-zinc-800  hover:bg-zinc-700  text-white  text-xs  sm:text-sm  transition "
      >
        <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline">Invite</span>
      </button>
    </header>
  );
}
