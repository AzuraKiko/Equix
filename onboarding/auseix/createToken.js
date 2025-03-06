const axios = require("axios");
const { LOGIN_URL, grant_type, client_id, client_secret } = require("../config/config");
const getToken = async () => {
    try {
        const response = await axios.post(LOGIN_URL,
            {
                grant_type,
                client_id,
                client_secret
            },
            {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error get token:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { getToken };

