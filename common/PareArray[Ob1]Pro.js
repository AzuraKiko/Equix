const compareArrayObjects = (arr1, arr2, matchKeys, extraColumns, columnNames) => {
  let result = [];

  // Đặt tên cột mặc định
  const defaultColumnNames = {
    fieldName: "Field Name",
    compareValue: "Compare Value",
    expectedValue: "Expected Value",
    matchResult: "Match Result",
    matchedBy: "Matched By",
    extraColumns: ["Add 1", "Add 2"]
  };

  // Merge tên cột tùy chỉnh với mặc định
  columnNames = { ...defaultColumnNames, ...columnNames };

  // Hàm tìm Object tương ứng trong một array dựa trên matchKeys
  const findMatchingObject = (obj, array) => {
    return array.find((item) =>
      matchKeys.every((key) => obj[key] === item[key])
    );
  };

  // Hàm lấy giá trị từ extraColumns
  const getExtraValue = (obj, extraColumnsArr, key) => {
    let extraObj = findMatchingObject(obj, extraColumnsArr);
    return extraObj ? extraObj[key] : "N/A";
  };

  // Duyệt từng Object trong arr1
  arr1.forEach((obj1) => {
    // Tìm Object tương ứng trong arr2
    const obj2 = findMatchingObject(obj1, arr2);



    if (obj2) {

      let keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

      // Lấy các key có trong ít nhất 1 trong 2 object và bỏ qua các key trong matchKeys
      let commonKeys = [...keys].filter(
        key => !matchKeys.includes(key)
      );

    //   const requiredKeys = ["volume", "value_traded"]
    //     commonKeys = Array.from(commonKeys).filter(key => 
    //     requiredKeys.some(requiredKey => key.includes(requiredKey))
    // );

      // So sánh các key còn lại
      commonKeys.forEach((key) => {
        let resultItem = {
          [columnNames.fieldName]: key,
        };

        // Thêm các cột extra với tên cột tùy chỉnh
        extraColumns.forEach((extraCol, index) => {
          let colName = columnNames.extraColumns[index] || `Extra ${index + 1}`;
          resultItem[colName] = getExtraValue(obj1, extraCol, key);
        });

        // Sau đó mới gán compareValue và expectedValue
        resultItem[columnNames.compareValue] = obj1[key]; // Giá trị của arr1
        resultItem[columnNames.expectedValue] = obj2[key]; // Giá trị của arr2
        resultItem[columnNames.matchResult] = obj1[key] === obj2[key] ? "✅" : "❌";
        resultItem[columnNames.matchedBy] = matchKeys.map((k) => `${k}: ${obj1[k]}`).join(", ");

        result.push(resultItem);
      });


    } else {
      // Nếu không tìm thấy Object tương ứng trong arr2
      if (obj1 && !obj2) {
        result.push({
          // [columnNames.matchedBy]: matchKeys.map((k) => `${k}: ${obj1[k]}`).join(", "),
          message: "❌ Không tìm thấy Object tương ứng"
        });
      };
    }
  });

  console.table(result);
  console.table(result.filter((r) => r[columnNames.matchResult] === "❌"));

  return result;
};

module.exports = { compareArrayObjects };

// // Dữ liệu mẫu
// let arr1 = [
//   { id: 1, name: "John", age: 25, city: "New York" },
//   { id: 2, name: "Jane", age: 30, city: "Los Angeles" },
//   { id: 3, name: "Doe", age: 22, city: "Chicago" }
// ];

// let arr2 = [
//   { id: 1, name: "John", age: 25, city: "New York" },
//   { id: 2, name: "Jane", age: 28, city: "Los Angeles" },
//   { id: 3, name: "Mike", age: 35, city: "Houston" }
// ];

// let extraColumns1 = [
//   { id: 1, name: "John", age: 26, city: "New York" },
//   { id: 2, name: "Jane", age: 31, city: "Los Angeles" }
// ];

// let extraColumns2 = [
//   { id: 1, name: "John", age: 27, city: "New York" },
//   { id: 3, name: "Doe", age: 23, city: "Chicago" }
// ];

// // Đặt tên cho tất cả các cột
// let columnNames = {
//   fieldName: "Tên Trường",
//   compareValue: "Giá Trị So Sánh",
//   expectedValue: "Giá Trị Mong Đợi",
//   matchResult: "Kết Quả Đối Chiếu",
//   matchedBy: "Đối Sánh Bởi",
//   extraColumns: ["Cột Thêm 1", "Cột Thêm 2"]
// };

// compareArrayObjects(arr1, arr2, ["id"], [extraColumns1, extraColumns2], columnNames)