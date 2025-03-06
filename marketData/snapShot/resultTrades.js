const axios = require("axios");
const { updateTokens } = require("../authen/refreshToken");
const {
  urlSnapASX,
  urlSnapCXA,
  urlSnapAll,
} = require("../base/config");
const { saveFile } = require("../../common/saveFile");
const { compareArrayObjects } = require("../../common/PareArray[Ob2]");
const { getPrice } = require("../base/getData");
const { getTrades } = require("../base/getTrades");
let tokens = {};


// Khai báo biến bên ngoài để sử dụng trong toàn bộ IIFE
let priceASX_CXA = {};
let expectedTrades = {};
let priceASX = {};
let priceCXA = {};

// Sử dụng async IIFE để đảm bảo tuần tự
const processData = async () => {
  try {
    // Lấy giá của từng sàn
    priceASX = await getPrice(urlSnapASX, tokens.tokenASX);
    const tradesASX = priceASX.map((item) => item.trades);
    saveFile(
      JSON.stringify(tradesASX, null, 2),
      "../marketData/dataTrades/tradesASX.json"
    );

    priceCXA = await getPrice(urlSnapCXA, tokens.tokenCXA);
    const tradesCXA = priceCXA.map((item) => item.trades);
    saveFile(
      JSON.stringify(tradesCXA, null, 2),
      "../marketData/dataTrades/tradesCXA.json"
    );

    const newData = (data) => {
      return data.map((item) => {
        const newTrades = {};

        // Kiểm tra nếu trades là object
        if (item.trades && typeof item.trades === 'object') {
          // Chuyển đổi từ mảng sang object với key là số thứ tự
          Object.entries(item.trades).forEach(([tradeId, trade], index) => {
            // Tạo object mới không có field id
            const { id, ...tradeWithoutId } = trade;
            newTrades[index] = tradeWithoutId;
          });
        }

        return {
          symbol: item.symbol,
          trades: newTrades, // Gán lại trades đã chuyển đổi
        };
      });
    };
    //Sort
    const sorted = (data) => 
      Object.values(data).sort((a, b) => b.time - a.time 
      );    

    const newtradesASX = sorted(newData(priceASX));
    const newtradesCXA = sorted(newData(priceCXA));

    const columnNames1 = {
      fieldName: "Field Name",
      compareValue: "ASX",
      expectedValue: "CXA",
      matchResult: "Match Result",
    }
    compareArrayObjects(newtradesASX, newtradesCXA, ['symbol'], columnNames1);

    // Lấy giá ASX_CXA và gán cho biến bên ngoài
    priceASX_CXA = await getPrice(urlSnapAll, tokens.tokenASX_CXA);
    const tradesASX_CXA = newData(priceASX_CXA);

    // tradesASX_CXA = tradesASX_CXA.map(trades => {
    //   const newTrades = {};
    //   // Duyệt qua từng cặp key-value và đổi key thành trade.id
    //   Object.entries(trades).forEach(([tradeId, trade]) => {
    //     newTrades[trade.id] = trade;
    //   });
    //   return newTrades;
    // });

    saveFile(
      JSON.stringify(tradesASX_CXA, null, 2),
      "../marketData/dataTrades/tradesASX_CXA.json"
    );

    // Tạo expectedQuote dựa trên ASX và CXA
    expectedTrades = getTrades(priceASX, priceCXA);
    saveFile(
      JSON.stringify(expectedTrades, null, 2),
      "../marketData/dataTrades/expectedTrades.json"
    );

    //So sánh giá trị sau khi đã có giá trị của priceASX_CXA
    if (priceASX_CXA && Object.keys(priceASX_CXA).length > 0) {
      const columnNames2 = {
        fieldName: "Field Name",
        compareValue: "ASX_CXA",
        expectedValue: "Expected Value",
        matchResult: "Match Result",
      }
      compareArrayObjects(tradesASX_CXA, expectedTrades, ["symbol"], columnNames2);
    } else {
      console.log("priceASX_CXA is empty or undefined");
    }
  } catch (error) {
    console.error("Failed :", error.message);
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

