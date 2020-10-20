require("dotenv").config();
const axios = require("axios");

module.exports = axios.create({
  baseURL: process.env.REACT_APP_GEOCODE_URL,
  timeout: 5000,
  params: {
    key: process.env.REACT_APP_GOOGLE_API_KEY,
  },
});
