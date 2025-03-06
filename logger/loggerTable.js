const { truncateStringEnd, truncateStringStart, wrapText } = require("../common/trundicate");
const Table = require('cli-table3');

const loggerTable = (result, columnNames = {}, colWidths = []) => {
    const defaultColumnNames = {
        FieldName1: "Field Name 1",
        // FieldName2: "Field Name 2",
        Value1: "Value 1",
        Value2: "Value 2",
        MatchResult: "Match Result"
    }
    columnNames = { ...defaultColumnNames, ...columnNames };
    const defaultColWidths = [50, 50, 50, 50, 10];
    colWidths = [...defaultColWidths, ...colWidths];
    const table1 = new Table({
        head: [columnNames.FieldName1, columnNames.Value1, columnNames.Value2, columnNames.MatchResult],
        colWidths: colWidths,
        wordWrap: true
    });
    const table2 = new Table({
        head: [columnNames.FieldName1, columnNames.Value1, columnNames.Value2, columnNames.MatchResult],
        colWidths: colWidths,
        wordWrap: true
    });

    result.forEach(row => {
        table1.push([
            wrapText(row[columnNames.FieldName1], 50),
            // wrapText(row[columnNames.FieldName2], 50),
            wrapText(row[columnNames.Value1], 50),
            wrapText(row[columnNames.Value2], 50),
            row[columnNames.MatchResult]
        ]);
    });

    console.log(table1.toString());

    // Logger table check failed match
    result.filter(row => row[columnNames.MatchResult].includes('❌')).forEach(row => {
        table2.push([
            wrapText(row[columnNames.FieldName1], 50),
            // wrapText(row[columnNames.FieldName2], 50),
            wrapText(row[columnNames.Value1], 50),
            wrapText(row[columnNames.Value2], 50),
            row[columnNames.MatchResult]
        ]);
    });

    if (table2.length > 0) {
        console.log("\nFailed Match Result checks:");
        console.log(table2.toString());
    } else {
        console.log("All Match Result checks passed!");
    }
};

module.exports = { loggerTable };
