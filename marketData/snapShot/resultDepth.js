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
const { getDepth } = require("../base/getDepth");


let tokens = {};

// Khai báo biến bên ngoài để sử dụng trong toàn bộ IIFE
let priceASX_CXA = {};
let expectedDepth = {};
let priceASX = {};
let priceCXA = {};

// Sử dụng async IIFE để đảm bảo tuần tự
const processData = async () => {
  try {
    // Lấy giá của từng sàn
    priceASX = await getPrice(urlSnapASX, tokens.tokenASX);
    const depthASX = priceASX.map((item) => item.depth);
    saveFile(
      JSON.stringify(depthASX, null, 2),
      "../marketData/dataDepth/depthASX.json"
    );


    priceCXA = await getPrice(urlSnapCXA, tokens.tokenCXA);
    const depthCXA = priceCXA.map((item) => item.depth);
    saveFile(
      JSON.stringify(depthCXA, null, 2),
      "../marketData/dataDepth/depthCXA.json"
    );

    const newData = (data) => data.map((item) => ({
      symbol: item.symbol,
      depth: item.depth,
    }));

    // Sort
    const sorted = (data) => Object.values(data).sort((a, b) => {
      return data.side === "Ask" ? a.price - b.price : b.price - a.price;
    });

    const newdepthASX = sorted(newData(priceASX));
    const newdepthCXA = sorted(newData(priceCXA));

    const columnNames1 = {
      fieldName: "Field Name",
      compareValue: "ASX",
      expectedValue: "CXA",
      matchResult: "Match Result",
    }

    compareArrayObjects(newdepthASX, newdepthCXA, ["symbol"], columnNames1);

    priceASX_CXA = await getPrice(urlSnapAll, tokens.tokenASX_CXA);
    const depthASX_CXA = newData(priceASX_CXA);
    saveFile(
      JSON.stringify(depthASX_CXA, null, 2),
      "../marketData/dataDepth/depthASX_CXA.json"
    );

    // Tạo expectedDepth dựa trên ASX và CXA
    expectedDepth = getDepth(priceASX, priceCXA);
    saveFile(
      JSON.stringify(expectedDepth, null, 2),
      "../marketData/dataDepth/expectedDepth.json"
    );

    //So sánh giá trị sau khi đã có giá trị của priceASX_CXA
    if (priceASX_CXA && Object.keys(priceASX_CXA).length > 0) {
      const columnNames2 = {
        fieldName: "Field Name",
        compareValue: "ASX_CXA",
        expectedValue: "Expected Value",
        matchResult: "Match Result",
      }
      compareArrayObjects(depthASX_CXA, expectedDepth, ["symbol"], columnNames2);
    } else {
      console.log("priceASX_CXA is empty or undefined");
    }
  }
  catch (error) {
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

