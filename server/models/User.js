import mongoose from "mongoose";

const userSchema= mongoose.Schema({
    _id:{type: String, required:true},
    username:{type: String, required:true, default: "Guest"},
    email:{type: String, required:true},
    image:{type: String, default: ""},
    role:{type: String, enum:["user","hotelOwner"],default:"user"},
    recentSearchedCities:[{type: String}],

},{timestamps:true});

const User=mongoose.model("User",userSchema);

export default User;