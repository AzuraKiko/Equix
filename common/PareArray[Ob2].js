const compareArrayObjects = (arr1, arr2, matchKeys, columnNames) => {
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

  // Hàm đệ quy để so sánh sâu từng key (kể cả Object lồng nhau)
  const deepCompare = (obj1, obj2, parentKey = '') => {
    let keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    keys.forEach(key => {
      let fullPath = parentKey ? `${parentKey}.${key}` : key;

      if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
        // Nếu là Object lồng nhau, đệ quy để so sánh sâu hơn
        deepCompare(obj1[key], obj2[key] || {}, fullPath);

      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key]) &&
        obj1[key].every(item => typeof item === 'string') &&
        obj2[key].every(item => typeof item === 'string')) {
        // Nếu cả 2 đều là array string, so sánh không quan tâm thứ tự
        const set1 = new Set(obj1[key]);
        const set2 = new Set(obj2[key]);

        const isEqual = set1.size === set2.size && [...set1].every(value => set2.has(value));
        result.push({
          [columnNames.fieldName]: fullPath,
          [columnNames.compareValue]: obj1[key].join(", "),
          [columnNames.expectedValue]: obj2[key].join(", "),
          [columnNames.matchResult]: isEqual ? "✅" : "❌",
          [columnNames.matchedBy]: matchKeys
            .map(k => obj1[k] !== undefined ? `${k}: ${obj1[k]}` : null)
            .filter(v => v !== null)
            .join(', ')

        });


        //   // Nếu là Array, so sánh từng phần tử
        // } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        //   obj1[key].forEach((item, index) => {
        //     let expectedItem = obj2[key] ? obj2[key][index] : undefined;

        //     // Nếu là chuỗi số, chuyển thành số nguyên để so sánh
        //     const value1 = isNaN(item) ? item : Number(item);
        //     const value2 = isNaN(expectedItem) ? expectedItem : Number(expectedItem);

        //     result.push({
        //       fieldName: `${fullPath}[${index}]`,
        //       compareValue: value1,
        //       expectedValue: value2,
        //       matchResult: value1 === value2 ? "✅" : "❌",
        //       matchedBy: matchKeys
        //       .map(k => obj1[k] !== undefined ? `${k}: ${obj1[k]}` : null)
        //       .filter(v => v !== null)
        //       .join(', ')
        //     });
        //   });

      } else {
        // So sánh giá trị trực tiếp
        result.push({
          [columnNames.fieldName]: fullPath,
          [columnNames.compareValue]: obj1[key],
          [columnNames.expectedValue]: obj2[key],
          [columnNames.matchResult]: obj1[key] === obj2[key] ? "✅" : "❌",
          [columnNames.matchedBy]: matchKeys
            .map(k => obj1[k] !== undefined ? `${k}: ${obj1[k]}` : null)
            .filter(v => v !== null)
            .join(', ')
        });
      }
    });
  };

  // Hàm tìm Object tương ứng trong arr2 dựa trên matchKeys
  const findMatchingObject = (obj, array) => {
    return array.find(item =>
      matchKeys.every(key => obj[key] === item[key])
    );
  };

  // Duyệt từng Object trong arr1
  arr1.forEach(obj1 => {
    // Tìm Object tương ứng trong arr2
    const obj2 = findMatchingObject(obj1, arr2);

    if (obj2) {
      // Bỏ qua các matchKeys, so sánh các key còn lại
      let obj1Filtered = {};
      let obj2Filtered = {};
      // const requireKeys = ["volume", "value_traded"]
      // requireKeys.forEach(key => {
      //   if (key in obj1) {
      //     obj1Filtered[key] = obj1[key];
      //   }
      //   if (key in obj2) {
      //     obj2Filtered[key] = obj2[key];
      //   }
      // });

      Object.keys(obj1).forEach(key => {
        if (!matchKeys.includes(key)) {
          obj1Filtered[key] = obj1[key];
          obj2Filtered[key] = obj2[key];
        }
      });

      deepCompare(obj1Filtered, obj2Filtered);

      console.table(result);

      // In ra các phần tử không tương ứng
      // console.table(result.filter((r) => r.matchResult === "❌"));
    } else {
      // Nếu không tìm thấy Object tương ứng trong arr2
      result.push({
        [columnNames.matchedBy]: matchKeys
          .map(k => obj1[k] !== undefined ? `${k}: ${obj1[k]}` : null)
          .filter(v => v !== null)
          .join(', '),
        message: "❌ Không tìm thấy Object tương ứng"
      });
    }
  });

  return result;
};

module.exports = { compareArrayObjects };

