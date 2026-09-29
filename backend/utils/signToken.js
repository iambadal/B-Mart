import jwt from "jsonwebtoken";

export const signToken = (payload, secret, expiresIn = "15m") => {
    return jwt.sign(payload, secret, { expiresIn });
};