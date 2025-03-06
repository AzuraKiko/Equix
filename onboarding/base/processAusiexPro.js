const { checkType } = require("../../common/checkType");

const flattenObject = (obj, prefix = "") => {
    let result = {};

    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(obj[key])) {
            // Nếu là array của string thì gộp lại thành 1 chuỗi
            if (obj[key].every(item => typeof item === "string")) {
                result[fullKey] = obj[key];
            } else {
                obj[key].forEach((item, index) => {
                    Object.assign(result, flattenObject(item, `${fullKey}[${index}]`));
                });
            }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            Object.assign(result, flattenObject(obj[key], fullKey));
        } else {
            result[fullKey] = obj[key];
        }
    }
    
    return result;
};


const applyTypeCheck = (data, mapping) => {
    let errors = [];

    for (const key in data) {
        let mappedKey = key.replace(/\[\d+\]/g, "[index]"); // Chuẩn hóa key để so khớp với mapping
        let value = data[key];

        if (mapping[mappedKey]) {
            const { type } = mapping[mappedKey];

            let actualType;
            if (value === null) {
                actualType = "null";
            } else if (Array.isArray(value)) {
                actualType = "array";
            } else {
                actualType = typeof value;
            }

            const isTypeValid = checkType(value, type);

            if (!isTypeValid) {
                errors.push({
                    AuseixKey: key,
                    Value: value,
                    ActualType: actualType,
                    ExpectedType: type,
                    TypeValid: "❌",
                });
            }
        }
    }

    return errors;
};

module.exports = { flattenObject, applyTypeCheck };