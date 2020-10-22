require("dotenv").config();
const axios = require("axios");

module.exports = axios.create({
  baseURL: "https://pubchem.ncbi.nlm.nih.gov/rest",
  timeout: 5000,
});
