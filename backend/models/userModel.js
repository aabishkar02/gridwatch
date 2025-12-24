import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verifyOtp: {type: String, default: ''},
    verifyOtpExpiredAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, default: ''},
    resetOtpExpiredAt: {type: Number, default: 0},
    apiKey: {type: String, default: ''},
})


const userModel = mongoose.models.user || mongoose.model('user', userSchema)
//creating database table if found not create but if not then create one

export default userModel;