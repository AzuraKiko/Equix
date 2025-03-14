// Hàm chuẩn hóa thời gian
const normalizeTime = (time) => {
    // Nếu time < 1e10 (thời gian tính bằng giây), nhân với 1000 để đổi sang milliseconds
    return time < 1e10 ? time * 1000 : time;
};

// Hàm lấy giá trị mặc định nếu undefined hoặc null
const getValueOrDefault = (value, defaultValue = null) =>
    (value !== undefined && value !== null) ? Number(value) : defaultValue;

// // Hàm làm tròn 6 chữ số sau dấu thập phân
const roundToSix = (value) =>
    (value !== null && !isNaN(value))
        ? (Math.round(value * 1000000) / 1000000).toFixed(6)
        : value;

// // Hàm làm tròn 2 chữ số sau dấu thập phân
const roundToTwo = (value) =>
    (value !== null && !isNaN(value))
        ? (Math.round(value * 100) / 100).toFixed(2)
        : value;

const roundToThree = (value) =>
    (value !== null && !isNaN(value))
        ? (Math.round(value * 1000) / 1000).toFixed(3)
        : value;

// Hàm lấy giá trị nhỏ nhất hoặc lớn nhất giữa 2 giá trị (min hoặc max)
const getMinOrMax = (val1, val2, type) => {
    if (val1 === null) return val2;
    if (val2 === null) return val1;
    return type === 'min' ? Math.min(val1, val2) : Math.max(val1, val2);
};

// Hàm tổng hợp size nếu giá bằng nhau
const getTotalSize = (price1, size1, price2, size2, compareType) => {
    if (price1 === getMinOrMax(price1, price2, compareType) && price2 === price1) {
        return size1 + size2;
    }
    if (price1 === getMinOrMax(price1, price2, compareType)) {
        return size1;
    }
    if (price2 === getMinOrMax(price1, price2, compareType)) {
        return size2;
    }
    return 0;
};

