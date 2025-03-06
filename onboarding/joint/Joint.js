// Các module chung
const { readJSONfile } = require("../../common/readJSONfile");
const { saveFile } = require("../../common/saveFile");
const { flattenObject, applyTypeCheck } = require("../base/processAusiexPro");
const { processEquixData } = require("../base/processEquixJoint");
const { compareObjects } = require("../../common/PareObject");


// Import cấu hình
let auseixData = readJSONfile("../onboarding/joint/auseix.json");
let equixData = readJSONfile("../onboarding/joint/equix.json");
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
        enumMap: { JOINT: "Joint" },
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
    "applicant.parties[index].employment": {
        type: "object",
    },
    "applicant.parties[index].employment.type": {
        // target: "applicant_details[index].occupation_type",
        type: "string",
        defaultValue: "ICT Managers"
    },
    "applicant.parties[index].employment.category": {
        // target: "applicant_details[index].occupation_category",
        type: "string",
        defaultValue: "Managers"
    },
    "applicant.parties[index].taxDetails": {
        type: "array",
    },
    "applicant.parties[index].taxDetails[index].country": {
        type: "string",
        defaultValue: "AU",
    },
    "applicant.parties[index].taxDetails[index].isSupplied": {
        type: "boolean",
    },
    "applicant.parties[index].taxDetails[index].taxIdentificationNumber": {
        target: "super_fund_tfn",
        type: ["string", null],
    },
    "applicant.parties[index].taxDetails[index].nonSupplyReasonCode": {
        type: "string",
        defaultValue: "000000000",
    },
    "applicant.parties[index].identityVerification": {
        type: "object",
    },
    "applicant.parties[index].identityVerification.status": {
        type: "string",
        defaultValue: "verified",
    },
    "applicant.parties[index].identityVerification.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.parties[index].screeningResults": {
        type: "object",
    },
    "applicant.parties[index].screeningResults.status": {
        type: "string",
        defaultValue: "verified",
    },
    "applicant.parties[index].screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
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
        defaultValue: "Direct_Entry_Account",
    },
    "settlement.nettingPolicy": {
        type: "string",
        defaultValue: "net",
    },
    "settlement.holdFunds": {
        type: ["boolean", null]
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

// Xử lý dữ liệu Auseix
const ausiexMapping = flattenObject(auseixData);
// console.log(JSON.stringify(ausiexMapping, null, 2));

const errorsType = applyTypeCheck(ausiexMapping, fieldMappings);
if (errorsType.length > 0) { console.log(errorsType); }

const key = "holdingDetails.address.addressLines";
ausiexMapping[key] = ausiexMapping[key].join(", ");
// Xử lý dữ liệu Equix
const equixMapping = processEquixData(equixData, fieldMappings);
// console.log(JSON.stringify(equixMapping, null, 2));
equixMapping[key] = equixMapping[key].join(", ");
const key2 = "holdingDetails.hin";
equixMapping[key2] = equixMapping[key2] !== null ? String(equixMapping[key2]) : equixMapping[key2];

const columnNames1 = {
    fieldName: "Field Name",
    compareValue: "Auseix Value",
    expectedValue: "Equix Value",
    matchResult: "Match Result",
};

const columnNames2 = {
    FieldName1: "Field Name",
    Value1: "Auseix Value",
    Value2: "Equix Value",
    MatchResult: "Match Result",
};

const resultTable = compareObjects(ausiexMapping, equixMapping, columnNames1);
const { loggerTable } = require("../../logger/loggerTable");
loggerTable(resultTable, columnNames2, [50, 50, 50, 10]);

// Ghi kết quả vào file CSV
const { Parser } = require("json2csv");
const content = new Parser().parse(resultTable);

saveFile(content, "../onboarding/joint/result.csv");
