const axios = require("axios");
const { updateTokens } = require("../authen/refreshToken");
const { urlSnapASX, urlDelayASX, urlSnapCXA, urlDelayCXA, urlSnapAll, urlDelayAll } = require("../base/config");
const { saveFile } = require("../../common/saveFile");
const { compareArrayObjects } = require("../../common/PareArray[Ob1]Pro.js");
const { getPrice } = require("../base/getData");
const { getQuote } = require("../base/getQuote");
const { getDepth } = require("../base/getDepth");
let tokens = {};

// // Hàm delay sử dụng Promise
// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// };

// Khai báo biến bên ngoài để sử dụng trong toàn bộ IIFE
let priceASX_CXA = {};
let expectedQuote = {};
let expectedDepth = {};
let priceASX = {};
let priceCXA = {};

// Sử dụng async IIFE để đảm bảo tuần tự
const processData = async () => {
  try {
    // Lấy giá của từng sàn
    priceASX = await getPrice(urlSnapASX, tokens.tokenASX);
    const quoteASX = priceASX.map(item => item.quote);
    saveFile(JSON.stringify(quoteASX, null, 2), "../marketData/dataQuote/quoteASX.json");

    // // Đợi 6 giây trước khi gọi getPrice cho CXA
    // await delay(6000);
    priceCXA = await getPrice(urlSnapCXA, tokens.tokenCXA);
    const quoteCXA = priceCXA.map(item => item.quote);
    saveFile(JSON.stringify(quoteCXA, null, 2), "../marketData/dataQuote/quoteCXA.json");

    // Lấy giá ASX_CXA và gán cho biến bên ngoài
    priceASX_CXA = await getPrice(urlSnapAll, tokens.tokenASX_CXA);
    const quoteASX_CXA = priceASX_CXA.map(item => item.quote);
    saveFile(JSON.stringify(quoteASX_CXA, null, 2), "../marketData/dataQuote/quoteASX_CXA.json");

    // Tạo expectedQuote dựa trên ASX và CXA
    expectedQuote = getQuote(priceASX, priceCXA);

    // Hàm cập nhật giá và lưu vào 1 file
    const updatePrices = (expectedQuote) => {
      // Khởi tạo mảng lưu dữ liệu
      let previousPrices = [];
      try {
        previousPrices = require("../marketData/dataQuote/prices.js").prices;
      } catch (error) {
        console.log("Không tìm thấy file prices.js, sẽ tạo mới.");
      }

      // Duyệt từng item trong expectedQuote
      expectedQuote.forEach(item => {
        const previousItem = previousPrices.find(prev => prev.symbol === item.symbol);

        // Ghi đè trực tiếp vào expectedQuote.open
        item.open = previousItem && previousItem.open !== undefined && previousItem.open !== null
          ? previousItem.open
          : item.open;

        // Ghi đè trực tiếp vào expectedQuote.previous_close
        if (item.close === null) {
          item.previous_close = previousItem && previousItem.previous_close !== undefined && previousItem.previous_close !== null
            ? previousItem.previous_close
            : item.previous_close;
        }
      });

      // Tạo mảng lưu dữ liệu
      const pricesArray = expectedQuote.map(item => ({
        symbol: item.symbol,
        exchange: item.exchange || null,
        open: item.open,
        trade_price: item.trade_price || null,
        previous_close: item.previous_close || null
      }));

      // Kiểm tra và lưu vào prices.js
      if (pricesArray.length > 0) {
        const content = `const prices = ${JSON.stringify(pricesArray, null, 2)};\nmodule.exports = { prices };`;
        saveFile(content, "../marketData/dataQuote/prices.js");
      } else {
        console.log("Không có dữ liệu để lưu");
      }
    };

    // Gọi hàm cập nhật giá
    updatePrices(expectedQuote);

    // Ghi đè ask_price, ask_size, bid_price, bid_size
    expectedDepth = getDepth(priceASX, priceCXA);
    const depthExpected = expectedDepth.map(item => item.depth);

    expectedQuote.forEach((item, index) => {
      const depth = depthExpected[index];
      if (depth?.ask) {
        // Lấy phần tử đầu tiên
        const firstAsk = depth.ask[0];
        if (firstAsk) {
          item.ask_price = firstAsk.price;
          item.ask_size = firstAsk.quantity;
        }
      } else if (depth?.bid) {
        // Lấy phần tử đầu tiên
        const firstBid = depth.bid[0];
        if (firstBid) {
          item.bid_price = firstBid.price;
          item.bid_size = firstBid.quantity;
        }
      }
    });

    // Lưu lại expectedQuote sau khi đã ghi đè open 
    saveFile(JSON.stringify(expectedQuote, null, 2), "../marketData/dataQuote/expectedQuote.json");

    let columnNames = {
      fieldName: "Field Name",
      compareValue: "ASX_CXA",
      expectedValue: "Expected Value",
      matchResult: "Match Result",
      extraColumns: ["ASX", "CXA"],
    };

    // So sánh giá trị sau khi đã có giá trị của priceASX_CXA
    if (priceASX_CXA && Object.keys(priceASX_CXA).length > 0) {
      compareArrayObjects(quoteASX_CXA, expectedQuote, ["symbol"], [quoteASX, quoteCXA], columnNames)
    } else {
      console.log("priceASX_CXA is empty or undefined");
    }

  } catch (error) {
    console.error("Failed:", error.message);
  }

};

// Update token
(async () => {
  try {
    // Cập nhật token bằng Object Destructuring

    tokens = await updateTokens();

    // Kiểm tra nếu đã có token hợp lệ thì gọi các hàm xử lý
    if (Object.keys(tokens).length > 0) {
      await processData();
    } else {
      console.error("Không nhận được token hợp lệ.");
    }
  } catch (error) {
    console.error("Error khi cập nhật token:", error.message);
  }
})();

