
const { wrapText } = require("../common/trundicate");

const loggerSimple = (result, columnNames = {}) => {
    const defaultColumnNames = {
        FieldName1: "Field Name 1",
        FieldName2: "Field Name 2",
        Value1: "Value 1",
        Value2: "Value 2",
        MatchResult: "Match Result"
    }

    columnNames = { ...defaultColumnNames, ...columnNames };

    result.forEach(row => {
        console.log('--------------------------');
        
        console.log(columnNames.FieldName1, wrapText(row[columnNames.FieldName1] || "", 50));
        console.log(columnNames.FieldName2, wrapText(row[columnNames.FieldName2] || "", 50));
        console.log(columnNames.Value1, wrapText(row[columnNames.Value1] || "", 20));
        console.log(columnNames.Value2, wrapText(row[columnNames.Value2] || "", 20));
        console.log(columnNames.MatchResult, wrapText(row[columnNames.MatchResult] || "", 20));
    });
    console.log('--------------------------');
};

module.exports = { loggerSimple };