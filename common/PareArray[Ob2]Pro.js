const compareArrayObjects = (arr1, arr2, matchKeys, extraColumns, columnNames) => {
  let result = [];

  const defaultColumnNames = {
    fieldName: "Field Name",
    compareValue: "Compare Value",
    expectedValue: "Expected Value",
    matchResult: "Match Result",
    // matchedBy: "Matched By",
    extraColumns: ["Add 1", "Add 2"],
  };

  columnNames = { ...defaultColumnNames, ...columnNames };

  // Hàm lấy giá trị từ fullPath (dùng cho cả arr1, arr2 và extraColumns)
  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((acc, key) => {
      // Nếu key là số, chuyển sang chỉ mục mảng
      if (!isNaN(key)) {
        key = parseInt(key, 10);
      }
      return acc ? acc[key] : undefined;
    }, obj);
  };

  // Hàm đệ quy để so sánh sâu từng key (kể cả Object lồng nhau)
  const deepCompare = (obj1, obj2, parentKey = "", extraData = {}) => {
    let keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);


    keys.forEach((key) => {
      let fullPath = parentKey ? `${parentKey}.${key}` : key;

      if (
        typeof obj1[key] === "object" &&
        obj1[key] !== null &&
        !Array.isArray(obj1[key])
      ) {
        // Nếu là Object lồng nhau, đệ quy để so sánh sâu hơn
        deepCompare(obj1[key], obj2[key] || {}, fullPath, extraData);
      } else if (
        Array.isArray(obj1[key]) &&
        Array.isArray(obj2[key]) &&
        obj1[key].every((item) => typeof item === "string") &&
        obj2[key].every((item) => typeof item === "string")
      ) {
        const set1 = new Set(obj1[key]);
        const set2 = new Set(obj2[key]);

        const isEqual =
          set1.size === set2.size &&
          [...set1].every((value) => set2.has(value));

        let resultItem = {
          [columnNames.fieldName]: fullPath,
        };

        // Thêm các cột extra với tên cột tùy chỉnh
        extraColumns.forEach((extraCol, index) => {
          let colName = columnNames.extraColumns[index] || `Extra ${index + 1}`;
          resultItem[colName] = getValueByPath(extraData[extraCol], fullPath) ?? "N/A";
        });

        resultItem[columnNames.compareValue] = obj1[key].join(", ");
        resultItem[columnNames.expectedValue] = obj2[key].join(", ");
        resultItem[columnNames.matchResult] = isEqual ? "✅" : "❌";
        // resultItem[columnNames.matchedBy] = matchKeys
        //   .map((k) => (obj1[k] !== undefined ? `${k}: ${obj1[k]}` : null))
        //   .filter((v) => v !== null)
        //   .join(", ");


        result.push(resultItem);

      } else {
        let isEqual = obj1[key] === obj2[key];

        let resultItem = {
          [columnNames.fieldName]: fullPath,
        };

        extraColumns.forEach((extraCol, index) => {
          let colName = columnNames.extraColumns[index] || `Extra ${index + 1}`;
          resultItem[colName] = getValueByPath(extraData[extraCol], fullPath) ?? "N/A";
        });

        resultItem[columnNames.compareValue] = obj1[key] ?? "N/A";
        resultItem[columnNames.expectedValue] = obj2[key] ?? "N/A";
        resultItem[columnNames.matchResult] = isEqual ? "✅" : "❌";
        // resultItem[columnNames.matchedBy] = matchKeys
        //   .map((k) => (obj1[k] !== undefined ? `${k}: ${obj1[k]}` : null))
        //   .filter((v) => v !== null)
        //   .join(", ");

        result.push(resultItem);
      }
    });
  };

  // Hàm tìm Object tương ứng trong arr2 dựa trên matchKeys
  const findMatchingObject = (obj, array) => {
    return array.find((item) =>
      matchKeys.every((key) => obj[key] === item[key])
    );
  };

  // Duyệt từng Object trong arr1
  arr1.forEach((obj1) => {
    const obj2 = findMatchingObject(obj1, arr2);

    if (obj2) {
      let obj1Filtered = {};
      let obj2Filtered = {};
      let extraData = {};

      Object.keys(obj1).forEach((key) => {
        if (!matchKeys.includes(key)) {
          obj1Filtered[key] = obj1[key];
          obj2Filtered[key] = obj2[key];
        }
      });

      // Chuẩn bị dữ liệu cho extraColumns
      extraColumns.forEach((extraCol) => {
        const extraObj = findMatchingObject(obj1, [extraCol]); // Chuyển thành mảng
        if (extraObj) {
          extraData[extraCol] = extraObj;
        }
      });


      deepCompare(obj1Filtered, obj2Filtered, "", extraData);
    } else {
      result.push({
        // [columnNames.matchedBy]: matchKeys
        //   .map((k) => (obj1[k] !== undefined ? `${k}: ${obj1[k]}` : null))
        //   .filter((v) => v !== null)
        //   .join(", "),

        message: "❌ Không tìm thấy Object tương ứng",
      });
    }
  });

  console.table(result);
  // In ra các phần tử không tương ứng
  // console.table(result.filter((r) => r.matchResult === "❌"));

  return result;
};

