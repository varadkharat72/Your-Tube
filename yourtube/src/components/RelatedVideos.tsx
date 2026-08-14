import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
  }>;
}

const vid = "/video/vdo.mp4";

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="w-full min-w-0 space-y-3 sm:space-y-4">
      {videos.map((video) => (
        <Link
          key={video._id}
          href={`/watch/${video._id}`}
          className=" flex gap-2 sm:gap-3 group w-full min-w-0 "
        >
          <div className="  relative  w-32 sm:w-40  md:w-44  lg:w-40  aspect-video   rounded-md  sm:rounded-lg  overflow-hidden  shrink-0 bg-black  ">
            <video
              src={vid}
              className="  w-full  h-full  object-cover  group-hover:scale-105 transition-transform  duration-200  "
            />
          </div>
          <div className=" flex-1 min-w-0 overflow-hidden ">
            <h3 className="  font-medium  text-xs  sm:text-sm  line-clamp-2  break-words leading-snug group-hover:text-blue-600 transition-colors ">
              {video.videotitle}
            </h3>
            <p className=" text-[11px]  sm:text-xs mt-1 text-gray-600 truncate ">
              {video.videochanel}
            </p>
            <p className=" text-[11px] sm:text-xs text-gray-600 mt-0.5 truncate ">
              {video.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
