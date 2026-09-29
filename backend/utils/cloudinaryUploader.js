import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const cloudinaryUpload = async (files, folderNames) => {

    const uploadPromises = files.map(async (file) => {

        const result = await cloudinary.uploader.upload(file.path, { folder: folderNames, allowed_formats: ["jpg", "jpeg", "png", "webp"] });

        // Delete temp file.
        try { fs.unlinkSync(file.path); }
        catch (error) { console.error("Temp file delete failed:", error); }

        return {
            url: result.url,
            public_id: result.public_id,
        }
    });

    try {
        const uploadedFiles = await Promise.all(uploadPromises);
        console.log("Cloudinary file uploaded ✅");
        return uploadedFiles; // Add files array.
    } catch (error) {
        console.error("Cloudinary file upload error ❌:", error);
    };

};

export default cloudinaryUpload;