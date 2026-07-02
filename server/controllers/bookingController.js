// Function to Check Availability of Room
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js"
import { getAuth } from "@clerk/express";
import transporter from "../configs/nodemailer.js";

const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            status: "confirmed",
            checkInDate: { $lte: new Date(checkOutDate) },
            checkOutDate: { $gte: new Date(checkInDate) },
        });

        return bookings.length === 0;

    } catch (error) {
        console.error(error.message);
        throw error; // Let the calling function handle the failure
    }
};


//API to check availability of room
//POST /appi/bookings/check-availability

export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.status(200).json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



//API to get all bookings for a user
//GET /api/bookings/user

export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate("room hotel").sort({ createdAt: -1 });

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};

// API to get all bookings for a hotel owner
export const getHotelBookings = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const hotel = await Hotel.findOne({ owner: userId });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "No Hotel found for this user" });
        }

        const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });

        // Total Bookings
        //const totalBookings = bookings.length;

        // Total Revenue
        //const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
        const successfulBookings = bookings.filter(booking => booking.isPaid && booking.paymentStatus === "success");
        const totalBookings = successfulBookings.length;

        const totalRevenue = successfulBookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.status(200).json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings: successfulBookings } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};