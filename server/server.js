import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB()
const app=express()
app.use(cors())
//Middle Ware
app.use(express.json())
app.use(clerkMiddleware())

//API to listen to clerk webhooks
app.use("/api/clerk",clerkWebhooks)
app.get('/',(req,res)=> res.send("Api is Working correctly"))

const port=process.env.PORT || 3000;

app.listen(port,()=>console.log(`Server running on port ${port}`)); 