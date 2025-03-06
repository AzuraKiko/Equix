const compareMultipleObjects = (...objects) => {
    let columnNames = objects.pop(); // Lấy columnNames là tham số cuối cùng
    let result = [];

    if (objects.length < 2) {
        return "Cần ít nhất 2 object để so sánh!";
    }

    // Lấy danh sách các key chung giữa tất cả các object
    let commonKeys = Object.keys(objects[0]).filter(key =>
        objects.every(obj => Object.keys(obj).includes(key))
    );

    // So sánh từng key chung
    commonKeys.forEach(key => {
        // Lấy giá trị của key này trên tất cả các object
        let values = objects.map(obj => obj[key]);

        // Kiểm tra tất cả các giá trị có bằng nhau không
        let isAllMatch = values.every(value => value === values[0]);

        result.push({
            [columnNames.fieldName]: key,
            [columnNames.values]: values,   // Danh sách giá trị của từng object cho key này
            [columnNames.matchResult]: isAllMatch ? "✅" : "❌"
        });
    });

    // console.table(result);
    // console.table(result.filter((r) => r.matchResult === "❌"));

    return result;
};

module.exports = { compareMultipleObjects };

// const defaultColumnNames = {
//     fieldName: "fieldName",
//     values: "values",
//     matchResult: "matchResult"
// };

// let obj1 = { name: "John", age: 25, city: "New York" };
// let obj2 = { name: "John", age: 25, city: "Los Angeles" };
// let obj3 = { name: "John", age: 25, city: "New York" };

// console.table(compareMultipleObjects(obj1, obj2, obj3, defaultColumnNames));
