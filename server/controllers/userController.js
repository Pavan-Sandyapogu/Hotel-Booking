

//GET /api/user/


export const getUserData=async(req,res)=>{
    try {
        const role=req.user.role;
        const recentSearchedCities=req.user.recentSearchedCities;
        res.json({success:true,role,recentSearchedCities})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// Store User Recent Searched Cities

export const storeRecentSearchedCities = async(req,res)=>{
    try {
        const {recentSearchedCity}=req.body;
        const user=await req.user;
        if(user.recentSearchedCities.length<3){
            user.recentSearchedCities.push(recentSearchedCity)
        }
        else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity)
        }

        await user.save();
        res.json({success:true , message:"City added"})
    } catch (error) {
        res.json({success:false , message:error.message})
    }
}


/*
import User from "../models/User.js";

// GET /api/user/
export const getUserData = async (req, res) => {
    try {
        // Assuming Clerk auth provides the userId
        const userId = req.auth.userId; 
        
        // Fetch the Mongoose document
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ 
            success: true, 
            role: user.role, 
            recentSearchedCities: user.recentSearchedCities 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Store User Recent Searched Cities
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const userId = req.auth.userId;

        if (!recentSearchedCity) {
             return res.status(400).json({ success: false, message: "City is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 1. Remove the city if it's already in the array (prevents duplicates)
        user.recentSearchedCities = user.recentSearchedCities.filter(
            (city) => city.toLowerCase() !== recentSearchedCity.toLowerCase()
        );

        // 2. Add the new search to the end of the array
        user.recentSearchedCities.push(recentSearchedCity);

        // 3. If array exceeds 3 items, remove the oldest (the first item)
        if (user.recentSearchedCities.length > 3) {
            user.recentSearchedCities.shift();
        }

        // 4. Save the Mongoose document
        await user.save();

        res.status(200).json({ success: true, message: "City added to recent searches" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
    */