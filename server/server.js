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

connectDB()
connectCloudinary()

const app=express()
app.use(cors())

//API to listen to clerk webhooks
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);


//Middle Ware
app.use(express.json())
app.use(clerkMiddleware())

app.get('/',(req,res)=> res.send("Api is Working correctly"))

app.use('/api/user',userRouter)
app.use('/api/hotels',hotelRouter)
app.use('/api/rooms',roomRouter)
app.use('/api/bookings',bookingRouter)

const port=process.env.PORT || 3000;
const sk=process.env.CLERK_WEBHOOK_SECRET;
console.log(sk);
app.listen(port,()=>console.log(`Server running on port ${port}`)); 