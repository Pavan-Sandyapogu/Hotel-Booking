import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { reqisterHotel } from "../controllers/hotelController.js";

const hotelRouter=express.Router();


hotelRouter.post('/',protect,reqisterHotel);


export default hotelRouter;