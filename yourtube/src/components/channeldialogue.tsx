import { useRouter } from "next/router";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import axiosInstance from "../lib/axiosinstance";
import { useUser } from "../lib/AuthContext";

const Channeldialogue = ({ isopen, onclose, channeldata, mode }: any) => {
  const { user, login } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setisSubmitting] = useState(false);
  useEffect(() => {
    if (channeldata && mode === "edit") {
      setFormData({
        name: channeldata.name || "",
        description: channeldata.description || "",
      });
    } else {
      setFormData({
        name: user?.name || "",
        description: "",
      });
    }
  }, [channeldata, mode, user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlesubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    setisSubmitting(true);
    try {
      const payload = {
        channelname: formData.name,
        description: formData.description,
      };
      const response = await axiosInstance.patch(
        `/user/update/${user._id}`,
        payload,
      );
      login(response?.data);
      router.push(`/channel/${user._id}`);
      setFormData({
        name: "",
        description: "",
      });
      onclose();
    } catch (error) {
      console.error("Failed to save channel:", error);
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <Dialog open={isopen} onOpenChange={onclose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6 ">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {mode === "create" ? "Create your channel" : "Edit your channel"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handlesubmit} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full"
              placeholder="Enter channel name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Channel Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell viewers about your channel..."
              className=" w-full min-h-[100px] resize-y "
            />
          </div>
          <DialogFooter className=" flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-0 ">
            <Button
              type="button"
              variant="outline"
              onClick={onclose}
              className=" w-full sm:w-auto "
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className=" w-full sm:w-auto "
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create Channel"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Channeldialogue;
