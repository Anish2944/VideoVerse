import React, { useState } from 'react';
import { FaThumbsUp, FaEdit } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { useDeleteVideoCommentMutation, useGetNLikesOnCommentByIdQuery, useToggelLikeOnCommentMutation, useUpdateVideoCommentMutation } from '../../services/LikeNCommentApi';

const CommentBox = ({ username, avatar, content, createdAt, commentId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState(content);

  const [updateVideoComment] = useUpdateVideoCommentMutation();
  const [deleteVideoComment] = useDeleteVideoCommentMutation();
  const [toggelLikeOnComment] = useToggelLikeOnCommentMutation();

  const { data: likes } = useGetNLikesOnCommentByIdQuery(commentId);

  const currentUsername = useSelector(state => state.auth.user.data.username);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const isOwner = isAuthenticated && (currentUsername === username);

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const userExists = likes?.data?.likedBy && Array.isArray(likes.data.likedBy)
    ? likes.data.likedBy.some((like) => like.likeBy.username === currentUsername)
    : false;

  const handleLike = async () => {
    await toggelLikeOnComment(commentId);
  };

  const handleEdit = () => {
    setIsEditing(isOwner);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteVideoComment(commentId);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const handleUpdate = async () => {
    if (!commentText.trim()) {
      console.log('Comment cannot be empty');
      return;
    }
    try {
      await updateVideoComment({ commentId, comment: commentText }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-base-200 rounded-lg shadow-lg mb-4">
      {/* User Avatar */}
      <img
        src={avatar}
        alt="avatar"
        className="w-12 h-12 rounded-full border border-gray-400"
      />

      <div className="flex flex-col w-full">
        {/* Username and Created At */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-bold">{username}</h3>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
          {!isEditing && isOwner && (
            <button onClick={handleEdit} className="hover:text-primary flex gap-1 items-center text-xl">
              <FaEdit />
            </button>
          )}
          {/* Delete button while editing */}
          {isEditing && isOwner && (
            <button onClick={handleDelete} className="hover:text-primary flex items-center">
              <MdDelete className='text-2xl' />
            </button>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <textarea
            className="textarea textarea-bordered w-full"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        ) : (
          <p className="mb-2">{commentText}</p>
        )}

        {/* Like and Update Buttons */}
        <div className="flex items-center justify-between py-2 gap-2">
          <button
            onClick={handleLike}
            className='flex items-center gap-1'
          >
            <FaThumbsUp className={`${userExists ? 'text-primary' : ''}`} />
            {likes?.data?.NoOfLikesOnComment > 0 && (
              <span>{likes?.data?.NoOfLikesOnComment}</span>
            )}
          </button>
          {isEditing && (
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="btn btn-sm btn-success">
                Update
              </button>
              <button onClick={handleCancel} className="btn btn-sm btn-outline">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
