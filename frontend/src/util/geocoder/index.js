require("dotenv").config();
const axios = require("axios");

module.exports = axios.create({
    baseURL: 'https://maps.googleapis.com/maps/api/geocode',
    timeout: 5000,
    params: {
        key: process.env.REACT_APP_GOOGLE_API_KEY
    }
});
