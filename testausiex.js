const { getValueArray } = require("./common/getValue");
const processAuseixData = (data, mappings) => {
    let result = {};
    let errors = [];

    for (const key in mappings) {
        const mapping = mappings[key];
        if (!mapping.target && !mapping.defaultValue) continue; // Bỏ qua nếu không có `target`

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
                            actualType = "array"; // ✅ Gán kiểu chính xác cho mảng
                        } else {
                            actualType = typeof value;
                        }

                        if (!mapping.type.includes(actualType)) {
                            errors.push({
                                AuseixKey: key.replace("[index]", `[${idx}]`),
                                Value: value,
                                ActualType: actualType,
                                ExpectedType: mapping.type,
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
                    actualType = "array"; // ✅ Gán kiểu chính xác cho mảng
                } else {
                    actualType = typeof value;
                }

                if (!mapping.type.includes(actualType)) {
                    errors.push({
                        AuseixKey: key, // ✅ Không sử dụng idx ở đây
                        Value: value,
                        ActualType: actualType,
                        ExpectedType: mapping.type,
                    });
                }
            }
        }
    }
    console.table(errors);
    return result;
};


const auseixData = {
    "customerReferenceNumber": "EQ-EQ-898-644-161-R",
    "status": "draft",
    "applicant": {
      "person": {
        "title": "ms",
        "firstName": "Van",
        "lastName": "Anh",
        "residentialAddress": {
          "streetAddress": "Unit 10 Melbourne Road ",
          "city": "YEA",
          "region": { "code": "VIC" },
          "postalCode": "3717",
          "country": { "code": "AU" }
        },
        "postalAddress": {
          "streetAddress": "Unit 10 Melbourne Road ",
          "city": "YEA",
          "region": { "code": "VIC" },
          "postalCode": "3717",
          "country": { "code": "AU" }
        },
        "emailAddresses": [
          {
            "type": "work",
            "value": "vanan14324532513r3r6@gmail.com",
            "isPreferred": true
          }
        ],
        "phoneNumbers": [
          { "type": "mobile", "value": "61412453265", "isPreferred": true }
        ],
        "dateOfBirth": "1997-05-08",
        "gender": "female",
        "nationalities": [{ "country": "AU", "type": "citizen" }]
      },
      "employment": { "category": "Managers", "type": "ICT Managers" },
      "marketingOptedOut": false,
      "identityVerification": {
        "status": "verified",
        "completionTimestamp": "2025-02-20T03:39:46.074Z"
      },
      "screeningResults": {
        "status": "verified",
        "completionTimestamp": "2025-02-20T03:39:46.074Z"
      },
      "taxDetails": [
        {
          "country": "AU",
          "isSupplied": false,
          "nonSupplyReasonCode": "000000000"
        }
      ],
      "entityType": "Individual"
    },
    "tradingProduct": {
      "type": "domestic-equities",
      "canTradeWarrants": true,
      "contractNote": { "type": "digital", "generationType": "day" }
    },
    "termsAndConditions": {
      "accepted": true,
      "methodOfAcceptance": "digital",
      "timestamp": "2025-02-19T09:01:17.425Z"
    },
    "settlement": {
      "details": [
        {
          "accountName": "Van Anh Dao",
          "branchCode": "654321",
          "accountNumber": "12345678",
          "usedForCredits": true,
          "usedForDebits": true,
          "usedForDividends": true,
          "type": "Direct_Entry_Account"
        }
      ],
      "nettingPolicy": "net",
      "holdFunds": false,
      "redirectDividends": false
    },
    "adviser": { "code": "uatsentadv152", "brokerageCode": "AAB" },
    "holdingDetails": {
      "hin": "567894123",
      "pid": "06382",
      "address": { "addressLines": ["5678 Elm St"], "postCode": "2001" },
      "emailAddress": "info@bartell.com.au"
    }
  }
  

const fieldMappings = require("./onboarding/base/mapIndividual").fieldMappings;
const auseixMapping = processAuseixData(auseixData, fieldMappings);
console.log(auseixMapping);