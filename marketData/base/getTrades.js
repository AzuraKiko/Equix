function getTrades(priceASX, priceCXA) {
    const expected = [];

    // Lấy danh sách unique symbol từ 2 sàn
    const symbols = [...new Set([...priceASX.map(item => item.symbol), ...priceCXA.map(item => item.symbol)])];

    symbols.forEach((symbol) => {
        const dataASX = priceASX.find(item => item.symbol === symbol) || {};
        const dataCXA = priceCXA.find(item => item.symbol === symbol) || {};

        // Tổng hợp trades từ 2 sàn và sắp xếp theo time mới nhất trước
        const tradesASX = dataASX.trades
            ? Object.entries(dataASX.trades).map(([tradeId, trade]) => {
                return { ...trade, source: "ASX" };
            })
            : [];

        const tradesCXA = dataCXA.trades
            ? Object.entries(dataCXA.trades).map(([tradeId, trade]) => {
                return { ...trade, source: "CXA" };
            })
            : [];

        const allTrades = [
            ...tradesASX,
            ...tradesCXA
        ];

        // Sắp xếp theo thời gian mới nhất trước, chuẩn hóa time ngay trong lúc so sánh
        allTrades.sort((a, b) => {
            const timeA = a.time < 1e10 ? a.time * 1000 : a.time;
            const timeB = b.time < 1e10 ? b.time * 1000 : b.time;
            return timeB - timeA;
        });


        // Lấy 50 lệnh mới nhất
        const latestTrades = allTrades.slice(0, 50);

        // Chuyển đổi lại về object 
        let trades = latestTrades.reduce((acc, trade, index) => {
            // Loại bỏ field id bằng destructuring
            const { id, ...tradeWithoutId } = trade;
            acc[index] = tradeWithoutId;
            return acc;
        }, {});
        // Đẩy vào mảng expected
        expected.push({
            symbol: symbol,
            trades: trades,
        });

    });

    return expected;
}

module.exports = { getTrades };


// const arr1 = [
//     {
//         "exchange": "ASX",
//         "symbol": "ANZ",
//         "trades": {
//             "791262d0-5f00-42f3-887d-fb0d2ecc8dab": {
//                 "price": 28.79,
//                 "quantity": 7553,
//                 "id": 1740114661370,
//                 "time": 1740114656990
//             },
//             "4615eb45-0d2c-43a9-9618-8561cda679c2": {
//                 "price": 28.79,
//                 "quantity": 980,
//                 "id": 1740114661369,
//                 "time": 1740114656980
//             },
//             "c3e1a9c2-0d2c-43a9-9618-8561cda679c2": {
//                 "price": 28.79,
//                 "quantity": 980,
//                 "id": 1740114661368,
//                 "time": 1740114656970
//             }
//         }
//     }
// ];

// const arr2 = [
//     {
//         "exchange": "CXA",
//         "symbol": "ANZ",
//         "trades": {
//             "791262d0-5f00-42f3-887d-fb0d2ecc8dacc": {
//                 "price": 28.79,
//                 "quantity": 7553,
//                 "id": 1740114661370,
//                 "time": 1740114656990
//             },
//             "4615eb45-0d2c-43a9-9618-8561cda679c11": {
//                 "price": 28.79,
//                 "quantity": 980,
//                 "id": 1740114661369,
//                 "time": 1740114656985
//             },
//             "c3e1a9c2-0d2c-43a9-9618-8561cda6755c2": {
//                 "price": 28.79,
//                 "quantity": 980,
//                 "id": 1740114661368,
//                 "time": 1740114656975
//             }
//         }
//     }
// ];

// console.log(JSON.stringify(getTrades(arr1, arr2), null, 2));
