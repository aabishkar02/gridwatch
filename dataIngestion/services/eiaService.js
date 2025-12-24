import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); 


const BASE_URL = "https://api.eia.gov/v2/electricity/rto/region-data/data/";


export const fetchEIAHourlyDemand = async ({
  apiKey,
  region,
  start,
  end
}) => {
  const params = {
    api_key: apiKey,
    frequency: "hourly",
    "facets[respondent][]": region,
    "facets[type][]": "D",   // Demand
    "data[0]": "value",
    start,
    end
  };

  const response = await axios.get(BASE_URL, { params });

  return response.data;
};
