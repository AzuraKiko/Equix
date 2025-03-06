const compareObjectArray = (obj1, obj2, fieldMapping, columnNames = {}) => {
    let result = [];

    const defaultColumnNames = {
        FieldName1: "Field Name 1",
        FieldName2: "Field Name 2",
        Value1: "Value 1",
        Value2: "Value 2",
        MatchResult: "Match Result"
    }

    columnNames = { ...defaultColumnNames, ...columnNames };

    const getValueByPath = (obj, path) => {
        return path.split('.').reduce((acc, key) => {
            if (!acc) return undefined;
            return acc[key];
        }, obj);
    };

    const deepCompare = (obj1, obj2, fieldMapping) => {
        Object.entries(fieldMapping).forEach(([key, mapping]) => {
            const { target, enumMap } = mapping;
            const value1 = getValueByPath(obj1, key);
            const value2 = getValueByPath(obj2, target);

            if (Array.isArray(value1) && Array.isArray(value2)) {
                value1.forEach((item1, index) => {
                    const item2 = value2[index];
                    if (item2) {
                        deepCompare(item1, item2, {
                            [key]: mapping
                        });
                    } else {
                        result.push({
                            [columnNames.FieldName1]: key,
                            [columnNames.FieldName2]: target,
                            [columnNames.Value1]: JSON.stringify(item1),
                            [columnNames.Value2]: "Not Found",
                            [columnNames.MatchResult]: "❌"
                        });
                    }
                });
            } else {
                let compareVal = value1;
                let expectedVal = value2;

                if (enumMap && value1 in enumMap) {
                    compareVal = enumMap[value1];
                }

                let isEqual = compareVal === expectedVal;

                let resultItem = {
                    [columnNames.FieldName1]: key,
                    [columnNames.FieldName2]: target,
                    [columnNames.Value1]: compareVal ?? "N/A",
                    [columnNames.Value2]: expectedVal ?? "N/A",
                    [columnNames.MatchResult]: isEqual ? "✅" : "❌",
                }

                result.push(resultItem);
            }
        });
    };

    deepCompare(obj1, obj2, fieldMapping);

    console.table(result);

    return result;
};


// const fieldMapping = {
//     "customerReferenceNumber": { target: "equix_id", type: "string" },
//     "applicant.entityType": {
//         target: "account_type",
//         type: "string",
//         enumMap: { "Individual": "INDIVIDUAL" }
//     },
//     "applicant.person.title": {
//         target: "applicant_details.title",
//         type: "string",
//         enumMap: { "mr": "MR", "mrs": "MRS", "ms": "MS", "miss": "MISS" }
//     },
//     "applicant.person.firstName": {
//         target: "applicant_details.first_name",
//         type: "string"
//     }
// };

// const obj1 = {
//     customerReferenceNumber: "123456",
//     applicant: {
//         entityType: "Individual",
//         person: {
//             title: "mr",
//             firstName: "John"
//         }
//     }
// };

// const obj2 = {
//     equix_id: "123456",
//     account_type: "INDIVIDUAL",
//     applicant_details:
//     {
//         title: "MR",
//         first_name: "John"
//     }
// };

// compareObjectArray(obj1, obj2, fieldMapping);
