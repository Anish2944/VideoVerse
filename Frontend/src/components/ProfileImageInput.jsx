import React, { useState } from 'react';

function ProfileImageInput({ onFileChange }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      console.log("File selected",file)
      setSelectedImage(imageUrl);  // Set the image preview using URL.createObjectURL
      onFileChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <label htmlFor="profile-image" className="cursor-pointer">
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Profile Image"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              alt="Default Profile Image"
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
      </label>
      <input
        type="file"
        id="profile-image"
        className="hidden"
        onChange={handleImageChange}  // Update the preview when the file is selected
      />
    </div>
  );
}

export default ProfileImageInput;



