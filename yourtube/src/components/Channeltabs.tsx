import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/axiosinstance";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
}

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);

      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=" w-full min-w-0 px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500 ">
        Loading comments...
      </div>
    );
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
      });

      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: Date.now().toString(),
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          commentedon: new Date().toISOString(),
        };

        setComments((prev) => [newCommentObj, ...prev]);
      }
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };
  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        {
          commentbody: editText,
        },
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === editingCommentId
              ? {
                  ...comment,
                  commentbody: editText,
                }
              : comment,
          ),
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((comment) => comment._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" w-full min-w-0 px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6 ">
      <h2 className=" text-lg sm:text-xl font-semibold ">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>
      {user && (
        <div className=" flex items-start gap-2 sm:gap-4 w-full min-w-0 ">
          <Avatar className=" w-8 h-8 sm:w-10 sm:h-10 shrink-0 ">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className=" flex-1 min-w-0 space-y-2 ">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className=" w-full min-h-16 sm:min-h-20 resize-none border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 "
            />
            <div className=" flex flex-wrap gap-2 justify-end ">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Commenting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className=" w-full min-w-0 space-y-5 sm:space-y-6 ">
        {comments.length === 0 ? (
          <p className=" text-sm text-gray-500 italic ">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className=" flex items-start gap-2 sm:gap-4 w-full min-w-0 "
            >
              <Avatar className=" w-8 h-8 sm:w-10 sm:h-10 shrink-0 ">
                <AvatarImage src="/placeholder.svg" />

                <AvatarFallback>
                  {comment.usercommented?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className=" flex-1 min-w-0 overflow-hidden ">
                <div className=" flex flex-wrap items-center gap-x-2 gap-y-1 mb-1 ">
                  <span className=" font-medium text-sm break-words max-w-full ">
                    {comment.usercommented}
                  </span>
                  <span className=" text-xs text-gray-500 whitespace-nowrap ">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>
                {editingCommentId === comment._id ? (
                  <div className=" w-full space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className=" w-full min-h-20 resize-y "
                    />

                    <div className=" flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleUpdateComment}
                        disabled={!editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className=" text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                      {comment.commentbody}
                    </p>
                    {comment.userid === user?._id && (
                      <div className=" flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 ">
                        <button
                          type="button"
                          onClick={() => handleEdit(comment)}
                          className=" hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment._id)}
                          className=" hover:text-red-600 transition-colors "
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
