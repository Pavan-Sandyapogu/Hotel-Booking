import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    //room: { type: String, ref: "Room", required: true },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    //hotel: { type: String, ref: "Hotel", required: true },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentMethod: { type: String, required: true, default: "Pay At Hotel" },
    isPaid: { type: Boolean, default: false },
    paymentStatus: {
    type: String,
    enum: ["success", "failed"]
    },
    paymentId: {type:String},
    orderId: {type:String},
    failureReason:{type:String},

}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;