function getQuote(priceASX, priceCXA) {
    const expected = [];

    // Lấy danh sách unique symbol từ 2 sàn
    const symbols = [...new Set([...priceASX.map(item => item.symbol), ...priceCXA.map(item => item.symbol)])];


    symbols.forEach((symbol) => {
        const dataASX = priceASX.find(item => item.symbol === symbol) || {};
        const dataCXA = priceCXA.find(item => item.symbol === symbol) || {};

        const quoteASX = dataASX.quote || {};
        const quoteCXA = dataCXA.quote || {};

        const getData = (field) => ({
            ASX: getValueOrDefault(quoteASX[field]),
            CXA: getValueOrDefault(quoteCXA[field])
        });

        // Lấy dữ liệu từ 2 sàn
        const askPrice = getData('ask_price');
        const askSize = getData('ask_size');
        const bidPrice = getData('bid_price');
        const bidSize = getData('bid_size');
        const close = getData('close');
        const open = getData('open');
        const high = getData('high');
        const low = getData('low');
        const volume = getData('volume');
        const tradePrice = getData('trade_price');
        const tradeSize = getData('trade_size');
        const valueTraded = getData('value_traded');
        const indicativePrice = getData('indicative_price');
        const auctionVolume = getData('auction_volume');
        const surplusVolume = getData('surplus_volume');
        const numberOfTrades = getData('number_of_trades');
        const previousClose = getData('previous_close');
        const updated = normalizeTime(getData('updated'));

        const quote = {
            // exchange: dataASX.exchange || dataCXA.exchange,
            exchange: 'ASX',
            symbol: symbol,
            // ask_price: lấy giá nhỏ nhất từ ask_price của 2 sàn
            ask_price: getMinOrMax(askPrice.ASX, askPrice.CXA, 'min'),

            // ask_size: tổng ask_size của 2 sàn ở cùng mức giá
            ask_size: getTotalSize(askPrice.ASX, askSize.ASX, askPrice.CXA, askSize.CXA, 'min'),

            // bid_price: lấy giá lớn nhất từ bid_price của 2 sàn
            bid_price: getMinOrMax(bidPrice.ASX, bidPrice.CXA, 'max'),

            // bid_size: tổng bid_size của 2 sàn ở cùng mức giá
            bid_size: getTotalSize(bidPrice.ASX, bidSize.ASX, bidPrice.CXA, bidSize.CXA, 'max'),

            // close: giá đóng cửa mới nhất từ 2 sàn
            close: close.ASX ?? close.CXA ?? (updated.ASX > updated.CXA ? close.ASX : close.CXA),

            // high: giá cao nhất từ 2 sàn
            high: high.ASX ?? high.CXA ?? getMinOrMax(high.ASX, high.CXA, 'max'),

            // low: giá thấp nhất từ 2 sàn 
            low: low.ASX ?? low.CXA ?? getMinOrMax(low.ASX, low.CXA, 'min'),

            // open: giá mở cửa sớm nhất từ 2 sàn
            open: open.ASX ?? open.CXA ?? (updated.ASX < updated.CXA ? open.ASX : open.CXA),

            // previous_close: giá đóng cửa trên ngày trước
            previous_close: previousClose.ASX ?? previousClose.CXA ?? (updated.ASX < updated.CXA ? previousClose.ASX : previousClose.CXA),
            // previous_close: 29.55,

            // trade_price: giá giao dịch mới nhất từ 2 sàn
            trade_price: updated.ASX > updated.CXA ? tradePrice.ASX : tradePrice.CXA,

            // trade_size: kích thước giao dịch tương ứng với trade_price mới nhất
            trade_size: updated.ASX > updated.CXA ? tradeSize.ASX : tradeSize.CXA,

            // updated: thời gian giao dịch mới nhất
            updated: Math.max(updated.ASX, updated.CXA),

            // volume: tổng volume của 2 sàn
            volume: (volume.ASX || 0) + (volume.CXA || 0),

            // value_traded: tổng giá trị giao dịch của 2 sàn
            value_traded: Number(roundToTwo((valueTraded.ASX || 0) + (valueTraded.CXA || 0))),

            // indicative_price: giá indicative mới nhất từ 2 sàn
            indicative_price: indicativePrice.ASX === null ? indicativePrice.CXA : indicativePrice.CXA === null ? indicativePrice.ASX : updated.ASX > updated.CXA ? indicativePrice.ASX : indicativePrice.CXA,

            // auction_volume: auction_volume mới nhất từ 2 sàn
            auction_volume: auctionVolume.ASX === null ? auctionVolume.CXA : auctionVolume.CXA === null ? auctionVolume.ASX : updated.ASX > updated.CXA ? auctionVolume.ASX : auctionVolume.CXA,

            // surplus_volume: surplus_volume mới nhất từ 2 sàn
            surplus_volume: surplusVolume.ASX === null ? surplusVolume.CXA : surplusVolume.CXA === null ? surplusVolume.ASX : updated.ASX > updated.CXA ? surplusVolume.ASX : surplusVolume.CXA,

            // side: lấy side của sàn có indicative_price mới nhất  
            side: quoteASX.side === null ? quoteCXA.side : quoteCXA.side === null ? quoteASX.side : updated.ASX > updated.CXA ? quoteASX.side : quoteCXA.side,


            // Các field không có giá trị hoặc mặc định là null
            open_interest: null,
            implied_volatility: null,
            break_even: null,
            break_even_percent: null,
            in_the_money: null,
            delta: null,
            vega: null,
            theta: null,
            gamma: null,
            rho: null,
            ['5d_change_percent']: null,
            price_lower_1: null,
            price_lower_2: null,
            price_higher_1: null,
            price_higher_2: null,
            long_lower_1: null,
            long_lower_2: null,
            long_higher_1: null,
            long_higher_2: null,
            short_lower_1: null,
            short_lower_2: null,
            short_higher_1: null,
            short_higher_2: null,
            // number_of_trades: tổng number_of_trades của 2 sàn
            number_of_trades: (numberOfTrades.ASX || 0) + (numberOfTrades.CXA || 0),
            market_cap: null,
            theo_price: null,
            iv_change: null,
            is_closed_price_updated: quoteASX?.is_closed_price_updated ?? quoteCXA?.is_closed_price_updated ?? null,
            // is_closed_updated: quoteASX?.is_closed_updated ?? quoteCXA?.is_closed_updated ?? null,
            pnl_price_type: quoteASX?.pnl_price_type ?? quoteCXA?.pnl_price_type ?? null,
        };

        // Tính toán change_point và change_percent sau khi khởi tạo quote
        quote.change_point = Number(roundToThree(quote.trade_price - quote.previous_close));
        quote.change_percent = (quote.previous_close > 0) ? Number(roundToSix((quote.change_point / quote.previous_close) * 100)) : 0;

        // vwap: tính trung bình gia quyền của 2 sàn
        quote.vwap = quote.volume === 0 ? null : quote.value_traded === null ? null : Number(roundToSix(quote.value_traded / quote.volume)),

            expected.push(quote);

    });

    return expected;
};

