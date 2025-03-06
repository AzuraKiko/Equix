// Compare thêm cột
const compareObjects = (obj1, obj2, columnNames, extraColumns) => {
    let result = [];

    // Lấy danh sách các key có chung giữa obj1 và obj2
    let commonKeys = Object.keys(obj1).filter(key => Object.keys(obj2).includes(key));

    // So sánh từng key chung
    commonKeys.forEach(key => {
        result.push({
            [columnNames.fieldName]: key,
            [columnNames.compareValue]: obj1[key],
            [columnNames.expectedValue]: obj2[key],
            [columnNames.matchResult]: obj1[key] === obj2[key] ? "✅" : "❌",
            [columnNames.extraColumn1]: extraColumns.extraColumn1[key],
            [columnNames.extraColumn2]: extraColumns.extraColumn2[key]
        });
    });
    // console.table(result);
    // console.table(result.filter((r) => r.matchResult === "❌"));

    return result;

};

module.exports = { compareObjects };

// const defaultColumnNames = {
//     fieldName: "fieldName",
//     compareValue: "compareValue",
//     expectedValue: "expectedValue",
//     matchResult: "matchResult",
//     extraColumn1: "extraColumn1",  // Đặt tên cột thêm 1
//     extraColumn2: "extraColumn2"   // Đặt tên cột thêm 2
// };

// let obj1 = { name: "John", age: 25, city: "New York" };
// let obj2 = { name: "John", age: 25, city: "Los Angeles" };
// let extraColumns = {
//     extraColumn1: { name: "A", age: "B", city: "C" },
//     extraColumn2: { name: "X", age: "Y", city: "Z" }
// };

// console.log(compareObjects(obj1, obj2, defaultColumnNames, extraColumns));

