// Các module chung
const { readJSONfile } = require("../../common/readJSONfile");
const { saveFile } = require("../../common/saveFile");
const { flattenObject, applyTypeCheck } = require("../base/processAusiexPro");
const { processEquixData } = require("../base/processEquixIndividual");
const { compareObjects } = require("../../common/PareObject");


// Import cấu hình
let auseixData = readJSONfile("../onboarding/individual/auseix.json");
let equixData = readJSONfile("../onboarding/individual/equix.json");
const { generateAddressLines } = require("../base/addressLines");


// Gọi hàm generateAddressLines và lưu kết quả vào holdingDetails_addressLines
let holdingDetails_addressLines = generateAddressLines(equixData);

// Thêm holdingDetails_addressLines vào equixData
equixData.holdingDetails_addressLines = holdingDetails_addressLines;

const fieldMappings = {
    "customerReferenceNumber": { target: "equix_id", type: "string" },
    "status": { type: "string", defaultValue: "draft" },
    "applicant.entityType": {
        target: "account_type",
        type: "string",
        enumMap: { INDIVIDUAL: "Individual" },
    },
    "applicant.person.title": {
        target: "applicant_details[index].title",
        type: "string",
        enumMap: { MR: "mr", MRS: "mrs", MS: "ms", MISS: "miss", DR: "dr", MSTR: "master" },
    },

    "applicant.person.firstName": {
        target: "applicant_details[index].first_name",
        type: "string",
    },
    //if "applicant_details.middle_name" = "" => don't send to AusieX
    "applicant.person.middleName": {
        target: "applicant_details[index].middle_name",
        type: ["string", null],
    },
    "applicant.person.lastName": {
        target: "applicant_details[index].last_name",
        type: "string",
    },
    "applicant.person.residentialAddress": {
        type: "object",
    },
    "applicant.person.residentialAddress.streetAddress": {
        target: [
            "applicant_details[index].residential_address_address_line_1",
            "applicant_details[index].residential_address_address_line_2"
        ],
        type: "string",
    },
    "applicant.person.residentialAddress.city": {
        target: "applicant_details[index].residential_address_city_suburb",
        type: "string",
    },
    "applicant.person.residentialAddress.region": {
        type: "object",
    },
    "applicant.person.residentialAddress.region.code": {
        target: "applicant_details[index].residential_address_state",
        type: "string",
    },
    "applicant.person.residentialAddress.postalCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: "string",
    },
    "applicant.person.residentialAddress.country": {
        type: "object",
    },
    "applicant.person.residentialAddress.country.code": {
        target: "applicant_details[index].residential_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.person.postalAddress": {
        type: "object",
    },
    "applicant.person.postalAddress.streetAddress": {
        target: [
            "applicant_details[index].postal_address_address_line_1",
            "applicant_details[index].postal_address_address_line_2"
        ],
        type: "string",

    },
    "applicant.person.postalAddress.city": {
        target: "applicant_details[index].postal_address_city_suburb",
        type: "string",
    },
    "applicant.person.postalAddress.region": {
        type: "object",
    },
    "applicant.person.postalAddress.region.code": {
        target: "applicant_details[index].postal_address_state",
        type: "string",
    },
    "applicant.person.postalAddress.postalCode": {
        target: "applicant_details[index].postal_address_postcode",
        type: "string",
    },
    "applicant.person.postalAddress.country": {
        type: "object",
    },
    "applicant.person.postalAddress.country.code": {
        target: "applicant_details[index].postal_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    // Maximum 1 Email Address
    "applicant.person.emailAddresses": {
        type: "array",
    },
    "applicant.person.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
    },
    "applicant.person.emailAddresses[index].value": {
        target: "applicant_details[index].applicant_email",
        type: "string",
    },
    "applicant.person.emailAddresses[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    // Maximum 4 Phone Numbers
    "applicant.person.phoneNumbers": {
        type: "array",
    },
    "applicant.person.phoneNumbers[index].type": {
        type: "string",
        defaultValue: "mobile",
    },
    // Format: {country code} + {area code} + phone number
    // Example: au|0412312312
    // => after converting: 61412312312
    "applicant.person.phoneNumbers[index].value": {
        target: "applicant_details[index].applicant_mobile_phone",
        type: "string",
    },
    "applicant.person.phoneNumbers[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    // Format: YYYY-MM-DD
    "applicant.person.dateOfBirth": {
        target: "applicant_details[index].dob",
        type: "string",
    },
    "applicant.person.gender": {
        target: "applicant_details[index].gender",
        type: "string",
        enumMap: { FEMALE: "female", MALE: "male", OTHER: "other" },
    },
    "applicant.person.nationalities": {
        type: "array",
    },
    "applicant.person.nationalities[index].country": {
        target: "applicant_details[index].nationality",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.person.nationalities[index].type": {
        type: "string",
        defaultValue: "citizen",
    },
    "applicant.employment": {
        type: "object",
    },
    "applicant.employment.type": {
        // target: "applicant_details[index].occupation_type",
        type: "string",
        defaultValue: "ICT Managers"
    },
    "applicant.employment.category": {
        // target: "applicant_details[index].occupation_category",
        type: "string",
        defaultValue: "Managers"
    },
    "applicant.taxDetails": {
        type: "array",
    },
    "applicant.taxDetails[index].country": {
        type: "string",
        defaultValue: "AU",
    },
    //'If applicant_details.tfn has value -> applicant.taxDetails.isSupplied = TRUE
    // Else, applicant.taxDetails.isSupplied = FALSE
    "applicant.taxDetails[index].isSupplied": {
        type: "boolean",
    },
    // Update applicant_details.tfn
    "applicant.taxDetails[index].taxIdentificationNumber": {
        target: "applicant_details[index].tfn",
        type: ["string", null],
    },
    // if applicant.taxDetails.isSupplied = FALSE -> send this field with default value
    "applicant.taxDetails[index].nonSupplyReasonCode": {
        type: ["string", null],
        defaultValue: "000000000",
    },
    "applicant.identityVerification": {
        type: "object",
    },
    "applicant.identityVerification.status": {
        type: "string",
        defaultValue: "verified",
    },
    // Get last_updated of document_file_name starting with "passKYCReport" of the first applicant
    // UTC : Format: "2019-08-24T14:15:22Z"
    "applicant.identityVerification.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.screeningResults": {
        type: "object",
    },
    "applicant.screeningResults.status": {
        type: "string",
        defaultValue: "verified",
    },
    // Get last_updated of document_file_name starting with "passKYCReport" of the first applicant
    // UTC : Format: "2019-08-24T14:15:22Z"
    "applicant.screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    // Update applicant.marketingOptedOut
    "applicant.marketingOptedOut": {
        type: "boolean",
        defaultValue: false,
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
    // Names must contain only letters, numbers, spaces, apostrophes, and hyphens.
    "settlement.details[index].accountName": {
        target: "bank_account_name",
        type: "string",
    },
    // The field must only contain numeric characters
    "settlement.details[index].branchCode": {
        target: "bank_bsb",
        type: "string",
    },
    // The field must only contain numeric characters
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
        defaultValue: "Direct_Entry_Account",
    },
    "settlement.nettingPolicy": {
        type: "string",
        defaultValue: "net",
    },
    // Update value settlement.holdFunds, required 
    "settlement.holdFunds": {
        type: ["boolean"],
        defaultValue: false
    },
    "settlement.redirectDividends": {
        type: ["boolean", null],
        defaultValue: true
    },
    adviser: {
        type: ["object", null],
    },
    "adviser.code": {
        // target: "advisor_code",
        defaultValue: "uatsentadv152",
        type: ["string", null],
    },
    // If application is created from onboarding, default tradeable_products.equity = BBJ
    "adviser.brokerageCode": {
        type: ["string", null],
        target: "tradeable_products.equity"
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
    // UTC : Format: "2019-08-24T14:15:22Z"
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
    // Get information from all applicants. (applicant_details.residential_address_address_line_1) Example: ["34 King Str", "106 HQV", "77 Walking Street"]
    "holdingDetails.address.addressLines": {
        target: "holdingDetails_addressLines",
        type: ["array", null],
    },
    // If account_type = INDIVIDUAL /JOINT: applicant_details.residential_address_postcode (1st applicant)
    "holdingDetails.address.postCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: ["string", null],
    },
    // If account_type = INDIVIDUAL / JOINT/ COMPANY/ TRUST_INDIVIDUAL/ SUPER_FUND_INDIVIDUAL: applicant_details.applicant_email (1st applicant)
    "holdingDetails.emailAddress": {
        target: "applicant_details[index].applicant_email",
        type: ["string", null],
    },
};

