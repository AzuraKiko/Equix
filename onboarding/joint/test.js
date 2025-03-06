const fs = require("fs");
const path = require("path");

const equixData = JSON.parse(fs.readFileSync(path.join(__dirname, "equix.json")));
const mappings = {
    "customerReferenceNumber": { target: "equix_id", type: "string" },
    "applicant.entityType": {
        target: "account_type",
        type: "string",
        enumMap: { JOINT: "joint" },
    },
    "applicant.parties[index].person.title": {
        target: "applicant_details[index].title",
        type: "string",
        enumMap: { MR: "mr", MRS: "mrs", MS: "ms", MISS: "miss" },
    },

    "applicant.parties[index].person.firstName": {
        target: "applicant_details[index].first_name",
        type: "string",
    },
    "applicant.parties[index].person.middleName": {
        target: "applicant_details[index].middle_name",
        type: ["string", null],
    },
    "applicant.parties[index].person.lastName": {
        target: "applicant_details[index].last_name",
        type: "string",
    },
    "applicant.parties[index].person.residentialAddress": {
        type: "object",
    },
    "applicant.parties[index].person.residentialAddress.streetAddress": {
        target: [
            "applicant_details[index].residential_address_address_line_1",
            "applicant_details[index].residential_address_address_line_2"
        ],
        type: "string",
    },
    "applicant.parties[index].person.residentialAddress.city": {
        target: "applicant_details[index].residential_address_city_suburb",
        type: "string",
    },
    "applicant.parties[index].person.residentialAddress.region": {
        type: "object",
    },
    "applicant.parties[index].person.residentialAddress.region.code": {
        target: "applicant_details[index].residential_address_state",
        type: "string",
    },
    "applicant.parties[index].person.residentialAddress.postalCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: "string",
    },
    "applicant.parties[index].person.residentialAddress.country": {
        type: "object",
    },
    "applicant.parties[index].person.residentialAddress.country.code": {
        target: "applicant_details[index].residential_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.parties[index].person.postalAddress": {
        type: "object",
    },
    "applicant.parties[index].person.postalAddress.streetAddress": {
        target: [
            "applicant_details[index].postal_address_address_line_1",
            "applicant_details[index].postal_address_address_line_2"
        ],
        type: "string",

    },
    "applicant.parties[index].person.postalAddress.city": {
        target: "applicant_details[index].postal_address_city_suburb",
        type: "string",
    },
    "applicant.parties[index].person.postalAddress.region": {
        type: "object",
    },
    "applicant.parties[index].person.postalAddress.region.code": {
        target: "applicant_details[index].postal_address_state",
        type: "string",
    },
    "applicant.parties[index].person.postalAddress.postalCode": {
        target: "applicant_details[index].postal_address_postcode",
        type: "string",
    },
    "applicant.parties[index].person.postalAddress.country": {
        type: "object",
    },
    "applicant.parties[index].person.postalAddress.country.code": {
        target: "applicant_details[index].postal_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.parties[index].person.emailAddresses": {
        type: "array",
    },
    "applicant.parties[index].person.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
    },
    "applicant.parties[index].person.emailAddresses[index].value": {
        target: "applicant_details[index].applicant_email",
        type: "string",
    },
    "applicant.parties[index].person.emailAddresses[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    "applicant.parties[index].person.phoneNumbers": {
        type: "array",
    },
    "applicant.parties[index].person.phoneNumbers[index].type": {
        type: "string",
        defaultValue: "mobile",
    },
    "applicant.parties[index].person.phoneNumbers[index].value": {
        target: "applicant_details[index].applicant_mobile_phone",
        type: "string",
    },
    "applicant.parties[index].person.phoneNumbers[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    "applicant.parties[index].person.dateOfBirth": {
        target: "applicant_details[index].dob",
        type: "string",
    },
    "applicant.parties[index].person.gender": {
        target: "applicant_details[index].gender",
        type: "string",
        enumMap: { FEMALE: "female", MALE: "male", OTHER: "other" },
    },
    "applicant.parties[index].person.nationalities": {
        type: "array",
    },
    "applicant.parties[index].person.nationalities[index].country": {
        target: "applicant_details[index].nationality",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.parties[index].person.nationalities[index].type": {
        type: "string",
        defaultValue: "citizen",
    },
    "applicant.employment": {
        type: "object",
    },
    "applicant.employment.type": {
        target: "applicant_details[index].occupation_type",
        type: "string",
    },
    "applicant.employment.category": {
        target: "applicant_details[index].occupation_category",
        type: "string",
    },
    "applicant.taxDetails": {
        type: "array",
    },
    "applicant.taxDetails[index].country": {
        type: "string",
        defaultValue: "AU",
    },
    "applicant.taxDetails[index].isSupplied": {
        type: "boolean",
        defaultValue: false,
    },
    "applicant.taxDetails[index].taxIdentificationNumber": {
        type: ["string", null],
    },
    "applicant.taxDetails[index].nonSupplyReasonCode": {
        type: "string",
        defaultValue: "000000000",
    },
    "applicant.identityVerification": {
        type: "object",
    },
    "applicant.identityVerification.status": {
        type: "string",
        defaultValue: "verified",
    },
    "applicant.identityVerification.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.identityVerification.agentName": {
        type: ["string", null],
    },
    "applicant.screeningResults": {
        type: "object",
    },
    "applicant.screeningResults.status": {
        type: "string",
        defaultValue: "verified",
    },
    "applicant.screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.screeningResults.agentName": {
        type: ["string", null],
    },
    tradingProduct: {
        type: "object",
    },
    "tradingProduct.type": {
        type: "string",
        defaultValue: "domestic-equities",
    },
    "tradingProduct.canTradeWarrants": {
        type: "boolean",
        defaultValue: true,
    },
    "tradingProduct.contractNote": {
        type: "object",
    },
    "tradingProduct.contractNote.type": {
        type: "string",
        defaultValue: "digital",
    },
    "tradingProduct.contractNote.generationType": {
        type: "string",
        defaultValue: "day",
    },
    settlement: {
        type: "object",
    },
    "settlement.details": {
        type: "array",
    },
    "settlement.details[index].accountName": {
        target: "bank_account_name",
        type: "string",
    },
    "settlement.details[index].branchCode": {
        target: "bank_bsb",
        type: "string",
    },
    "settlement.details[index].accountNumber": {
        target: "bank_account_number",
        type: "string",
    },
    "settlement.details[index].usedForCredits": {
        type: "boolean",
        defaultValue: true,
    },
    "settlement.details[index].usedForDebits": {
        type: "boolean",
        defaultValue: true,
    },
    "settlement.details[index].usedForDividends": {
        type: "boolean",
        defaultValue: true,
    },
    "settlement.details[index].type": {
        type: "string",
        defaultValue: "direct-entry",
    },
    "settlement.nettingPolicy": {
        type: "string",
        defaultValue: "net",
    },
    "settlement.holdFunds": {
        type: ["boolean", null]
    },
    "settlement.redirectDividends": {
        type: ["boolean", null]
    },
    adviser: {
        type: ["object", null],
    },
    "adviser.code": {
        target: "advisor_code",
        type: ["string", null],
    },
    "adviser.brokerageCode": {
        type: ["string", null]
    },
    termsAndConditions: {
        type: "object",
    },
    "termsAndConditions.accepted": {
        type: "boolean",
        defaultValue: true,
    },
    "termsAndConditions.methodOfAcceptance": {
        type: "string",
        defaultValue: "digital",
    },
    "termsAndConditions.timestamp": {
        target: "submit_time",
        type: "string",
    },
    holdingDetails: {
        type: ["object", null],
    },
    "holdingDetails.hin": {
        target: "settlement_existing_hin",
        type: ["string", null],
    },
    "holdingDetails.pid": {
        target: "settlement_pid",
        type: ["string", null],
    },
    "holdingDetails.address": {
        type: ["object", null],
    },
    "holdingDetails.address.addressLines": {
        target: "holdingDetails_addressLines",
        type: ["array", null],
    },
    "holdingDetails.address.postCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: ["string", null],
    },
    "holdingDetails.emailAddress": {
        target: "applicant_details[index].applicant_email",
        type: ["string", null],
    },
};


