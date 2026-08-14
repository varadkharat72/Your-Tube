import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import React from "react";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  if (!router.isReady) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading channel...</p>
      </div>
    );
  }

  const channel = user;

  const videos = [
    {
      _id: "1",
      videotitle: "Amazing Nature Documentary",
      filename: "nature-doc.mp4",
      filetype: "video/mp4",
      filepath: "/videos/nature-doc.mp4",
      filesize: "500MB",
      videochanel: "Nature Channel",
      Like: 1250,
      views: 45000,
      uploader: "nature_lover",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      videotitle: "Cooking Tutorial: Perfect Pasta",
      filename: "pasta-tutorial.mp4",
      filetype: "video/mp4",
      filepath: "/videos/pasta-tutorial.mp4",
      filesize: "300MB",
      videochanel: "Chef's Kitchen",
      Like: 890,
      views: 23000,
      uploader: "chef_master",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <main className=" w-full min-w-0 min-h-screen overflow-x-hidden ">
      <div className="w-full min-w-0">
        <ChannelHeader channel={channel} user={user} />
      </div>
      <div className="  w-full min-w-0 overflow-x-auto ">
        <Channeltabs />
      </div>
      <div className=" w-full min-w-0  px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8 ">
        <div className="w-full min-w-0 mb-6 sm:mb-8">
          <VideoUploader channelId={id} channelName={channel?.channelname} />
        </div>
        <div className="w-full min-w-0">
          <ChannelVideos videos={videos} />
        </div>
      </div>
    </main>
  );
};

export default Index;
