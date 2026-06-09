import User from "../models/User.js";
import { clerkClient, getAuth } from "@clerk/express";

export const protect = async (req, res, next) => {
    try {

        // CORRECT WAY
        console.log("AUTH HEADER:", req.headers.authorization);
        const auth=getAuth(req);
        console.log(auth);
        const { userId } = auth;
        console.log(userId);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        let user = await User.findById(userId);

        // AUTO CREATE USER IF NOT EXISTS
        if (!user) {

            const clerkUser = await clerkClient.users.getUser(userId);

            const email =
                clerkUser.emailAddresses?.[0]?.emailAddress || "";

            const username =
                `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim()
                || email.split("@")[0]
                || "Guest";

            user = await User.create({
                _id: clerkUser.id,
                username,
                email,
                image: clerkUser.imageUrl || "",
            });

            console.log("✅ User synced from Clerk");
        }

        req.user = user;

        next();

    } catch (error) {

        console.log("AUTH ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};