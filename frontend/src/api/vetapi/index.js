/* Main HTTP request controller for our application's API */
require("dotenv").config();
const axios = require("axios");

module.exports = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Authorization: process.env.REACT_APP_API_KEY,
  },
  timeout: 20000,
});