const getValueFromEquix = (key, index = null) => {
    const keys = key.split(".");
    let value = equixData;
    for (const k of keys) {
        if (Array.isArray(value) && index !== null) {
            value = value[index];
        }
        if (value && typeof value === "object" && k in value) {
            value = value[k];
        } else {
            return null;
        }
    }
    return value;
};

const buildNestedObject = (path, value, obj) => {
    const keys = path.split(".");
    let current = obj;
    while (keys.length > 1) {
        const key = keys.shift();
        if (!current[key]) {
            current[key] = isNaN(keys[0]) ? {} : [];
        }
        current = current[key];
    }
    current[keys[0]] = value;
};

const processMapping = (mappings) => {
    let result = {
        applicant: { parties: [] },
        settlement: { details: [] },
        tradingProduct: {},
        termsAndConditions: {},
    };
    
    const applicantDetails = getValueFromEquix("applicant_details") || [];
    console.log("DEBUG - applicant_details source:", JSON.stringify(applicantDetails, null, 2));
    
    if (Array.isArray(applicantDetails) && applicantDetails.length > 0) {
        applicantDetails.forEach(() => result.applicant.parties.push({ person: {} }));
    }
    result.settlement.details.push({});
    
    for (const key in mappings) {
        const mapping = mappings[key];
        let value = null;
        
        if (key.includes("[index]")) {
            const baseKey = key.split("[index]")[0];
            const nestedArray = getValueFromEquix(baseKey) || [];
            nestedArray.forEach((_, idx) => {
                let newKey = key.replace("[index]", "");
                let mappedValue = null;
                if (Array.isArray(mapping.target)) {
                    mappedValue = mapping.target.map(t => getValueFromEquix(t, idx)).find(v => v !== null);
                } else if (mapping.target) {
                    mappedValue = getValueFromEquix(mapping.target, idx);
                }
                if (mappedValue === null && "defaultValue" in mapping) {
                    mappedValue = mapping.defaultValue;
                }
                if (mappedValue !== null) {
                    if (baseKey.includes("applicant_details")) {
                        buildNestedObject(newKey.replace("applicant_details.", ""), mappedValue, result.applicant.parties[idx].person);
                    } else if (baseKey.includes("settlement.details")) {
                        buildNestedObject(newKey.replace("settlement.details.", ""), mappedValue, result.settlement.details[idx]);
                    }
                }
            });
        } else {
            if (Array.isArray(mapping.target)) {
                value = mapping.target.map(t => getValueFromEquix(t)).find(v => v !== null);
            } else if (mapping.target) {
                value = getValueFromEquix(mapping.target);
            }
            if (value === null && "defaultValue" in mapping) {
                value = mapping.defaultValue;
            }
            if (value !== null) {
                if (key.startsWith("applicant.parties")) {
                    result.applicant.parties.forEach((party, idx) => {
                        buildNestedObject(key.replace("applicant.parties[index].", ""), value, party.person);
                    });
                } else if (key.startsWith("settlement.details")) {
                    buildNestedObject(key.replace("settlement.details.", ""), value, result.settlement.details[0]);
                } else if (key.startsWith("tradingProduct.")) {
                    buildNestedObject(key.replace("tradingProduct.", ""), value, result.tradingProduct);
                } else if (key.startsWith("termsAndConditions.")) {
                    buildNestedObject(key.replace("termsAndConditions.", ""), value, result.termsAndConditions);
                } else {
                    buildNestedObject(key, value, result);
                }
            }
        }
    }

    console.log("DEBUG - Final applicant.parties after mapping:", JSON.stringify(result.applicant.parties, null, 2));

    return result;
};

const auseixFormattedData = processMapping(mappings);
console.log(JSON.stringify(auseixFormattedData, null, 2));
