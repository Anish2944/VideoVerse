import React, { useState, useEffect } from "react";
import Profile from "../components/Profile";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const OthersProfile = () => {
    const { username }= useParams();

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-6">
      {username ? (
        <Profile username={username} />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
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
        </div>
      )}
    </div>
  );
};

export default OthersProfile;
