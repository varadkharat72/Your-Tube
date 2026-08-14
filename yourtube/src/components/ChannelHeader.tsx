import React, { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelName = channel?.channelname || "Channel";
  const channelHandle = channelName.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="w-full min-w-0">
      <div className=" relative w-full h-24 sm:h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden " />
      <div className=" w-full px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6  ">
        <div className=" flex flex-col md:flex-row md:items-start gap-4 md:gap-6 ">
          <Avatar className=" w-20 h-20 sm:w-24 sm:h-24 md:w-32md:h-32 -mt-10 sm:-mt-12 md:mt-4 border-4 border-white shrink-0 ">
            <AvatarFallback className=" text-2xl sm:text-3xl md:text-4xl ">
              {channelName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className=" flex-1 min-w-0 space-y-2 ">
            <h1 className=" text-xl sm:text-2xl md:text-3xl lg:text-4x font-bold break-words ">
              {channelName}
            </h1>
            <div className=" flex flex-wrap gap-2 text-sm text-gray-600 ">
              <span className="break-all">@{channelHandle}</span>
            </div>
            {channel?.description && (
              <p className=" text-sm sm:text-base text-gray-700 max-w-2xl break-words leading-relaxed ">
                {channel.description}
              </p>
            )}
          </div>
          {user && user?._id !== channel?._id && (
            <div className=" w-full md:w-auto md:pt-1 shrink-0 ">
              <Button
                onClick={() => setIsSubscribed(!isSubscribed)}
                variant={isSubscribed ? "outline" : "default"}
                className={` w-full md:w-auto min-w-[120px] ${isSubscribed ? "bg-gray-100" : "bg-red-600 hover:bg-red-700"}`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
