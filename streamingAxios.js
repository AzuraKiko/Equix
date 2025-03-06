const axios = require('axios');
const { updateTokens } = require("./marketData/authen/refreshToken");
const { urlRealtimeASX, urlRealtimeCXA, urlRealtimeAll } = require("./marketData/base/config");
let tokens = {};

const processData = async () => {
  try {

    // Cấu hình request
    const config = {
      method: 'get',
      url: urlRealtimeASX,
      headers: {
        'Authorization': `Bearer ${tokens.tokenASX}`,
      },
      responseType: 'stream' // Đảm bảo response dạng stream
    };

    // Gửi request
    const response = await axios(config);

    // Kiểm tra nếu response là stream
    if (response.data && response.data.on) {
      // Lắng nghe dữ liệu từ stream
      response.data.on('data', (chunk) => {
        console.log(chunk.toString());
      });

      // Xử lý khi kết thúc stream
      response.data.on('end', () => {
        console.log('Kết thúc stream.');
      });

      // Xử lý lỗi trong quá trình nhận dữ liệu
      response.data.on('error', (err) => {
        console.error('Lỗi trong quá trình stream:', err.message);
      });
    } else {
      console.log('Phản hồi không phải dạng stream:', response.data);
    }

  } catch (error) {
    console.error('Lỗi khi gửi request:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi:', error.response.status, error.response.statusText);
      console.error('Nội dung phản hồi:', await streamToString(error.response.data));
    }
  }
};

// Hàm chuyển stream thành chuỗi để debug lỗi
const streamToString = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', (err) => reject(err));
  });
};

// Cập nhật token và chạy processData
(async () => {
  try {
    tokens = await updateTokens();

    if (Object.keys(tokens).length > 0) {
      await processData();
    } else {
      console.error("Không nhận được token hợp lệ.");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật token:", error.message);
  }
})();

