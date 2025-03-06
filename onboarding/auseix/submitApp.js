const axios = require("axios");
const { APPLICANT_URL, X_Request_ID } = require("../config/config");
const { typeSelect } = require("../config/config");
const { readJSONfile } = require("../../common/readJSONfile");
const { getToken } = require("./createToken");

let token;
let requestBody = readJSONfile(`../onboarding/${typeSelect}/auseix.json`);

const createApplicant = async () => {
    try {
        const response = await axios.post(
            APPLICANT_URL,
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-Request-ID": X_Request_ID
                }
            }
        );
        const data = response.data || {};
        console.log("Tạo thành công:", data);
    } catch (error) {
        console.error("Lỗi khi gửi request tạo applicant:", error.response?.data || error.message);
    }
};


(async () => {
    token = await getToken();
    await createApplicant();
})();
