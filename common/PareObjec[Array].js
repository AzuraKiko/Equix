const compareObjectArray = (obj1, obj2, extraColumns = [], columnNames = {}) => {
    let result = [];

    const defaultColumnNames = {
        fieldName: "Field Name",
        compareValue: "Compare Value",
        expectedValue: "Expected Value",
        matchResult: "Match Result",
        extraColumns: ["Add 1", "Add 2"],
    };

    columnNames = { ...defaultColumnNames, ...columnNames };

    // Hàm lấy giá trị từ fullPath (dùng cho cả obj1, obj2 và extraColumns)
    const getValueByPath = (obj, path) => {
        return path.split('.').reduce((acc, key) => {
            if (!isNaN(key)) {
                key = parseInt(key, 10);
            }
            return acc ? acc[key] : undefined;
        }, obj);
    };

    // Hàm đệ quy để so sánh sâu từng key (kể cả Object lồng nhau)
    const deepCompare = (obj1, obj2, parentKey = "") => {
        let keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

        keys.forEach((key) => {
            let fullPath = parentKey ? `${parentKey}.${key}` : key;

            if (
                typeof obj1[key] === "object" &&
                obj1[key] !== null &&
                !Array.isArray(obj1[key])
            ) {
                // Nếu là Object lồng nhau, đệ quy để so sánh sâu hơn
                deepCompare(obj1[key], obj2[key] || {}, fullPath);
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
                extraColumns.forEach((extraObj, index) => {
                    let colName = columnNames.extraColumns[index] || `Extra ${index + 1}`;
                    resultItem[colName] = getValueByPath(extraObj, fullPath) ?? "N/A";
                });

                resultItem[columnNames.compareValue] = obj1[key].join(", ");
                resultItem[columnNames.expectedValue] = obj2[key].join(", ");
                resultItem[columnNames.matchResult] = isEqual ? "✅" : "❌";

                result.push(resultItem);

            } else {
                let isEqual = obj1[key] === obj2[key];

                let resultItem = {
                    [columnNames.fieldName]: fullPath,
                };

                extraColumns.forEach((extraObj, index) => {
                    let colName = columnNames.extraColumns[index] || `Extra ${index + 1}`;
                    resultItem[colName] = getValueByPath(extraObj, fullPath) ?? "N/A";
                });

                resultItem[columnNames.compareValue] = obj1[key] ?? "N/A";
                resultItem[columnNames.expectedValue] = obj2[key] ?? "N/A";
                resultItem[columnNames.matchResult] = isEqual ? "✅" : "❌";

                result.push(resultItem);
            }
        });
    };

    deepCompare(obj1, obj2);

    console.table(result);
    // In ra các phần tử không tương ứng
    // console.table(result.filter((r) => r.matchResult === "❌"));

    return result;
};

module.exports = { compareObjectArray };


// const obj1 = {
//     name: "Alice",
//     age: 25,
//     address: {
//         city: "New York",
//         zip: "10001"
//     },
//     hobbies: ["reading", "traveling"]
// };

// const obj2 = {
//     name: "Alice",
//     age: 26,
//     address: {
//         city: "Los Angeles",
//         zip: "90001"
//     },
//     hobbies: ["reading", "traveling"]
// };

// const obj3 = {
//     name: "Rose",
//     age: 22,
//     address: {
//         city: "Washington",
//         zip: "9002"
//     },
//     hobbies: ["writing"]
// };

// const obj4 = {
//     name: "Lisa",
//     age: 22,
//     address: {
//         city: "Paris",
//         zip: "9001"
//     },
//     hobbies: ["reading"]
// };

// compareObjectArray(obj1, obj2, [obj3, obj4]);

