import React, { useState, useRef, useEffect } from "react";
import { RxUpdate } from "react-icons/rx";
import { useSelector } from "react-redux";
import {
  useGetChannelProfileQuery,
  useUpdateAccDetailsMutation,
  useUpdateAvatarMutation,
  useUpdateCoverImageMutation,
} from "../services/userApi";
import { useForm } from "react-hook-form";
import camIcon from "../assets/camIcon.svg";
import { useNavigate } from "react-router-dom";
import { useToggelSubscriptionMutation } from "../services/videoApi";
import TabComponent from "./ProfileComponents/TabComponents";

const Profile = ({ username }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const coverImageInputRef = useRef(null);
  const avatarInputref = useRef(null);
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const currentuser = useSelector((state) => state.auth.user);
  const isOwner = isAuthenticated && currentuser?.data?.username === username;

  const {
    data: user,
    isLoading,
    refetch,
  } = useGetChannelProfileQuery(username);
  const [toggelSubs] = useToggelSubscriptionMutation();

  // Updates query
  const [updateAccDetails, { isLoading: updating }] =
    useUpdateAccDetailsMutation();
  const [updateCoverImage, { isLoading: uploadingCoverImage }] =
    useUpdateCoverImageMutation();
  const [updateAvatar, { isLoading: uploadingAvatar }] =
    useUpdateAvatarMutation();

  const { register, handleSubmit } = useForm();

  const updateDetails = async (data) => {
    try {
      await updateAccDetails(data).unwrap();
      setDialogOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleButtonClick = () => {
    coverImageInputRef.current.click(); // Trigger the file input
  };

  const handleCoverImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("coverImage", file);
      try {
        await updateCoverImage(formData).unwrap();
        console.log("coverImage uploaded");
      } catch (error) {
        console.error("Cover image upload error:", error);
      }
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        await updateAvatar(formData).unwrap();
        console.log("coverImage uploaded");
      } catch (error) {
        console.error("Cover image upload error:", error);
      }
    }
  };

  const handleSubs = async () => {
    await toggelSubs(user?.data?._id);
    refetch();
  };

  return isLoading ? (
    <div className="flex w-full h-full flex-col gap-4">
      <div className="skeleton h-32 w-full"></div>
      <div className="flex items-center gap-4">
        <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
        <div className="flex flex-col gap-4 w-full">
          <div className="skeleton h-4 w-1/2"></div>
          <div className="skeleton h-4 w-3/4"></div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full bg-base-200 rounded-lg">
      <div className="relative w-full h-1/3">
        <div className="relative w-full h-48 bg-gray-300 flex items-center justify-center">
          {/* Check if the user has a cover image */}
          {user?.data?.coverImage ? (
            <img
              src={user?.data?.coverImage}
              alt="coverImage"
              className="w-full h-48 object-cover"
            />
          ) : (
            // Display this section when there is no cover image
            <div className="text-center">
              <p className="text-gray-500">No cover image available</p>
              {isOwner && (
                <button
                  onClick={handleButtonClick}
                  className="btn btn-primary mt-4"
                >
                  <img src={camIcon} alt="Upload" className="inline mr-2" />
                  Upload Cover Image
                </button>
              )}
            </div>
          )}

          {/* Display the button as an overlay if there is a cover image */}
          {isOwner && user?.data?.coverImage && (
            <button
              onClick={handleButtonClick}
              className="btn absolute right-4 bottom-4 bg-opacity-70"
            >
              <img src={camIcon} alt="Change Cover" />
              <input
                type="file"
                ref={coverImageInputRef}
                className="hidden"
                onChange={handleCoverImageChange}
              />
            </button>
          )}
        </div>

        {/* alert message */}
        {(uploadingCoverImage || uploadingAvatar) && (
          <div
            role="alert"
            className="alert z-10 absolute top-1 w-1/3 left-40 alert-info"
          >
            <RxUpdate />
            <span> updating Image...</span>
          </div>
        )}
        <div className="absolute bottom-[-80px] left-4">
          <div className="avatar">
            <div className="w-24 relative rounded-full">
              <img src={user?.data?.avatar} />
            </div>
          </div>
          <div className="absolute right-1 bottom-2">
            {isOwner && (
              <button
                onClick={() => avatarInputref.current.click()}
                className="bg-gray-400 p-1 rounded-full"
              >
                <img height="17px" width="17px" src={camIcon} />
                <input
                  type="file"
                  ref={avatarInputref} // Assign ref
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:justify-between px-5 lg:items-center ml-8 p-2">
        <div className="ml-20 flex flex-col mb-4 lg:mb-0">
          <strong className="text-xl uppercase">{user?.data?.fullName}</strong>
          <strong className="">@{user?.data?.username}</strong>
          <p>{user?.data?.email}</p>
        </div>
        <div className="mb-4 lg:mb-0">
          <p>{user?.data?.subscriberCount} subscribers</p>
          <p>{user?.data?.channelSubscribedToCount} channel Subscribed</p>
        </div>
        {isOwner ? (
          <div>
            <button
              className="btn btn-secondary btn-outline"
              onClick={() => setDialogOpen(true)}
            >
              Edit Profile
            </button>
            {isDialogOpen && (
              <dialog className="modal" open>
                <div className="modal-box">
                  <form method="dialog">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() => setDialogOpen(false)}
                    >
                      ✕
                    </button>
                  </form>
                  <form
                    onSubmit={handleSubmit(updateDetails)}
                    className="flex gap-2 p-4 flex-col"
                  >
                    <label className="input input-bordered flex items-center gap-2">
                      Name:
                      <input
                        type="text"
                        className="grow"
                        defaultValue={user?.data?.fullName}
                        {...register("fullName")}
                      />
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                      Email:
                      <input
                        type="text"
                        className="grow"
                        defaultValue={user?.data?.email}
                        {...register("email")}
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn btn-primary"
                    >
                      {updating ? (
                        <span className="loading loading-bars loading-sm"></span>
                      ) : (
                        "Update"
                      )}
                    </button>
                  </form>
                </div>
              </dialog>
            )}
          </div>
        ) : (
          <button
            onClick={handleSubs}
            className={`btn w-1/3 sm:w-1/6 ${
              user?.data?.isSubscribed ? "btn-outline btn-error" : "btn-primary"
            } mt-2`}
          >
            {user?.data?.isSubscribed ? "Unsbscribe" : "Subscribe"}
          </button>
        )}
      </div>
      <div className="divider"></div>
      <div className="w-full mx-auto p-4">
        <TabComponent isOwner={isOwner} userId={user?.data?._id} />
      </div>
    </div>
  );
};

export default Profile;
