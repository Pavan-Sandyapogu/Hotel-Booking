import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {

        console.log("Webhook Hit");
        const sk=process.env.CLERK_WEBHOOK_SECRET;
        console.log(sk);
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const payload = req.body.toString();

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const evt = whook.verify(payload, headers);

        console.log(evt);

        const eventType = evt.type;
        const data = evt.data;

        switch (eventType) {

            case "user.created": {

                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    username: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                };

                await User.create(userData);

                break;
            }

            case "user.updated": {

                const userData = {
                    email: data.email_addresses[0].email_address,
                    username: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                };

                await User.findByIdAndUpdate(data.id, userData);

                break;
            }

            case "user.deleted": {

                await User.findByIdAndDelete(data.id);

                break;
            }

            default:
                break;
        }

        res.json({
            success: true,
            message: "Webhook received"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

export default clerkWebhooks;