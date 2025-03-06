const axios = require("axios");
const { PORTAL_URL, refreshToken } = require("../base/config");

const getToken = async () => {
  try {
    const response = await axios.post(PORTAL_URL, { data: { refreshToken } }, {
      headers: { accept: "application/json" }
    });
    return response.data.accessToken;
  } catch (error) {
    console.error("Error get token:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getToken };
