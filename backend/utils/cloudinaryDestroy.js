import cloudinary from "../config/cloudinary.js";

const cloudinaryDestroy = async (files) => {
    if (files.length > 0) {
        await Promise.all(
            files.map(async (file) => {
                try {
                    if (file?.public_id) {
                        await cloudinary.uploader.destroy(file.public_id);
                        console.log(`✅ Deleted: ${file.public_id}`);
                    } else {
                        console.warn("⚠️ Skipped: Missing public_id in file", file);
                    }
                } catch (err) {
                    console.error(`❌ Failed to delete ${file?.public_id}:`, err.message);
                }
            })
        );
    }
};

export default cloudinaryDestroy;