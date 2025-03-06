const { normalizeValue } = require("../../common/normalizeValue");
const { getValueArray } = require("../../common/getValue");

const processEquixData = (data, mappings) => {
    let result = {};
    const applicantDetails = getValueArray(data, "applicant_details") || [];

    const getValueFromTarget = (target, applicantIdx) => {
        if (Array.isArray(target)) {
            const values = target
                .map((t) => {
                    // Kiểm tra xem target có chứa [index] không
                    if (t.includes("[index]")) {
                        return getValueArray(data, t.replace("[index]", `[${applicantIdx}]`));
                    } else {
                        return getValueArray(data, t);
                    }
                })
                .filter((v) => v !== undefined);
            return values.length > 0 ? values.join(" ") : undefined;
        } else if (typeof target === "string") {
            // Kiểm tra xem target có chứa [index] không
            if (target.includes("[index]")) {
                const replacedTarget = target.replace("[index]", `[${applicantIdx}]`);
                return getValueArray(data, replacedTarget);
            } else {
                return getValueArray(data, target);
            }
        }
        return undefined;
    };

    const handleLastUpdated = (applicant) => {
        let maxTimestamp = null;
        const uploadedDocuments = getValueArray(applicant, "uploaded_documents");

        if (Array.isArray(uploadedDocuments)) {
            uploadedDocuments.forEach((doc) => {
                const lastUpdated = parseInt(doc.last_updated, 10);
                const fileName = doc.document_file_name;
                if (lastUpdated && fileName.includes("passKYCReport")) {
                    maxTimestamp = lastUpdated;
                }
            });
        }

        return maxTimestamp !== null ? new Date(maxTimestamp).toISOString() : undefined;
    };

    const processKey = (key, mapping, applicantIdx) => {
        const replaceKey = key.replace("[index]", `[${applicantIdx}]`);
        const target = mapping.target;
        let value;

        // Xử lý logic đặc biệt cho `applicant.taxDetails[index].isSupplied`
        if (key.includes("applicant.taxDetails[index].isSupplied")) {
            const superFundTfn = getValueArray(data, "super_fund_tfn");
            value = superFundTfn !== null && superFundTfn !== undefined;
        } else if (key.includes("hin")) {
            const hin = getValueArray(data, "settlement_existing_hin");
            value = hin ? String(hin) : undefined;
        } else if (key.includes("branchCode")) {
            const branchCode = getValueArray(data, "bank_bsb");
            value = branchCode ? branchCode.replace(/\D/g, "") : undefined;
        } else if (key.includes("accountName")) {
            const accountName = getValueArray(data, "bank_account_name");
            value = accountName ? accountName.replace(/[^a-zA-Z0-9 '-]/g, "-") : undefined;
        }
        else if (target) {
            if (target.includes("last_updated")) {
                value = handleLastUpdated(applicantDetails[applicantIdx]);
            } else {
                value = getValueFromTarget(target, applicantIdx);
            }

            if (mapping.enumMap && value in mapping.enumMap) {
                value = mapping.enumMap[value] ?? value;
            }
        }

        if (value === undefined && mapping.defaultValue !== undefined) {
            value = mapping.defaultValue;
        }

        if (key.includes("nonSupplyReasonCode")) {
            const tfn = getValueArray(data, "super_fund_tfn");
            if (tfn !== null && tfn !== undefined) {
                value = undefined;
            } else {
                value = mapping.defaultValue;
            }
        }

        if (value !== undefined) {
            const type = Array.isArray(value) ? "array" : typeof value;
            result[replaceKey] = normalizeValue(value, type);
        }
    };

    for (const key in mappings) {
        const mapping = mappings[key];

        if (key.includes("[index]")) {
            // Xử lý key có [index]
            applicantDetails.forEach((_, applicantIdx) => {
                processKey(key, mapping, applicantIdx);
            });
        } else {
            // Xử lý key không có [index]
            if (mapping.target) {
                // Nếu có target, lấy giá trị từ target
                processKey(key, mapping, 0);
            } else if (mapping.defaultValue !== undefined) {
                // Nếu không có target nhưng có defaultValue, gán defaultValue
                const type = Array.isArray(mapping.defaultValue) ? "array" : typeof mapping.defaultValue;
                result[key] = normalizeValue(mapping.defaultValue, type);
            }
        }
    }

    return result;
};

module.exports = { processEquixData };
