// Function to Check Availability of Room
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js"
import { getAuth } from "@clerk/express";

const checkAvailability=async({checkInDate,checkOutDate,room})=>{
    try {
        const bookings=await Booking.find({
            room,
            checkInDate:{$lte:new Date(checkOutDate)},
            checkOutDate:{$gte:new Date(checkInDate)},
        });

        return bookings.length === 0;

    } catch (error) {
        console.error(error.message);
        throw error; // Let the calling function handle the failure
    }
};


//API to check availability of room
//POST /appi/bookings/check-availability

export const checkAvailabilityAPI=async(req,res)=>{
    try {
        const{room,checkInDate,checkOutDate}=req.body;
        const isAvailable=await checkAvailability({checkInDate,checkOutDate,room});
        res.status(200).json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//API to create a new booking
//POST /api/bookings/book


export const createBooking=async(req,res)=>{
    try {
        const {room,checkInDate,checkOutDate,guests}=req.body;
        const user=req.user._id;
        
        const isAvailable=await checkAvailability({checkInDate,checkOutDate,room});

        if(!isAvailable){
            return res.status(400).json({ success: false, message: "Room is not available for these dates" });
        }

        const roomData=await Room.findById(room).populate("hotel");
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }
        const checkIn=new Date(checkInDate)
        const checkOut=new Date(checkOutDate)
        if (checkIn >= checkOut) {
            return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
        }
        const timeDiff=checkOut.getTime()-checkIn.getTime();
        const nights=Math.ceil(timeDiff/(1000*3600*24));
        const totalNights=nights>0?nights:1;
        const totalPrice=roomData.pricePerNight*totalNights;
        const booking=await Booking.create({
            user,
            room,
            hotel:roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        });
        res.status(201).json({ success: true, message: "Booking created successfully" });
    } catch (error) {
        console.error(error);
        // CRITICAL FIX: Changed success to false and added status 500
        res.status(500).json({ success: false, message: "Failed to create booking" });
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
        const {userId}=getAuth(req);
        const hotel = await Hotel.findOne({ owner: userId });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "No Hotel found for this user" });
        }
        
        const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });

        // Total Bookings
        const totalBookings = bookings.length;
        
        // Total Revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.status(200).json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};