import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import ProfileImageInput from "./ProfileImageInput";
import { useRegisterUserMutation } from "../services/userApi";
import { useDispatch } from "react-redux";
import { login } from "../app/authSlice";

const Registration = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [registerUser, { isLoading, error, isSuccess }] =
    useRegisterUserMutation();
  const [serverError, setServerError] = useState(null);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    try {
      const response = await registerUser(formData).unwrap();
      localStorage.setItem('token', response.data.accessToken);
      dispatch(login(response.data));
      if (response.success) {
        setInterval(() => {
          navigate('/');
        }, 2000);
      } 
    } catch (err) {
      setServerError(
        err.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const onError = (errors) => {
    console.log(errors);
  };

  return (
    <div className="flex flex-col px-10 bg-base-200 p-8 rounded-box justify-center">
      <div className="flex mb-5 justify-center">
        <h2 className="text-center text-primary text-2xl font-bold leading-tight">
          Create Account
        </h2>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="flex flex-col gap-3">
            <ProfileImageInput onFileChange={(file) => setSelectedFile(file)} />
            {errors.avatar && (
              <span className="text-error">Image is required</span>
            )}

            <label className="input input-bordered flex items-center gap-2">
              Name:
              <input
                type="text"
                className="grow"
                {...register("fullName", { required: true })}
              />
            </label>
            {errors.fullName && (
              <span className="text-error">Name is required</span>
            )}

            <label className="input input-bordered flex items-center gap-2">
              Username:
              <input
                type="text"
                className="grow"
                {...register("username", { required: true })}
              />
            </label>
            {errors.username && (
              <span className="text-error">Username is required</span>
            )}

            <label className="input input-bordered flex items-center gap-2">
              Email:
              <input
                type="email"
                className="grow"
                {...register("email", { required: true })}
              />
            </label>
            {errors.email && (
              <span className="text-error">Email is required</span>
            )}

            <label className="input input-bordered flex items-center gap-2">
              Password:
              <input
                type="password"
                className="grow"
                {...register("password", { required: true })}
              />
            </label>
            {errors.password && (
              <span className="text-error">Password is required</span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? <span className="loading loading-bars loading-sm"></span>  : "Register"}
            </button>
          </div>
          {isSuccess && (
            <div role="alert" className="alert z-10 absolute top-1 w-1/5 alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Registraion Successfull!</span>
            </div>
          )}
          {error && (
            <div role="alert" className="alert alert-error z-10 absolute top-1 w-1/4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{serverError || "Failed to register. Please try again."}</span>
          </div>
          )}
          
        </form>
        <p className="mt-2 text-center text-base text-text2">
          Already have an account?&nbsp;
          <Link
            to="/login"
            className="font-medium text-start transition-all duration-200 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;