module.exports = { getQuote };

// const ASX = [
//     {
//         "exchange": "ASX_ORIGIN",
//         "symbol": "BHP",
//         "quote":
//         {
//             "exchange": "ASX_ORIGIN",
//             "symbol": "BHP",
//             "surplus_volume": 200,
//             "auction_volume": 150,
//             "side": "Ask",
//             "ask_price": 40.51,
//             "ask_size": 283,
//             "bid_price": 40.5,
//             "bid_size": 5154,
//             "change_percent": -0.7108,
//             "change_point": -0.29,
//             "close": 36,
//             "high": 40.6,
//             "low": 40.31,
//             "open": 40.41,
//             "trade_price": 40.51,
//             "trade_size": 1,
//             "updated": 1740452882716,
//             "volume": 2437146,
//             "previous_close": 40.8,
//             "value_traded": 98555090.72,
//             "indicative_price": null,
//             "open_interest": null,
//             "implied_volatility": null,
//             "break_even": null,
//             "break_even_percent": null,
//             "in_the_money": null,
//             "delta": null,
//             "vega": null,
//             "theta": null,
//             "gamma": null,
//             "rho": null,
//             "5d_change_percent": null,
//             "price_lower_1": null,
//             "price_lower_2": null,
//             "price_higher_1": null,
//             "price_higher_2": null,
//             "long_lower_1": null,
//             "long_lower_2": null,
//             "long_higher_1": null,
//             "long_higher_2": null,
//             "short_lower_1": null,
//             "short_lower_2": null,
//             "short_higher_1": null,
//             "short_higher_2": null,
//             "number_of_trades": 17823,
//             "market_cap": null,
//             "theo_price": null,
//             "iv_change": null,
//             "is_closed_price_updated": false,
//             "pnl_price_type": "TRADING"
//         }
//     }
// ];

// const CXA = [
//     {
//         "exchange": "ASX_ORIGIN",
//         "symbol": "BHP",
//         "quote":
//         {
//             "exchange": "CXA",
//             "symbol": "BHP",
//             "surplus_volume": 500,
//             "auction_volume": 550,
//             "side": "Bid",
//             "ask_price": 42.63,
//             "ask_size": 8853,
//             "bid_price": 41.84,
//             "bid_size": 2509,
//             "change_percent": 0.038046,
//             "change_point": 1.55,
//             "close": 8,
//             "high": 42.84,
//             "low": 41.81,
//             "open": 42.84,
//             "trade_price": 42.29,
//             "trade_size": 30,
//             "updated": 1740447632037,
//             "volume": 4962,
//             "previous_close": 40.74,
//             "value_traded": 210035.86,
//             "indicative_price": null,
//             "auction_volume": 54594505,
//             "vwap": 42.328871,
//             "open_interest": null,
//             "implied_volatility": 0,
//             "break_even": null,
//             "break_even_percent": null,
//             "in_the_money": null,
//             "delta": null,
//             "vega": null,
//             "theta": null,
//             "gamma": null,
//             "rho": null,
//             "5d_change_percent": null,
//             "price_lower_1": null,
//             "price_lower_2": null,
//             "price_higher_1": null,
//             "price_higher_2": null,
//             "long_lower_1": null,
//             "long_lower_2": null,
//             "long_higher_1": null,
//             "long_higher_2": null,
//             "short_lower_1": null,
//             "short_lower_2": null,
//             "short_higher_1": null,
//             "short_higher_2": null,
//             "number_of_trades": 2186,
//             "market_cap": null,
//             "theo_price": null,
//             "iv_change": null,
//             "is_closed_price_updated": false,
//             "pnl_price_type": "TRADING"
//         }
//     }
// ]

// const all = getQuote(ASX, CXA);
// console.log(all);
// const { compareArrayObjects } = require("../../common/compareArray[Ob1]");
// const quoASX = ASX.map(item => item.quote);
// const quoCXA = CXA.map(item => item.quote);
// compareArrayObjects(quoASX, quoCXA, ["symbol"]);