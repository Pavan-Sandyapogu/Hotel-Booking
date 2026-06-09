import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

connectDB()
connectCloudinary()

const app=express()
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}))

//API to listen to clerk webhooks
app.use(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);


//Middle Ware
app.use(clerkMiddleware())
app.use(express.json())


app.get('/',(req,res)=> res.send("Api is Working correctly"))

app.use('/api/user',userRouter)
app.use('/api/hotels',hotelRouter)
app.use('/api/rooms',roomRouter)
app.use('/api/bookings',bookingRouter)
app.use('/api/payment', paymentRouter);

const port=process.env.PORT || 3000;
//const sk=process.env.CLERK_WEBHOOK_SECRET;
//console.log(sk);
app.listen(port,()=>console.log(`Server running on port ${port}`)); 