module.exports = { compareArrayObjects };


// // Dữ liệu mẫu để kiểm thử
// const arr1 = [
//   {
//     "exchange": "ASX1",
//     "symbol": "ANZ",
//     "depth": {
//       "ask": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 98,
//           "number_of_trades": 1,
//           "price": 0.047,
//           "exchanges": "ASX1"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 11,
//           "number_of_trades": 1,
//           "price": 0.046,
//           "exchanges": "ASX1"
//         }
//       },
//       "bid": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 96,
//           "number_of_trades": 1,
//           "price": 0.047,
//           "exchanges": "ASX1"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 20,
//           "number_of_trades": 1,
//           "price": 0.046,
//           "exchanges": "ASX1"
//         }
//       },
//       "total_ask_size": 498,
//       "total_bid_size": 409
//     },
//   }
// ];
// const arr2 = [
//   {
//     "exchange": "ASX1",
//     "symbol": "ANZ",
//     "depth": {
//       "ask": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 98,
//           "number_of_trades": 1,
//           "price": 0.047,
//           "exchanges": "ASX1"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 11,
//           "number_of_trades": 1,
//           "price": 0.046,
//           "exchanges": "ASX1"
//         }
//       },
//       "bid": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 192,
//           "number_of_trades": 2,
//           "price": 0.047,
//           "source": "MIX"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 40,
//           "number_of_trades": 2,
//           "price": 0.046,
//           "source": "MIX"
//         }
//       },
//       "total_ask_size": 0,
//       "total_bid_size": 818
//     },
//   }
// ];
// const extraColumns1 = [
//   {
//     "exchange": "ASX1",
//     "symbol": "ANZ",
//     "depth": {
//       "ask": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 98,
//           "number_of_trades": 1,
//           "price": 0.047,
//           "exchanges": "ASX1"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 11,
//           "number_of_trades": 1,
//           "price": 0.046,
//           "exchanges": "ASX1"
//         }
//       },
//       "bid": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 96,
//           "number_of_trades": 1,
//           "price": 0.047,
//           "exchanges": "ASX1"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 20,
//           "number_of_trades": 1,
//           "price": 0.046,
//           "exchanges": "ASX1"
//         }
//       },
//       "total_ask_size": 498,
//       "total_bid_size": 409
//     },
//   },
// ];

// const extraColumns2 = [
//   {
//     "exchange": "ASX1",
//     "symbol": "ANZ",
//     "depth": {
//       "ask": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 98,
//           "number_of_trades": 1,
//           "price": 0.047,
//           "exchanges": "ASX1"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 11,
//           "number_of_trades": 1,
//           "price": 0.046,
//           "exchanges": "ASX1"
//         }
//       },
//       "bid": {
//         "0": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 96,
//           "number_of_trades": 1,
//           "price": 0.047,
//           "exchanges": "ASX1"
//         },
//         "1": {
//           "symbol": "ANZ",
//           "side": "Bid",
//           "quantity": 20,
//           "number_of_trades": 1,
//           "price": 0.046,
//           "exchanges": "ASX1"
//         }
//       },
//       "total_ask_size": 498,
//       "total_bid_size": 409
//     },
//   },
// ];

// const mergedExtraColumns = [...extraColumns1, ...extraColumns2];

// compareArrayObjects(arr1, arr2, ["id"], mergedExtraColumns, {});