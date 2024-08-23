import React, { useState, useEffect } from "react";
import { SiTicktick } from "react-icons/si";
import { RxCrossCircled } from "react-icons/rx";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import ProfileImageInput from "../components/ProfileImageInput";
import { useRegisterUserMutation } from "../services/userApi";
import { useDispatch } from "react-redux";
import { login } from "../app/authSlice";


const Registration = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registerUser, { isLoading, error, isSuccess }] =
    useRegisterUserMutation();
  const [serverError, setServerError] = useState(null);

  const onSubmit = async (data) => {
    
    if (!selectedFile) {
      setError("avatar", {
        type: "manual",
        message: "Profile picture is required",
      });
      return;
    }
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("avatar", selectedFile);

    try {
      const response = await registerUser(formData).unwrap();
      const token = localStorage.setItem('token', response.data.accessToken);
      dispatch(login({user: response.data, token}));

      if (response.success) {
        setSuccess(true);
      } 
    } catch (err) {
      setServerError(
        err.data?.message || "Registration failed. Please try again."
      );
    }
  };

  //Naviating to homePage without side-effects
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(`/`);
      }, 2000);
  
      return () => clearTimeout(timer); // Clear timeout on cleanup
    }
  }, [success, navigate]);

  return (
    <div className="flex flex-col px-10 bg-base-300 p-8 rounded-box justify-center">
      <div className="flex mb-5 justify-center">
        <h2 className="text-center text-primary text-2xl font-bold leading-tight">
          Create Account
        </h2>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <ProfileImageInput onFileChange={(file) => setSelectedFile(file)} />

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
            <div role="alert" className="alert z-10 fixed top-1 w-1/5 alert-success">
              <SiTicktick />
              <span>Registraion Successfull!</span>
            </div>
          )}
          {error && (
            <div role="alert" className="alert alert-error z-10 fixed top-1 w-1/4">
            <RxCrossCircled />
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
