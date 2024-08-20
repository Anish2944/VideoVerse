import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  useGetChannelProfileQuery,
  useUpdateAccDetailsMutation,
  useUpdateAvatarMutation,
  useUpdateCoverImageMutation,
} from "../services/userApi";
import { useForm } from "react-hook-form";
import camIcon from "../assets/camIcon.svg";

const Profile = ({ username }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const coverImageInputRef = useRef(null);
  const avatarInputref = useRef(null);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const currentuser = useSelector((state) => state.auth.user);
  const isOwner = isAuthenticated && currentuser?.data?.username === username;

  const { data: user, isLoading } = useGetChannelProfileQuery(username);

  //updates query
  const [updateAccDetails, { isLoading: updating }] =
    useUpdateAccDetailsMutation();
  const [updateCoverImage, { isLoading: uploadingCoverImage }] =
    useUpdateCoverImageMutation();
  const [updateAvatar,{isLoading: uploadingAvatar}] = useUpdateAvatarMutation();

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
    <div className="w-full">
      <div className="relative w-full h-1/3">
        <img
          src={user?.data?.coverImage}
          alt="coverImage"
          className="w-full h-48 object-cover"
        />
        { isOwner && <button
          onClick={handleButtonClick}
          className="btn absolute right-4 bottom-[2px] "
        >
          <img src={camIcon} />
          <input
            type="file"
            ref={coverImageInputRef} // Assign ref
            className="hidden"
            onChange={handleCoverImageChange}
          />
        </button>}
        {(uploadingCoverImage || uploadingAvatar) && (
          <div role="alert" className="alert z-10 absolute top-1 w-1/3 left-40 alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span> updating coverImage...</span>
          </div>
        )}
        <div className="absolute bottom-[-80px] left-4">
          <div className="avatar ">
            <div className="w-24  relative rounded-full">
              <img src={user?.data?.avatar} />
            </div>
          </div>
          <div className="absolute right-1 bottom-2">
            {isOwner && <button onClick={() => avatarInputref.current.click()} className="bg-gray-400 p-1 rounded-full">
              <img height="17px" width="17px" src={camIcon} />
              <input
                type="file"
                ref={avatarInputref} // Assign ref
                className="hidden"
                onChange={handleAvatarChange}
              />
            </button>}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center ml-8 p-2">
        <div className="ml-20 flex flex-col">
          <strong className="text-xl uppercase">{user?.data?.fullName}</strong>
          <strong className="">@{user?.data?.username}</strong>
          <p>{user?.data?.email}</p>
        </div>
        <div>
          <p>{user?.data?.subscriberCount} subscribers</p>
          <p>{user?.data?.channelSubscribedToCount} channel Subscribed</p>
        </div>
        {isOwner ? (
          <div>
            {/* Open the modal using document.getElementById('ID').showModal() method */}
            {/* You can open the modal using document.getElementById('ID').showModal() method */}
            <button
              className="btn btn-outline"
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              Edit Profile
            </button>
            {isDialogOpen && (
              <dialog className="modal" open>
                <div className="modal-box">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
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
            disabled={user?.data?.isSubscribed}
            className="btn btn-primary"
          >
            {user?.data?.isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>
      <div className="divider"></div>
      <div className="tabs tabs-bordered">
        <a className="tab">Videos</a>
        {isOwner && <a className="tab tab-active">Liked Videos</a>}
        {isOwner && <a className="tab">Playlist</a>}
      </div>
    </div>
  );
};

export default Profile;
