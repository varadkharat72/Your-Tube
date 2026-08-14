import VideoCard from "./videocard";

export default function ChannelVideos({ videos }: any) {
  const videoList = videos || [];
  if (videoList.length === 0) {
    return (
      <div className=" w-full min-w-0 text-center py-10 sm:py-12 px-4 ">
        <p className="text-sm sm:text-base">
          No videos uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className=" w-full min-w-0">
      <h2 className=" text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ">
        Videos
      </h2>
      <div className=" grid w-full min-w-0  grid-cols-1 sm:grid-cols-2  lg:grid-cols-3  xl:grid-cols-4  gap-3  sm:gap-4 ">
        {videoList.map((video: any) => (
          <div key={video._id} className=" min-w-0 w-full ">
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}
