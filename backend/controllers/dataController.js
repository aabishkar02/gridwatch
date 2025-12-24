import demandModel from "../models/demandModel.js"; 

export const getData = async (req, res) => {
  try {
    
    const { region, timeframe } = req.query;
// notye for the frontend, pass the parametrs in the query string

    
      
    console.log("Received parameters - Region:", region, "Timeframe:", timeframe);
    // Validate
    if (!region || !timeframe) {
      return res.status(400).json({
        success: false,
        message: "region and timeframe are required"
      });
    }

    // logic for Fetching  data goes here broski, havent fixed the logic yet
    // For now, just return a sample response
    // const data = await demandModel.find({
    //   userId: req.userId,
    //   region,
    //   timeframe
    // });

    return res.json({
      success: true,
      data: "Sample data for region: " + region + " and timeframe: " + timeframe
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
