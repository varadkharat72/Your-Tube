import React, { useEffect, useState } from "react";
import { useUser } from "../lib/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import axiosInstance from "../lib/axiosinstance";
import { ThumbsUp, ThumbsDown, Languages } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
interface Comment {
  _id: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  userlocation: string;
  commentedon: string;
  likes: number;
  dislikes: number;
  translatedText?: string;
  showTranslation?: boolean;
  likedByUser?: boolean;
  dislikedByUser?: boolean;
}

const Comment = ({ videoId }: { videoId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const fetchedComments = [
    {
      _id: "1",
      userid: "1",
      commentbody: "Great platform! Really enjoyed commenting here.",
      usercommented: "John Doe",
      userlocation: "Dehli NCR",
      commentedon: new Date(Date.now() - 3600000).toISOString(),
      likes: 5,
      dislikes: 1,
    },
    {
      _id: "2",
      userid: "2",
      commentbody: "नमस्ते दुनिया! यह एक टिप्पणी है।",
      usercommented: "Jane Smith",
      userlocation: "Mumbai, Maharshtra",
      commentedon: new Date(Date.now() - 7200000).toISOString(),
      likes: 3,
      dislikes: 0,
    },
  ];
  useEffect(() => {
    loadComments();
  }, []);

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
    return <div>Loading history...</div>;
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    const specialCharacter = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharacter.test(newComment)) {
      alert("Special characters are not allowed");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        userid: user._id,
        videoid: videoId,
        commentbody: newComment,
        usercommented: user.name,
        userlocation: user.location,
      });
      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: Date.now().toString(),
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          userlocation: user.location || "Unknown",
          commentedon: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
        };
        setComments([newCommentObj, ...comments]);
      }
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
    console.log(user);
    console.log(user?.location);
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
        { commentbody: editText },
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c,
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
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (id: string) => {
    await axiosInstance.post(`/comment/likecomment/${id}`, {
      userid: user._id,
    });
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id !== id) return comment;

        if (comment.likedByUser) {
          return {
            ...comment,
            likes: comment.likes - 1,
            likedByUser: false,
          };
        }

        return {
          ...comment,
          likes: comment.likes + 1,
          dislikes: comment.dislikedByUser
            ? comment.dislikes - 1
            : comment.dislikes,
          likedByUser: true,
          dislikedByUser: false,
        };
      }),
    );
  };

  const handleDislike = async (id: string) => {
    await axiosInstance.post(`/comment/dislikecomment/${id}`, {
      userid: user._id,
    });
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id !== id) return comment;

        if (comment.dislikedByUser) {
          return {
            ...comment,
            dislikes: comment.dislikes - 1,
            dislikedByUser: false,
          };
        }

        return {
          ...comment,
          dislikes: comment.dislikes + 1,
          likes: comment.likedByUser ? comment.likes - 1 : comment.likes,
          dislikedByUser: true,
          likedByUser: false,
        };
      }),
    );
  };

  const handleTranslate = async (id: string) => {
    const comment = comments.find((c) => c._id === id);

    if (!comment) return;

    try {
      const res = await axiosInstance.post("/comment/translate", {
        text: comment.commentbody,
      });

      setComments((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                translatedText: res.data.translatedText,
                showTranslation: !c.showTranslation,
              }
            : c,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-semibold">{comments.length} Comments</h2>
      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Clear
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {comment.usercommented.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm ">
                      {comment.usercommented} • {comment.userlocation}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(comment.commentedon))} ago
                    </span>
                  </div>
                  {editingCommentId === comment._id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={handleUpdateComment}
                          disabled={!editText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditText("");
                          }}
                        >
                          Cancle
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm">{comment.commentbody}</p>
                        {comment.showTranslation && (
                          <p className="text-sm text-blue-600 mt-1">
                            Translation: {comment.translatedText}
                          </p>
                        )}
                      </div>
                      {comment.userid === user?._id && (
                        <div className="flex gap-2 mt-2 text-sm text-gray-500">
                          <button onClick={() => handleEdit(comment)}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(comment._id)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleLike(comment._id)}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${
                          comment.likedByUser ? " fill-black text-black" : ""
                        }`}
                      />
                      <span className="ml-1">{comment.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDislike(comment._id)}
                    >
                      <ThumbsDown
                        className={`w-4 h-4 ${
                          comment.dislikedByUser ? " fill-black text-black" : ""
                        }`}
                      />
                      <span className="ml-1">{comment.dislikes}</span>
                    </Button>
                    <Button onClick={() => handleTranslate(comment._id)}>
                      Translate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comment;
