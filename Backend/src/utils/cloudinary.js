import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './ApiError.js';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Upload an image
    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null;
            const uploadResult = await cloudinary.uploader
            .upload(
                localFilePath, {
                    resource_type: 'auto',
                }
            )
            // console.log("File uploded on CLodinary", uploadResult.url);
            fs.unlinkSync(localFilePath)
            return uploadResult;
        } catch (error) {
            fs.unlinkSync(localFilePath) // remove loaclly saved temporary file 
            return null;
        }
    } 
    const extractPublicId = (avatarUrl) => {
        const urlParts = avatarUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        return publicId;
      };
      const deleteFromCloudinary = async (url) => {
          const publicId = extractPublicId(url);
          const isVideo = url.match(/\.(mp4|avi|mkv|mov)$/i);
          try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: isVideo ? "video" : "image" // Set the resource type dynamically
            });
            console.log("Cloudinary deletion result:", result);
    
            if (result.result !== "ok") {
                throw new ApiError(500, "Existing file could not be deleted from Cloudinary");
            }
    
            return result;
        } catch (error) {
            console.error("Error during Cloudinary deletion:", error);
            throw new ApiError(500, "Existing file could not be deleted from Cloudinary");
        }
    }
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    // console.log(autoCropUrl);    


export {uploadOnCloudinary,deleteFromCloudinary}