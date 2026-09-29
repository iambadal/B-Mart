import { signToken } from "./signToken.js";

export const buildAuthResponse = (user) => {
    // Issue Access Token (short-lived)
    const accessToken = signToken(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        "15m"
    );

    // Issue Refresh Token (long-lived)
    const refreshToken = signToken(
        { id: user._id, role: user.role },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        "7d"
    );

    return {
        tokens: {
            accessToken,
            refreshToken,
        },
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
    };
};