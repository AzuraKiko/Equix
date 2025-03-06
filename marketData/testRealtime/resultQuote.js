const { updateTokens } = require("../authen/refreshToken");
const { urlRealtimeASX, urlRealtimeCXA, urlRealtimeAll } = require("../base/config");
const { saveFile } = require("../../common/saveFile");
const { compareArrayObjects } = require("../../common/PareArray[Ob1]");
const { getQuote } = require("../base/getQuote");
const { streamLatestResponse } = require("../base/streaming");

let tokens = {};
let latestData = {
  ASX: { quote: null, depth: null },
  CXA: { quote: null, depth: null },
  ASX_CXA: { quote: null, depth: null }
};

// Hàm chuyển đổi Object thành mảng các Object key-value
const objectToArray = (obj) => {
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).map(([key, value]) => {
      return { [key]: value };
    });
  }
  return []; // Trả về mảng rỗng nếu obj là null hoặc không phải object
};


// Hàm lưu dữ liệu vào file
const saveDataToFile = (data, type, exchange) => {
  if (data) {
    const path = `../marketData/realtime${type}/${type.toLowerCase()}${exchange}.json`;
    saveFile(JSON.stringify(data, null, 2), path);
  }
};

// Hàm kiểm tra và lưu dữ liệu liên tục
const checkAndSaveData = (stream, exchange) => {
  return setInterval(() => {
    try {
      latestData[exchange].quote = stream.getLatestQuoteOrDepth('quote');
      latestData[exchange].depth = stream.getLatestQuoteOrDepth('depth');

      if (latestData[exchange].quote) {
        latestData[exchange].quote = objectToArray(latestData[exchange].quote);
      }
      if (latestData[exchange].depth) {
        latestData[exchange].depth = objectToArray(latestData[exchange].depth);
      }
      console.error("ping", stream);
      saveDataToFile(latestData[exchange].quote, 'Quote', exchange);
      saveDataToFile(latestData[exchange].depth, 'Depth', exchange);
    } catch (error) {
      console.error(`Lỗi khi xử lý dữ liệu cho ${exchange}:`, error.message);
      // Tiếp tục streaming mà không dừng chương trình
    }
  }, 1000);
};


// Hàm xử lý streaming cho từng loại exchange
const processStreaming = async (url, token, exchange) => {
  const stream = await streamLatestResponse(url, token);
  checkAndSaveData(stream, exchange);
};

// Hàm xử lý tất cả dữ liệu
const processData = async () => {
  try {
    await Promise.all([
      processStreaming(urlRealtimeASX, tokens.tokenASX, 'ASX'),
      processStreaming(urlRealtimeCXA, tokens.tokenCXA, 'CXA'),
      processStreaming(urlRealtimeAll, tokens.tokenASX_CXA, 'ASX_CXA')
    ]);

    // Lấy giá trị expectedQuote
    if (latestData.ASX.quote || latestData.CXA.quote) {
      const expectedQuote = getQuote(latestData.ASX.quote, latestData.CXA.quote);
      saveFile(JSON.stringify(expectedQuote, null, 2), "../marketData/realtimeQuote/expectedQuote.json");

      // So sánh giá trị sau khi đã có giá trị của priceASX_CXA
      if (latestData.ASX_CXA.quote && Object.keys(latestData.ASX_CXA.quote).length > 0) {
        compareArrayObjects(latestData.ASX_CXA.quote, expectedQuote, ['symbol']);
      } else {
        console.log("latestQuoteASX_CXA is empty or undefined");
      }
    } else {
      console.log("latestQuoteASX or latestQuoteCXA is empty or undefined");
    }

  } catch (error) {
    console.error('Lỗi khi xử lý dữ liệu:', error.message);
  }
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
