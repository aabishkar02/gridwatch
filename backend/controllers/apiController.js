import Demand from "../models/demandModel.js";

export const data = async (req, res) => {
  try {
    const { region, start, end, limit = 1000 } = req.query;
    
    //limit set to 1000 to avoid overloading the server

    //validation firts
    if (!region || !start || !end) {
      return res.status(400).json({
        success: false,
        message: "region, start, and end are required"
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);


    //the quering
    const data = await Demand.find({
      region,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .sort({ timestamp: 1 })   // chronological
      .limit(Number(limit));


      // response afterwards
    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
