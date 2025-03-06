const axios = require("axios");
const { updateTokens } = require("../authen/refreshToken.js");
const { urlSnapASX, urlDelayASX, urlSnapCXA, urlDelayCXA, urlSnapAll, urlDelayAll } = require("../base/config.js");
const { saveFile } = require("../../common/saveFile.js");
const { compareArrayObjects } = require("../../common/PareArray[Ob1]Pro.js");
const { getPrice } = require("../base/getData.js");
const { getQuote } = require("../base/getQuote.js");
let tokens = {};



// Khai báo biến bên ngoài để sử dụng trong toàn bộ IIFE
let priceASX_CXA = {};
let expectedQuote = {};
let priceASX = {};
let priceCXA = {};

// Sử dụng async IIFE để đảm bảo tuần tự
const processData = async () => {
  try {
    // Lấy giá của từng sàn
    priceASX = await getPrice(urlDelayASX, tokens.tokenASX_Delay);
    const quoteASX = priceASX.map(item => item.quote);
    saveFile(JSON.stringify(quoteASX, null, 2), "../marketData/delayShot/quoteASX.json");

    priceCXA = await getPrice(urlDelayCXA, tokens.tokenCXA_Delay);
    const quoteCXA = priceCXA.map(item => item.quote);
    saveFile(JSON.stringify(quoteCXA, null, 2), "../marketData/delayShot/quoteCXA.json");

    // Lấy giá ASX_CXA và gán cho biến bên ngoài
    priceASX_CXA = await getPrice(urlDelayAll, tokens.tokenASX_CXA_Delay);
    const quoteASX_CXA = priceASX_CXA.map(item => item.quote);
    saveFile(JSON.stringify(quoteASX_CXA, null, 2), "../marketData/delayShot/quoteASX_CXA.json");

    // Tạo expectedQuote dựa trên ASX và CXA
    expectedQuote = getQuote(priceASX, priceCXA);

    // Hàm cập nhật giá và lưu vào 1 file
    const updatePrices = (expectedQuote) => {
      // Khởi tạo mảng lưu dữ liệu
      let previousPrices = [];
      try {
        previousPrices = require("../marketData/delayShot/prices.js").prices;
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
        saveFile(content, "../marketData/delayShot/prices.js");
      } else {
        console.log("Không có dữ liệu để lưu");
      }
    };

    // Gọi hàm cập nhật giá
    updatePrices(expectedQuote);


    // Lưu lại expectedQuote sau khi đã ghi đè open 
    saveFile(JSON.stringify(expectedQuote, null, 2), "../marketData/delayShot/expectedQuote.json");

    let columnNames = {
      fieldName: "Field Name",
      compareValue: "ASX_CXA",
      expectedValue: "Expected Value",
      matchResult: "Match Result",
      extraColumns: ["ASX", "CXA"],
    };

    // So sánh giá trị sau khi đã có giá trị của priceASX_CXA
    if (priceASX_CXA && Object.keys(priceASX_CXA).length > 0) {
      // compareArrayObjects(quoteASX_CXA, expectedQuote, ['symbol']);
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

