// Các module chung
const { readJSONfile } = require("../../common/readJSONfile");
const { saveFile } = require("../../common/saveFile");
const { flattenObject, applyTypeCheck } = require("../base/processAusiexPro");
const { processEquixData } = require("../base/processEquixPro");
const { compareObjects } = require("../../common/PareObject");


// Import cấu hình
let auseixData = readJSONfile("../onboarding/individual/auseix.json");
let equixData = readJSONfile("../onboarding/individual/equix.json");
const { generateAddressLines } = require("../base/addressLines");


// Gọi hàm generateAddressLines và lưu kết quả vào holdingDetails_addressLines
let holdingDetails_addressLines = generateAddressLines(equixData);

// Thêm holdingDetails_addressLines vào equixData
equixData.holdingDetails_addressLines = holdingDetails_addressLines;



// Xử lý dữ liệu Auseix
const auseixMapping = flattenObject(auseixData);
const errorsType = applyTypeCheck(auseixMapping, fieldMappings);
if (errorsType.length > 0) {
    console.log(errorsType);
}

// Xử lý dữ liệu Equix
const equixMapping = processEquixData(equixData, fieldMappings);
// console.log(JSON.stringify(equixMapping, null, 2))

const columnNames1 = {
    fieldName: "Field Name",
    compareValue: "Auseix Value",
    expectedValue: "Equix Value",
    matchResult: "Match Result",
};

const columnNames2 = {
    FieldName1: "Field Name",
    Value1: "Auseix Value",
    Value2: "Equix Value",
    MatchResult: "Match Result",
};

const resultTable = compareObjects(auseixMapping, equixMapping, columnNames1);
const { loggerTable } = require("../../logger/loggerTable");
loggerTable(resultTable, columnNames2, [50, 50, 50, 10]);

// Ghi kết quả vào file CSV
const { Parser } = require("json2csv");
const content = new Parser().parse(resultTable);

saveFile(content, "../onboarding/individual/result.csv");