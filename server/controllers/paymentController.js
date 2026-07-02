import crypto from "crypto";
import razorpay from "../configs/razorpay.js";

import Room from "../models/Room.js";
import Booking from "../models/Booking.js";

import transporter from "../configs/nodemailer.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
    try {

        const {
            room,
            checkInDate,
            checkOutDate,
            guests
        } = req.body;

        const roomData = await Room.findById(room).populate("hotel");

        if (!roomData) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const nights = Math.ceil(
            (checkOut - checkIn) /
            (1000 * 60 * 60 * 24)
        );

        const totalPrice =
            roomData.pricePerNight *
            (nights > 0 ? nights : 1);

        const options = {
            amount: totalPrice * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            amount: totalPrice
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,

            room,
            checkInDate,
            checkOutDate,
            guests

        } = req.body;

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");

        const isAuthentic =
            generatedSignature ===
            razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        const roomData =
            await Room.findById(room)
                .populate("hotel");

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const nights = Math.ceil(
            (checkOut - checkIn) /
            (1000 * 60 * 60 * 24)
        );

        const totalPrice =
            roomData.pricePerNight *
            (nights > 0 ? nights : 1);

        const booking = await Booking.create({

            user: req.user._id,

            room,

            hotel: roomData.hotel._id,

            guests: Number(guests),

            checkInDate,
            checkOutDate,

            totalPrice,

            paymentMethod: "Razorpay",

            isPaid: true,

            paymentStatus: "success",

            paymentId: razorpay_payment_id,

            orderId: razorpay_order_id,

            status: "confirmed"

        });

        // SEND EMAIL

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: req.user.email,
            subject: `Booking Confirmation on BookMyHotel, Hotel Name: ${roomData.hotel.name}`,

            html: `
                <h2>Booking Confirmed</h2>
                <p>Hello ${req.user.username}</p>
                <p>Your payment was successful.</p>
                <p>Thank you for your booking! Here are your details: </p>

                <ul>
                    <li><strong>Booking ID: </strong>${booking._id}</li>
                    <li><strong>Hotel Name: </strong>${roomData.hotel.name}</li>
                    <li><strong>Location: </strong>${roomData.hotel.address}</li>
                    <li><strong>Date: </strong>${booking.checkInDate.toDateString()}</li>
                    <li><strong>Room Price: </strong>₹${roomData.pricePerNight}/night</li>
                    <li><strong>Booking Amount: </strong>₹${booking.totalPrice}</li>
                </ul>
                <p>We look forward to welcoming you!</p>
                <p>If you need to make any changes, feel free to contact us.</p>               
            `
        });

        return res.status(200).json({
            success: true,
            message: "Payment successful"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// PAYMENT FAILED

export const failedPayment = async (req, res) => {

    try {

        const {
            room,
            checkInDate,
            checkOutDate,
            guests,
            failureReason
        } = req.body;

        const roomData =
            await Room.findById(room)
                .populate("hotel");

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const nights = Math.ceil(
            (checkOut - checkIn) /
            (1000 * 60 * 60 * 24)
        );

        const totalPrice =
            roomData.pricePerNight *
            (nights > 0 ? nights : 1);

        await Booking.create({

            user: req.user._id,

            room,

            hotel: roomData.hotel._id,

            guests: Number(guests),

            checkInDate,
            checkOutDate,

            totalPrice,

            paymentMethod: "Razorpay",

            isPaid: false,

            paymentStatus: "failed",

            failureReason,

            status: "cancelled"

        });

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};