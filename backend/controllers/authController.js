import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import crypto from 'crypto'

export const register = async(req, res) =>{
    const {name, email, password} = req.body;

    if (!name || !email || !password){
        return res.json({
            success: false,
            message: "Missing details"
        })
    }

    try{

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({name, email, password: hashedPassword})
        const apiKey = crypto.randomBytes(32).toString('hex');
        user.apiKey = apiKey;

        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', 
            maxAge: 7 * 24 * 60 * 60
        })
        
        //sending welcome email
        const mailOptions= {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "WELCOME",
            text: `Welcome ${name}`
        }


        await transporter.sendMail(mailOptions)

        res.json({
            success: true,
            message: "User signed up"
        })
        


    } catch(error){
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res)=>{
    
    const{email, password} = req.body;

    if(!email || !password){
        return res.json({
            success: false,
            message: "Email & Password are required"
        })
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({
                success: false,
                message: "User doesn't exist"
            })
        }

        const isMatched = await bcrypt.compare(password, user.password)
        
        if(!isMatched){
            return res.json({
                success: false,
                message: "Password doesn't match"
            })
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', 
            maxAge: 7 * 24 * 60 * 60
        })

        // Send user data without sensitive information
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified
        }

        res.json({
            success: true,
            message: "User logged in",
            user: userData
        })
        
    } catch (error) {
        console.error('Login error:', error);
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async(req, res) => {
    
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })

        res.json({
            success: true,
            message: "logged out"
        })

    } catch (error){
        return res.json({
            success: false,
            message: error.message
        })
    }

    
}


export const sendVerifyOtp = async(req, res) => {
    try{
        const {userId} = req.body
        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({
                success: false,
                message: "Account already verified"
            })
        }   

        const otp = String(Math.floor(Math.random() * 900000 + 100000))

        user.verifyOtp = otp;
        user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verification",
            text: `Your OTP is ${otp}`
        }


        await transporter.sendMail(mailOptions)
        await user.save()

        return res.json({
            success: true,
            message: "Verification OTP is sent"
        })


    } catch (error){
        res.json({
            success: false,
            error: error.message
        })
    }
}

export const verifyEmail = async(req, res) => {
    const {userId, otp} = req.body;

    if(!userId || !otp){
        return res.json({
            success: false,
            message: 'Missing Details'
        })
    }

    try {
        
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        if(user.verifyOtp === "" || user.verifyOtp !== otp){
            return res.json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if(user.verifyOtpExpireAt < Date.now){
            return res.json({
                success: false,
                message: "Expired"
            })
        }

        user.isAccountVerified = true;
        user.verifyOtp = ""
        user.verifyOtpExpireAt = 0

        await user.save();

        return res.json({
            success: true,
            message: "Email veirified"
        })


    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

}


export const isAuthenticated = async (req, res)=>{
    try {
        return res.json({success: true})
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.json({
            success: false,
            message: "Empty Email"
        })
    }

    try{
        const user = await userModel.findOne({email})
        
        if(!user){
            return res.json({
                success: false,
                message: "user doesn't exist"
            })
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000))

        user.resetOtp = otp;
        user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "RESET OTP",
            text: `Your reset OTP is ${otp}`
        }

        await transporter.sendMail(mailOptions)
        

        return res.json({
            success: true,
            message: "Reset OTP is sent"
        })



    } catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}


export const changePassword = async(req, res) => {
    const {email, otp, newPassword} = req.body
    console.log(req.body);
    console.log(newPassword);
    if(!email || !otp || !newPassword){
        return res.json({
            success: false,
            message: "email and otp are required"
        })
    }

    try{
        const user = await userModel.findOne({email})
        
        if(!user){
            return res.json({
                success: false,
                message: "user not found"
            })
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if(user.resetOtpExpiredAt < Date.now){
            return res.json({
                success: false,
                message: "Expired"
            })
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.resetOtp = ""
        user.resetOtpExpiredAt = 0

        
        await user.save()

        return res.json({
            success: true,
            message: "password has been reset"
        })



    } catch(error){
        res.json({
            success: false,
            message: error.message
        })
    }
}


export const getApiKey = async (req, res) => {
    try {
        const { userId, password } = req.body;
        const user = await userModel.findById(userId);
        

        if (!user) {            
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        const isMatched = await bcrypt.compare(password, user.password)
        
        if(!isMatched){
            return res.json({
                success: false,
                message: "Password doesn't match"
            })
        }   

        return res.json({
            success: true,  
            apiKey: user.apiKey
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }   

}


export const createNewApiKey = async (req, res) => {
    try {
        const { userId, password } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.json({
                success: false,
                message: "Password doesn't match"
            });
        }

        const newApiKey = crypto.randomBytes(32).toString('hex');
        user.apiKey = newApiKey;
        await user.save();

        return res.json({
            success: true,
            apiKey: newApiKey
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}

