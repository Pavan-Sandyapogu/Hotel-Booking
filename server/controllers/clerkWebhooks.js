import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = req.body.toString();
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // 1. Verify Webhook (Will throw an error if invalid)
        const evt = whook.verify(payload, headers);

        const eventType = evt.type;
        const data = evt.data;

        // 2. Handle Events
        switch (eventType) {
            case "user.created": {
                const primaryEmail = data.email_addresses?.find(
                    e => e.id === data.primary_email_address_id
                )?.email_address || data.email_addresses?.[0]?.email_address || "";

                const firstName = data.first_name || "";
                const lastName = data.last_name || "";
                const username = `${firstName} ${lastName}`.trim() || primaryEmail.split("@")[0] || "Guest";

                const userData = {
                    _id: data.id,
                    email: primaryEmail,
                    username,
                    image: data.image_url || "",
                };
                await User.create(userData);
                break;
            }

            case "user.updated": {
                const primaryEmail = data.email_addresses?.find(
                    e => e.id === data.primary_email_address_id
                )?.email_address || data.email_addresses?.[0]?.email_address || "";

                const fName = data.first_name || "";
                const lName = data.last_name || "";
                const uname = `${fName} ${lName}`.trim() || primaryEmail.split("@")[0] || "Guest";

                const updatedData = {
                    email: primaryEmail,
                    username: uname,
                    image: data.image_url || "",
                };
                await User.findByIdAndUpdate(data.id, updatedData);
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                break;
            }

            default:
                break;
        }

        // 3. Respond with 200 OK so Clerk knows it succeeded
        res.status(200).json({
            success: true,
            message: "Webhook received and processed"
        });

    } catch (error) {
        console.error("Webhook Error:", error.message);

        // 4. CRITICAL: Send a 400 Bad Request so Clerk retries the webhook
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export default clerkWebhooks;