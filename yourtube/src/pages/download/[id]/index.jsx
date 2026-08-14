import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

const index = () => {
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-sm sm:text-base">Loading...</div>
      </div>
    );
  }

  if (!videos) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            Video not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
          <div className="lg:col-span-2 min-w-0 space-y-4 sm:space-y-5">
            <div className="w-full overflow-hidden rounded-lg">
              <Videopplayer video={videos} />
            </div>
            <div className="w-full min-w-0">
              <VideoInfo video={videos} />
            </div>
            <div className="w-full min-w-0">
              <Comments videoId={videos._id} />
            </div>
          </div>
          <div className="w-full min-w-0 lg:sticky lg:top-4 lg:self-start">
            <RelatedVideos videos={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;