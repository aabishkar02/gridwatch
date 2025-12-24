import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.body.userId; // Get userId from req.body instead of req.user.id

        if (!userId) {
            return res.json({
                success: false,
                message: "User ID not found"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Send all relevant user data except sensitive information
        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                apiKey: user.apiKey
            }
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        res.json({
            success: false,
            message: error.message
        });
    }   
} 


