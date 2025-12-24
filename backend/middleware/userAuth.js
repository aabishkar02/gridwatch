import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";


export const userAuth = async (req, res, next) => {
    const {token} = req.cookies;
    if(!token){
        return res.json({
            success: false,
            messgae: "Not authorized, Login Again"
        })
    }


    try {
        
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if(tokenDecode.id){
            req.body.userId = tokenDecode.id;
        } else {
            return res.json({
                success: false,
                message: "Not Authorized. Login Again"
            })
        }

        next();

    } catch (error) {
        res.json({
            success: false, 
            message: error.message
        })
    }
}

export const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API key missing"
        });
    }

    const users = await userModel.find({}, "_id apiKey");

    for (const user of users) {
        const isValid = apiKey === user.apiKey;
        console.log("Comparing API Key:", apiKey, "with hashed key:", user.apiKey, "Result:", isValid);
        if (isValid) {
            req.userId = user._id;   
            return next();
        }
    }

    return res.status(401).json({ message: "Invalid API key" });

};