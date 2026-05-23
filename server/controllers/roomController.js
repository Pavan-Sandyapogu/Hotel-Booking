import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import { getAuth } from "@clerk/express";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        const { userId } = getAuth(req);
        const hotel = await Hotel.findOne({ owner: userId });

        if (!hotel) {
            return res.status(404).json({ success: false, message: "No Hotel found" });
        }

        // Upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        });

        // Wait for all uploads to complete
        const images = await Promise.all(uploadImages);

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images,
        });

        res.status(201).json({ success: true, message: "Room created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: "image" // FIXED: Added quotes around "image"
            }
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/*
// API to get a single room by ID
export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image username'
            }
        });
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};*/

// API to get all rooms for a specific hotel owner
export const getOwnerRooms = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const hotelData = await Hotel.findOne({ owner: userId });

        // Safety check: what if the owner hasn't created a hotel yet?
        if (!hotelData) {
            return res.status(404).json({ success: false, message: "Hotel not found for this user" });
        }

        const rooms = await Room.find({ hotel: hotelData._id }).populate("hotel");

        res.status(200).json({ success: true, rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;

        // FIXED: Added space between await and Room
        const roomData = await Room.findById(roomId);

        // Safety check: Ensure the room actually exists
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();

        res.status(200).json({ success: true, message: "Room Availability Updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};