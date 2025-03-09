const axios = require("axios");
const { OPENING_URL, equix_id } = require("../base/config");
const { getToken } = require("./createToken");
const { saveFile } = require("../../common/saveFile");
let token;

// Hàm lấy thông tin onboarding theo equix_id và ghi vào file equix.json trong thư mục Individual
const getDetailOnboarding = async () => {
    try {
        const response = await axios.get(
            OPENING_URL, // API endpoint
            {
                params: { equix_id }, // Truyền equix_id bằng query
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data[0] || {}; // Đảm bảo luôn có dữ liệu
        const content = JSON.stringify(data, null, 2);
        const type = "joint";
        saveFile(content, `../onboarding/${type}/equix.json`); 
    } catch (error) {
        console.error("Lỗi lấy dữ liệu onboarding:", error.response?.data || error.message);
    }
};

(async () => {
    token = await getToken();
    await getDetailOnboarding();
})();


