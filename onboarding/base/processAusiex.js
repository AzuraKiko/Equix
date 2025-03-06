const { checkType } = require("../../common/checkType");
const { getValueArray } = require("../../common/getValue");
const processAusiexData = (data, mappings) => {
    let result = {};
    let errors = [];

    for (const key in mappings) {
        const mapping = mappings[key];
        if (mapping.target !== undefined || mapping.defaultValue !== undefined) {
            if (key.includes("[index]")) {
                // 🔹 Nếu key có `[index]`, lặp qua mảng
                const baseKey = key.split("[index]")[0];
                const nestedArray = getValueArray(data, baseKey);

                if (Array.isArray(nestedArray)) {
                    nestedArray.forEach((_, idx) => {
                        let value = getValueArray(
                            data,
                            key.replace("[index]", `[${idx}]`)
                        );
                        result[key.replace("[index]", `[${idx}]`)] = value;

                        if (mapping.type) {
                            let actualType;

                            if (value === null) {
                                actualType = null;
                            } else if (Array.isArray(value)) {
                                actualType = "array";
                            } else {
                                actualType = typeof value;
                            }
                            const isTypeValid = checkType(value, mapping.type);

                            if (!mapping.type.includes(actualType)) {
                                errors.push({
                                    AuseixKey: key.replace("[index]", `[${idx}]`),
                                    Value: value,
                                    ActualType: actualType,
                                    ExpectedType: mapping.type,
                                    TypeValid: isTypeValid ? "✅" : `❌`,
                                });
                            }
                        }
                    });
                }
            } else {
                // 🔹 Nếu key là bình thường
                let value = getValueArray(data, key);
                result[key] = value;

                if (mapping.type) {
                    let actualType;

                    if (value === null) {
                        actualType = null;
                    } else if (Array.isArray(value)) {
                        actualType = "array";
                    } else {
                        actualType = typeof value;
                    }
                    const isTypeValid = checkType(value, mapping.type);

                    if (!mapping.type.includes(actualType)) {
                        errors.push({
                            AuseixKey: key, // Không sử dụng idx ở đây
                            Value: value,
                            ActualType: actualType,
                            ExpectedType: mapping.type,
                            TypeValid: isTypeValid ? "✅" : `❌`,

                        });
                    }
                }
            }
        }
        else {
            if (key.includes("isSupplied")) {
                const taxDetails = getValueArray(data, "applicant.taxDetails");
                if (Array.isArray(taxDetails)) {
                    taxDetails.forEach((taxDetail, idx) => {
                        result[key.replace("[index]", `[${idx}]`)] = taxDetail.isSupplied;
                    });
                }
            } else if (key.includes("holdFunds")) {
                const holdFunds = getValueArray(data, "settlement.holdFunds");
                if (holdFunds !== undefined) {
                    result[key] = holdFunds;
                }
            } else {
                continue;
            }
        }
    }
    console.table(errors);
    return result;
};
module.exports = { processAusiexData };