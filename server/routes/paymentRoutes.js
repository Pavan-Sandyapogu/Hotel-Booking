import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {createOrder,verifyPayment,failedPayment} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order",protect,createOrder);

paymentRouter.post("/verify-payment",protect,verifyPayment);

paymentRouter.post("/failed",protect,failedPayment);

export default paymentRouter;