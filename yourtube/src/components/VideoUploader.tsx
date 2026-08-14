import { Check, FileVideo, Upload, X } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import axiosInstance from "@/lib/axiosinstance";

const VideoUploader = ({ channelId, channelName }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlefilechange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file.");
        return;
      }
      if (file.size > 5000 * 1024 * 1024) {
        toast.error("File size exceeds 5000MB limit.");
        return;
      }
      setVideoFile(file);
      const filename = file.name;
      if (!videoTitle) {
        setVideoTitle(filename);
      }
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoTitle("");
    setIsUploading(false);
    setUploadProgress(0);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelUpload = () => {
    if (isUploading) {
      toast.error("Your video upload has been cancelled");
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !videoTitle.trim()) {
      toast.error("Please provide file and title");
      return;
    }
    const formdata = new FormData();
    formdata.append("file", videoFile);
    formdata.append("videotitle", videoTitle);
    formdata.append("videochanel", channelName);
    formdata.append("uploader", channelId);
    console.log(formdata);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const res = await axiosInstance.post("/video/upload", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progresEvent: any) => {
          const progress = Math.round(
            (progresEvent.loaded * 100) / progresEvent.total,
          );

          setUploadProgress(progress);
        },
      });
      toast.success("Upload successfully");
      resetForm();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("There was an error uploading your video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-background rounded-lg p-3 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload a video</h2>
      <div className="space-y-4">
        {!videoFile ? (
          <div
            className=" w-full  border-2 border-dashed border-gray-300 rounded-lg  p-5  sm:p-8  text-center  cursor-pointer  hover:bg-gray-100  transition-colors "
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-9 h-9 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-base sm:text-lg font-medium">
              Drag and drop video files to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select files
            </p>
            <p className="text-xs text-gray-400 mt-4">
              MP4, WebM, MOV or AVI • Up to 5000MB
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/*"
              onChange={handlefilechange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className=" flex  flex-col  sm:flex-row  sm:items-center  gap-3  p-3  bg-background rounded-lg border ">
              <div className="p-2 rounded-md shrink-0 self-start sm:self-auto">
                <FileVideo className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <p className="font-medium truncate text-sm sm:text-base">
                  {videoFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelUpload}
                  className="self-end sm:self-auto shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
              {uploadComplete && (
                <div className="bg-green-100 p-1 rounded-full shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="w-full">
                <Label htmlFor="title">Title (required)</Label>
                <Input
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Add a title that describes your video"
                  disabled={isUploading || uploadComplete}
                  className="mt-1 w-full"
                />
              </div>
            </div>
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between gap-2 text-sm">
                  <span>Uploading...</span>
                  <span className="shrink-0">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 w-full" />
              </div>
            )}
            <div className="  flex  flex-col-reverse sm:flex-row justify-end  gap-2  sm:gap-3  pt-1  ">
              {!uploadComplete && (
                <>
                  <Button
                    onClick={cancelUpload}
                    disabled={uploadComplete}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={
                      isUploading || !videoTitle.trim() || uploadComplete
                    }
                    className="w-full sm:w-auto"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
