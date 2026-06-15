import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder = "learnkro") => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder,
      resource_type: "auto",
      chunk_size: 6000000,
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const uploadVideo = async (file, folder = "learnkro/videos") => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder,
      resource_type: "video",
      chunk_size: 6000000,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    };
  } catch (error) {
    throw new Error(`Video upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Delete from cloudinary failed:", error.message);
  }
};

export default cloudinary;
