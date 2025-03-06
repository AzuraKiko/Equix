function getExpected(priceASX, priceCXA) {
    const expected = [];

    // Lấy danh sách unique symbol từ 2 sàn
    const symbols = [...new Set([...priceASX.map(item => item.symbol), ...priceCXA.map(item => item.symbol)])];

    symbols.forEach((symbol) => {
        const dataASX = priceASX.find(item => item.symbol === symbol) || {};
        const dataCXA = priceCXA.find(item => item.symbol === symbol) || {};

        // Tổng hợp trades từ 2 sàn và sắp xếp theo time mới nhất trước
        const tradesASX = dataASX.trades
        ? Object.entries(dataASX.trades).map(([tradeId, trade]) => {
          return [tradeId, { ...trade, source: "ASX" }];
        })
        : [];
  
      const tradesCXA = dataCXA.trades
        ? Object.entries(dataCXA.trades).map(([tradeId, trade]) => {
          return [tradeId, { ...trade, source: "CXA" }];
        })
        : [];

        const allTrades = [
            ...tradesASX,
            ...tradesCXA
        ];

        // Sắp xếp theo thời gian mới nhất trước
        allTrades.sort((a, b) => b[1].time - a[1].time);

        // Lấy 50 lệnh mới nhất
        const latestTrades = allTrades.slice(0, 50);

        // Chuyển đổi lại về object với key là trade id gốc
        const trades = latestTrades.reduce((acc, [tradeId, trade]) => {
            acc[tradeId] = trade;
            return acc;
        }, {});

        expected.push({
            symbol: symbol,
            trades: trades
        });
    });

    return expected;
}

const arr1 = [
    {
        "exchange": "ASX",
        "symbol": "ANZ",
        "trades": {
            "791262d0-5f00-42f3-887d-fb0d2ecc8dab": {
                "price": 28.79,
                "quantity": 7553,
                "id": 1740114661370,
                "time": 1740114656990
            },
            "4615eb45-0d2c-43a9-9618-8561cda679c2": {
                "price": 28.79,
                "quantity": 980,
                "id": 1740114661369,
                "time": 1740114656980
            },
            "c3e1a9c2-0d2c-43a9-9618-8561cda679c2": {
                "price": 28.79,
                "quantity": 980,
                "id": 1740114661368,
                "time": 1740114656970
            }
        }
    }
];

const arr2 = [
    {
        "exchange": "CXA",
        "symbol": "ANZ",
        "trades": {
            "791262d0-5f00-42f3-887d-fb0d2ecc8dacc": {
                "price": 28.79,
                "quantity": 7553,
                "id": 1740114661370,
                "time": 1740114656990
            },
            "4615eb45-0d2c-43a9-9618-8561cda679c11": {
                "price": 28.79,
                "quantity": 980,
                "id": 1740114661369,
                "time": 1740114656985
            },
            "c3e1a9c2-0d2c-43a9-9618-8561cda6755c2": {
                "price": 28.79,
                "quantity": 980,
                "id": 1740114661368,
                "time": 1740114656975
            }
        }
    }
];

console.log(JSON.stringify(getExpected(arr1, arr2), null, 2));
