const compareArrayObjects = (arr1, arr2, matchKeys) => {
  let result = [];

  // Hàm tìm Object tương ứng trong arr2 dựa trên matchKeys
  const findMatchingObject = (obj, array) => {
    return array.find((item) =>
      matchKeys.every((key) => obj[key] === item[key])
    );
  };

  // Duyệt từng Object trong arr1
  arr1.forEach((obj1) => {
    // Tìm Object tương ứng trong arr2
    const obj2 = findMatchingObject(obj1, arr2);

    if (obj2) {
      // Lấy các key chung giữa obj1 và obj2, bỏ qua các matchKeys
      let commonKeys = Object.keys(obj1).filter(
        (key) => Object.keys(obj2).includes(key) && !matchKeys.includes(key)
      );

      // So sánh các key còn lại
      commonKeys.forEach((key) => {
        result.push({
          fieldName: key,
          compareValue: obj1[key], // Giá trị của obj1
          expectedValue: obj2[key], // Giá trị của obj2
          matchResult: obj1[key] === obj2[key] ? "✅" : "❌",
          // matchedBy: matchKeys.map((k) => `${k}: ${obj1[k]}`).join(", "),
        });
      });

      console.table(result);
      // console.table(result.filter((r) => r.matchResult === "❌"));


    } else {
      // Nếu không tìm thấy Object tương ứng trong arr2
      result.push({
        // matchedBy: matchKeys.map((k) => `${k}: ${obj1[k]}`).join(", "),
        message: "❌ Không tìm thấy Object tương ứng",
      });
    }
  });

  return result;
};

module.exports = { compareArrayObjects };

// const arr1 = [
//   {
//     exchange: "ASX",
//     symbol: "ANZ",
//     ask_price: 0.047,
//     ask_size: 16,
//     bid_price: 0.047,
//     bid_size: 94,
//   },
//   {
//     exchange: "ASX",
//     symbol: "XAO",
//     ask_price: 0.097,
//     ask_size: 19,
//     bid_price: 0.7,
//     bid_size: 44,
//   },
// ];
// const arr2 = [
//   {
//     exchange: "ASX",
//     symbol: "ANZ",
//     ask_price: 0.047,
//     ask_size: 16,
//     bid_price: 0.047,
//     bid_size: 94,
//   },
//   {
//     exchange: "ASX",
//     symbol: "XAO",
//     ask_price: 0.097,
//     ask_size: 19,
//     bid_price: 0.7,
//     bid_size: 44,
//   },
// ];

// // So sánh theo key "id"
// const result = compareArrayObjects(arr1, arr2, ["exchange", "symbol"]);
// console.table(result);
