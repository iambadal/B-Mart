import User from "../models/User.js";
import cloudinaryDestroy from "../utils/cloudinaryDestroy.js";

const userDelete = async (userIds, hard = false) => {
    try {
        // Confirm array...
        const ids = Array.isArray(userIds) ? userIds : [userIds];

        if (!hard) {
            // Soft delete...
            // Delete cloudinary avatar.
            const allUsersAvatars = await User.find({ _id: { $in: ids } }, 'avatar').exec();
            const allAvatars = allUsersAvatars.flatMap(allAvatar => {
                return allAvatar.avatar;
            });

            await cloudinaryDestroy(allAvatars);

            // Mark as deleted users in bulk.
            await User.updateMany({ _id: { $in: ids } }, { $set: { isDeleted: true, deletedAt: new Date() } });

            // Optional to clear sensitive related data [ cart, wishlist]
            // await Cart.deleteMany({ user: userId });
            // await Wishlist.deleteMany({ user: userId });

            console.log("User soft deleted successfully");

        } else {
            // Hard delete...
            // Delete cloudinary avatar.
            const allUsersAvatars = await User.find({ _id: { $in: ids } }, 'avatar').exec();
            const allAvatars = allUsersAvatars.flatMap(allAvatar => {
                return allAvatar.avatar;
            });

            await cloudinaryDestroy(allAvatars);

            // Delete users.
            await User.deleteMany({ _id: { $in: ids } });

            // Delete all related data...
            // await Cart.deleteMany({ _id: { $in: ids });
            // await Wishlist.deleteMany({ _id: { $in: ids });
            // await Order.deleteMany({ _id: { $in: ids });

            console.log("User and all related data deleted successfully");
        }

    } catch (error) {
        console.error("User delete error:", error);
    }

};

export default userDelete;