// Xử lý dữ liệu Auseix
const ausiexMapping = flattenObject(auseixData);
// console.log(JSON.stringify(ausiexMapping, null, 2));

const errorsType = applyTypeCheck(ausiexMapping, fieldMappings);
if (errorsType.length > 0) { console.log(errorsType); }

const key = "holdingDetails.address.addressLines";
ausiexMapping[key] = ausiexMapping[key]
    .map(str => str.trim())
    .join(", ");

// Xử lý dữ liệu Equix
const equixMapping = processEquixData(equixData, fieldMappings);
// console.log(JSON.stringify(equixMapping, null, 2));

equixMapping[key] = equixMapping[key].join(", ").trim();
// Duyệt qua tất cả các key trong equixMapping
Object.keys(equixMapping).forEach(key => {
    // Kiểm tra xem key có chứa "nonSupplyReasonCode" không
    if (key.includes("nonSupplyReasonCode")) {
        // Tìm key "isSupplied" tương ứng
        const isSuppliedKey = key.replace("nonSupplyReasonCode", "isSupplied");

        // Kiểm tra xem key "isSupplied" có tồn tại và có giá trị true không
        if (equixMapping[isSuppliedKey] === true) {
            // Nếu isSupplied là true, cập nhật nonSupplyReasonCode thành undefined
            equixMapping[key] = undefined;
        }
    }
});


const columnNames1 = {
    fieldName: "Field Name",
    compareValue: "Actual Value",
    expectedValue: "Expected Value",
    matchResult: "Match Result",
};

const columnNames2 = {
    FieldName1: "Field Name",
    Value1: "Actual Value",
    Value2: "Expected Value",
    MatchResult: "Match Result",
};

const resultTable = compareObjects(ausiexMapping, equixMapping, columnNames1);
const { loggerTable } = require("../../logger/loggerTable");
loggerTable(resultTable, columnNames2, [50, 50, 50, 20]);

// Ghi kết quả vào file CSV
const { Parser } = require("json2csv");
const content = new Parser().parse(resultTable);

saveFile(content, "../onboarding/individual/result.csv");
