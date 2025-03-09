const { normalizeValue } = require("../../common/normalizeValue");
const { getValueArray } = require("../../common/getValue");

const processEquixData = (data, mappings) => {
  let result = {};
  const applicantDetails = getValueArray(data, "applicant_details") || [];

  for (const key in mappings) {
    const mapping = mappings[key];
    const target = mapping.target;
    let value;
    if (target !== undefined || mapping.defaultValue !== undefined) {
      if (key.includes("[index]")) {
        applicantDetails.forEach((applicant, applicantIdx) => {

          let replacedKey = key;

          // Thay thế "[index]" trong "parties[index]", "trustees[index]", và "beneficiaryDetails[index]"
          if (key.includes("parties[index]")) {
            replacedKey = replacedKey.replaceAll(
              "parties[index]",
              `parties[${applicantIdx}]`
            );
          }
          if (key.includes("trustees[index]")) {
            replacedKey = replacedKey.replaceAll(
              "trustees[index]",
              `trustees[${applicantIdx}]`
            );
          }
          if (key.includes("applicant.emailAddresses[index]")) {
            replacedKey = replacedKey.replaceAll(
              "applicant.emailAddresses[index]",
              `applicant.emailAddresses[${applicantIdx}]`
            );
            if (applicantIdx >= 1) return;
          }
          if (key.includes("beneficiaryDetails[index]")) {
            replacedKey = replacedKey.replaceAll(
              "beneficiaryDetails[index]",
              `beneficiaryDetails[${applicantIdx}]`
            );
            if (applicantIdx >= 1) return;
          }

          if (Array.isArray(target)) {
            let values = target
              .map((t) =>
                typeof t === "string"
                  ? getValueArray(
                    data,
                    t.replaceAll("[index]", `[${applicantIdx}]`)
                  )
                  : undefined
              )
              .filter((v) => v !== undefined);

            if (values.length > 0) {
              value = values.join(" ").trim();
            } else if (mapping.defaultValue !== undefined) {
              value = mapping.defaultValue;
            }
          } else if (typeof target === "string") {
            let replacedTarget = target.replaceAll(
              "[index]",
              `[${applicantIdx}]`
            );

            // ✅ Check nếu target là `last_updated`, tìm timestamp mới nhất
            if (replacedTarget.includes("last_updated")) {
              let maxTimestamp = null;
              const uploadedDocuments = getValueArray(
                applicant,
                "uploaded_documents"
              );

              if (Array.isArray(uploadedDocuments)) {
                uploadedDocuments.forEach((doc) => {
                  const lastUpdated = parseInt(doc.last_updated, 10);
                  const fileName = doc.document_file_name;
                  // if (!isNaN(lastUpdated) && (maxTimestamp === null || lastUpdated > maxTimestamp)) {
                  //     maxTimestamp = lastUpdated;
                  // }
                  if (lastUpdated && fileName.includes("passKYCReport")) {
                    maxTimestamp = lastUpdated;
                  }
                });
              }
              // Chuyển timestamp thành ISO string nếu có dữ liệu
              if (maxTimestamp !== null) {
                value = new Date(maxTimestamp).toISOString();
              }
            } else {
              value = getValueArray(data, replacedTarget);
            }
          }
          if (key.includes("branchCode")) {
            const branchCode = getValueArray(data, "bank_bsb");
            value = branchCode ? branchCode.replace(/\D/g, "") : branchCode;
          } else if (key.includes("accountName")) {
            const accountName = getValueArray(data, "bank_account_name");
            value = accountName
              ? accountName.replace(/[^a-zA-Z0-9 '-]/g, "-")
              : accountName;
          }

          // ✅ Nếu giá trị là một mảng, tự động đánh index chính xác
          if (Array.isArray(value)) {
            value.forEach((item, itemIdx) => {
              let arrayKey = replacedKey
                .replace("emailAddresses[index]", `emailAddresses[${itemIdx}]`)
                .replace("phoneNumbers[index]", `phoneNumbers[${itemIdx}]`);
              const type = Array.isArray(value) ? "array" : typeof item;

              result[arrayKey] = normalizeValue(item, type);
            });
          } else {
            if (mapping.enumMap && value in mapping.enumMap) {
              value = mapping.enumMap[value] ?? value;
            }

            if (value === undefined && mapping.defaultValue !== undefined) {
              value = mapping.defaultValue;
            }

            const type = Array.isArray(value) ? "array" : typeof value;
            result[replacedKey.replace("[index]", `[0]`)] = normalizeValue(
              value,
              type
            );
          }
        });
      } else {
        if (Array.isArray(target)) {
          let values = target
            .map((t) =>
              typeof t === "string" ? getValueArray(data, t) : undefined
            )
            .filter((v) => v !== undefined);
          if (values.length > 0) {
            value = values.join(" ").trim();
          } else if (mapping.defaultValue !== undefined) {
            value = mapping.defaultValue;
          }
          const type = Array.isArray(value) ? "array" : typeof value;
          result[key] = normalizeValue(value, type);
        } else if (
          typeof target === "string" ||
          mapping.defaultValue !== undefined
        ) {
          value = target ? getValueArray(data, target) : mapping.defaultValue;
          if (
            target &&
            typeof target === "string" &&
            target.includes("last_updated")
          ) {
            applicantDetails.forEach((applicant, applicantIdx) => {
              let maxTimestamp = null;
              const uploadedDocuments = getValueArray(
                applicant,
                "uploaded_documents"
              );

              if (Array.isArray(uploadedDocuments)) {
                uploadedDocuments.forEach((doc) => {
                  const lastUpdated = parseInt(doc.last_updated, 10);
                  const fileName = doc.document_file_name;
                  if (lastUpdated && fileName.includes("passKYCReport")) {
                    maxTimestamp = lastUpdated;
                  }
                });
              }
              // Chuyển timestamp thành ISO string nếu có dữ liệu
              if (maxTimestamp !== null) {
                value = new Date(maxTimestamp).toISOString();
              }
            });
          }

          if (Array.isArray(value)) {
            if (value.every((item) => typeof item === "string")) {
              result[key] = value;
            } else {
              value.forEach((item, itemIdx) => {
                let arrayKey = key.replace("[index]", `[${itemIdx}]`);
                const type = Array.isArray(value) ? "array" : typeof item;
                result[arrayKey] = normalizeValue(item, type);
              });
            }
          } else {
            if (mapping.enumMap && value in mapping.enumMap) {
              value = mapping.enumMap[value] ?? value;
            }

            if (value === undefined && mapping.defaultValue !== undefined) {
              value = mapping.defaultValue;
            }

            const type = Array.isArray(value) ? "array" : typeof value;
            result[key] = normalizeValue(value, type);
            applicantDetails.forEach((applicant, applicantIdx) => {
              // ✅ Xử lý riêng cho "holdingDetails.address.postCode" và "holdingDetails.emailAddress"
              if (
                [
                  "holdingDetails.emailAddress",
                ].includes(key)
              ) {
                if (applicantIdx === 0) {
                  // ✅ Chỉ lấy từ applicant đầu tiên
                  let firstApplicantValue = getValueArray(
                    data,
                    mapping.target.replace("[index]", "[0]")
                  );
                  const type = Array.isArray(value)
                    ? "array"
                    : typeof firstApplicantValue;
                  result[key] = normalizeValue(firstApplicantValue, type);
                }
                return; // ✅ Không xử lý tiếp các applicant khác
              }
            });
          }
        }
      }
    } else {
      if (key.includes("isSupplied")) {
        const type = Array.isArray(value)
          ? "array"
          : typeof value;
        if (!key.includes("trustees") && !key.includes("beneficiaryDetails")) {
            const tfn3 = getValueArray(data, "super_fund_tfn");
            value = tfn3 !== null && tfn3 !== undefined;
            result[key.replace("[index]", `[0]`)] = normalizeValue(value, type);
        } else {
          applicantDetails.forEach((applicant, applicantIdx) => {
            const tfn4 = getValueArray(applicant, "tfn");
            value = tfn4 !== null && tfn4 !== undefined;
            if (key.includes("trustees[index]")) {
              replacedKey = key.replaceAll(
                "trustees[index]",
                `trustees[${applicantIdx}]`
              );
              result[replacedKey.replace("[index]", `[0]`)] = normalizeValue(
                value,
                type
              );
            } else if (key.includes("beneficiaryDetails[index]")) {
              replacedKey = key.replaceAll(
                "beneficiaryDetails[index]",
                `beneficiaryDetails[${applicantIdx}]`
              );
              if (applicantIdx >= 1) return;
              result[replacedKey.replace("[index]", `[0]`)] = normalizeValue(
                value,
                type
              );
            } else {
              result[key.replace("[index]", `[${applicantIdx}]`)] =
                normalizeValue(value, type);
            }
          });
        }
      } else if (key.includes("applicant.type")) {
        const smsf = getValueArray(data, "smsf");
        result[key] = smsf === true ? "self-managed-super-fund" : "super-fund";
      }
      else {
        continue;
      }
    }
  }
  return result;
};

module.exports = { processEquixData };
