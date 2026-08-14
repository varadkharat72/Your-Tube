import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import { VideoPlayer } from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const [videos, setvideos] = useState<any>(null);
  const [video, setvideo] = useState<any>(null);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetchvideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await axiosInstance.get("/video/getall");
        const video = res.data?.filter((vid: any) => vid._id === id);
        setvideos(video[0]);
        setvideo(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        Loading..
      </div>
    );
  }

  if (!videos) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        Video not found
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full">
      <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          <div className="lg:col-span-2 min-w-0 space-y-4">
            <div className="w-full">
              <VideoPlayer
                video={videos}
                nextVideoId={(() => {
                  const currentIndex = video.findIndex(
                    (vid: any) => vid._id === videos._id,
                  );

                  return currentIndex >= 0 && currentIndex < video.length - 1
                    ? video[currentIndex + 1]._id
                    : undefined;
                })()}
              />
            </div>
            <div className="w-full min-w-0">
              <VideoInfo video={videos} />
            </div>
            <div className="w-full min-w-0">
              <Comments videoId={videos._id} />
            </div>
          </div>
          <aside className="w-full min-w-0 space-y-4">
            <RelatedVideos videos={video} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Index;
