import React, { useState } from "react";
import CommentBox from "./CommentBox";
import { useAddVideoCommentMutation, useGetVideoCommentsQuery, useUpdateVideoCommentMutation } from "../../services/LikeNCommentApi";

const CommentSection = ({ videoId }) => {
  const { data: commentsData } = useGetVideoCommentsQuery(videoId);
  const [addVideoComment] = useAddVideoCommentMutation();

  const [content,setContent] = useState('');

  const handleAdd = async () => {
    if (!content.trim()) {
      console.log('Comment cannot be empty');
      return;
    }
    try {
      const response = await addVideoComment({ videoId, content }).unwrap();
      console.log('Comment added successfully:', response);
      setContent(''); // Clear comment after adding
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  
  

  return (
    <div className="mt-5">
      <div className="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div className="collapse-title flex items-center gap-3">
          <p className="text-xl font-medium" >Comments</p>
          <p>{commentsData?.data?.totalComments || ''}</p>
        </div>
        <div className="collapse-content">
          {/* comment box */}
          <div className="flex gap-2 p-4">
            <textarea
              className="textarea w-full textarea-bordered"
              placeholder="Write your comment here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>{" "}
            <button onClick={handleAdd} className="btn btn-primary">add</button>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {commentsData?.data?.comments?.length > 0 ? (
              <div>
                {commentsData?.data?.comments.map((comment) => (
                  <CommentBox
                    key={comment._id}
                    commentId={comment._id}
                    username={comment.owner.username}
                    avatar={comment.owner.avatar}
                    content={comment.content}
                    createdAt={comment.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div>No Comments</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
