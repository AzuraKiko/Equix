// const { prices } = require("../dataQuote/prices");

// // Hàm lấy trade_price từ file previous_close.json
// const getTradePrice = (symbol) => {
//   const found = prices.find((item) => item.symbol === symbol);
//   return found ? found.trade_price : null;
// };

const { getPrice } = require("../base/getData");
const { updateTokens } = require("../authen/refreshToken.js");
const { urlSnapAll } = require("../base/config");

let tokens = {};
let quoteMap = new Map(); // Đưa quoteMap ra ngoài để dùng ở nhiều chỗ

// Hàm getTradePrice đưa ra ngoài để dùng ở nhiều chỗ
const getTradePrice = (symbol) => {
  return quoteMap.get(symbol) || null;
};

const processTrade = async () => {
  try {
    // Lấy giá của từng sàn
    const response = await getPrice(urlSnapAll, tokens.tokenASX_CXA);
    const quote = response.map(item => item.quote);

    // Cập nhật quoteMap cho toàn cục
    quoteMap = new Map(quote.map(item => [item.symbol, item.trade_price]));
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  try {
    // Cập nhật token bằng Object Destructuring
    tokens = await updateTokens();

    // Kiểm tra nếu đã có token hợp lệ thì gọi các hàm xử lý
    if (Object.keys(tokens).length > 0) {
      await processTrade();
    } else {
      console.error("Không nhận được token hợp lệ.");
    }
  } catch (error) {
    console.error("Error khi cập nhật token:", error.message);
  }
})();


function getDepth(priceASX, priceCXA) {
  const expected = [];

  // Lấy danh sách unique symbol từ 2 sàn
  const symbols = [
    ...new Set([
      ...priceASX.map((item) => item.symbol),
      ...priceCXA.map((item) => item.symbol),
    ]),
  ];

  symbols.forEach((symbol) => {
    const dataASX = priceASX.find((item) => item.symbol === symbol) || {};
    const dataCXA = priceCXA.find((item) => item.symbol === symbol) || {};

    // Tổng hợp depth từ 2 sàn
    const trade_price = getTradePrice(symbol);
    console.log("trade_price", trade_price);
    console.log("------------------------------------------");

    const depthASX = dataASX.depth || { ask: {}, bid: {} };
    const depthCXA = dataCXA.depth || { ask: {}, bid: {} };

    let depth = {
      ask: {},
      bid: {},
      total_ask_size: 0,
      total_bid_size: 0,
    };

    const sides = ["ask", "bid"];

    sides.forEach((side) => {
      const allPrices = {};

      // Gộp dữ liệu từ cả hai sàn
      [depthASX, depthCXA].forEach((sourceData, index) => {
        const source = index === 0 ? "ASX" : "CXA";
        const data = sourceData[side];

        for (const key in data) {
          const { price, quantity, number_of_trades } = data[key];
          const parsedPrice = parseFloat(price);

          // Điều kiện lọc giá
          const isValidPrice =
            (side === "ask" && parsedPrice >= trade_price) ||
            (side === "bid" && parsedPrice <= trade_price);

          if (isValidPrice) {
            if (!allPrices[parsedPrice]) {
              allPrices[parsedPrice] = {
                symbol: symbol,
                // exchanges: exchanges,
                exchanges: "ASX",
                side: side.charAt(0).toUpperCase() + side.slice(1),
                quantity: quantity,
                number_of_trades: number_of_trades || null,
                price: parsedPrice,
                source: source,
              };
            } else {
              // Nếu giá đã tồn tại, cộng dồn quantity và cập nhật source
              allPrices[parsedPrice].quantity += quantity;
              allPrices[parsedPrice].number_of_trades +=
                number_of_trades || null;
              if (allPrices[parsedPrice].source !== source) {
                allPrices[parsedPrice].source = "MIX";
              }
            }
          }
        }
      });

      // Sắp xếp và chọn top 10
      const sortedPrices = Object.values(allPrices).sort((a, b) => {
        return side === "ask" ? a.price - b.price : b.price - a.price;
      });

      sortedPrices.slice(0, 10).forEach((item, index) => {
        depth[side][index] = item;
      });      

      if (side === "ask") {
        depth.total_ask_size = sortedPrices
          .slice(0, 10) // Cắt lấy 10 phần tử đầu tiên
          .reduce((sum, item) => sum + (item.quantity || 0), 0);
      } else if (side === "bid") {
        depth.total_bid_size = sortedPrices
          .slice(0, 10) // Cắt lấy 10 phần tử đầu tiên
          .reduce((sum, item) => sum + (item.quantity || 0), 0);
      }
    });

    expected.push({
      symbol: symbol,
      depth: depth,
    });
  });

  return expected;
}

module.exports = { getDepth };
