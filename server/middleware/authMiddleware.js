import User from "../models/User.js";

// Middleware to check if user is authenticated

export const protect = async (req, res, next) => {
    try {

        const  userId  = req.auth?.userId;

        if (!userId) {
            return res.json({
                success: false,
                message: "Not authenticated"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found in DB"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};