import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// FIXED TYPO: renamed reqisterHotel to registerHotel
export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        const owner = req.user._id;

        // Basic validation: ensure all fields are provided
        if (!name || !address || !contact || !city) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields (name, address, contact, city) are required" 
            });
        }

        // Checks if the user already has a hotel registered
        const existingHotel = await Hotel.findOne({ owner });
        if (existingHotel) {
            // Added 400 Bad Request
            return res.status(400).json({ 
                success: false, 
                message: "Hotel already registered to this account" 
            });
        }

        // Create the hotel
        await Hotel.create({ name, address, contact, city, owner });
        
        // Upgrade the user's role
        await User.findByIdAndUpdate(owner, { role: "hotelOwner" });
        
        // Added 201 Created
        res.status(201).json({ 
            success: true, 
            message: "Hotel Registered Successfully" 
        });

    } catch (error) {
        // CRITICAL FIX: Changed success to false and added 500 status
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};