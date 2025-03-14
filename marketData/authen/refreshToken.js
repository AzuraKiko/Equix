const axios = require("axios");
const {
  urlRefresh,
  refreshToken_ASX,
  refreshToken_CXA,
  refreshToken_ASX_CXA,
  deviceID,
  refreshToken_ASX_CXA_Delay,
  refreshToken_ASX_Delay,
  refreshToken_CXA_Delay,
} = require("../base/config");

const getToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      urlRefresh,
      {
        data: {
          refreshToken,
          stay_sign_in: true,
          deviceID,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    return response.data.accessToken;
  } catch (error) {
    console.error("Error get token:", error.response?.data || error.message);
    throw error;
  }
};

const updateTokens = async () => {
  try {
    let tokens = {};
    tokens.tokenASX = await getToken(refreshToken_ASX);
    tokens.tokenCXA = await getToken(refreshToken_CXA);
    tokens.tokenASX_CXA = await getToken(refreshToken_ASX_CXA);
    // tokens.tokenASX_Delay = await getToken(refreshToken_ASX_Delay);
    // tokens.tokenCXA_Delay = await getToken(refreshToken_CXA_Delay);
    // tokens.tokenASX_CXA_Delay = await getToken(refreshToken_ASX_CXA_Delay);
    return tokens;
  } catch (error) {
    console.error("Failed to update tokens:", error.message);
  }
};

module.exports = { getToken, updateTokens };
