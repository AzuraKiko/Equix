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
    "applicant.entityType": {
        target: "account_type",
        type: "string",
        enumMap: { Individual: "INDIVIDUAL" },
    },
    "applicant.registeredName": {
        target: "company_name",
        type: "string",
    },
    "applicant.businessDetails.companyType": {
        target: "company_type",
        type: "string",
        enumMap: { proprietary: "PROPRIETARY" },
    },
    "applicant.businessDetails.abn": {
        target: "company_abn",
        type: ["string", null],
    },
    "applicant.businessDetails.acn": {
        target: "company_acn",
        type: "string",
    },
    //47-91 
    "applicant.businessDetails.officeHolders[index].entityType": {

        type: "string",
        defaultValue: "Individual",
    },

    "applicant.businessDetails.officeHolders[index].person.title": {
        target: "applicant_details[index].title",
        type: "string",
        enumMap: { mr: "MR", mrs: "MRS", ms: "MS", miss: "MISS" },
    },

    "applicant.businessDetails.officeHolders[index].person.firstName": {
        target: "applicant_details[index].first_name",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].person.middleName": {
        target: "applicant_details[index].middle_name",
        type: ["string", null],
    },
    "applicant.businessDetails.officeHolders[index].person.lastName": {
        target: "applicant_details[index].last_name",
        type: "string",
    },

    "applicant.businessDetails.officeHolders[index].person.residentialAddress.streetAddress": {
        target: [
            "applicant_details[index].residential_address_address_line_1",
            "applicant_details[index].residential_address_address_line_2"
        ],
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].person.residentialAddress.city": {
        target: "applicant_details[index].residential_address_city_suburb",
        type: "string",
    },

    "applicant.businessDetails.officeHolders[index].person.residentialAddress.region.code": {
        target: "applicant_details[index].residential_address_state",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].person.residentialAddress.postalCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: "string",
    },

    "applicant.businessDetails.officeHolders[index].person.residentialAddress.country.code": {
        target: "applicant_details[index].residential_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.person.postalAddress": {
        type: "object",
    },
    "applicant.businessDetails.officeHolders[index].person.postalAddress.streetAddress": {
        target: [
            "applicant_details[index].postal_address_address_line_1",
            "applicant_details[index].postal_address_address_line_2"
        ],
        type: "string",

    },
    "applicant.businessDetails.officeHolders[index].person.postalAddress.city": {
        target: "applicant_details[index].postal_address_city_suburb",
        type: "string",
    },

    "applicant.businessDetails.officeHolders[index].person.postalAddress.region.code": {
        target: "applicant_details[index].postal_address_state",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].person.postalAddress.postalCode": {
        target: "applicant_details[index].postal_address_postcode",
        type: "string",
    },

    "applicant.businessDetails.officeHolders[index].person.postalAddress.country.code": {
        target: "applicant_details[index].postal_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },

    "applicant.businessDetails.officeHolders[index].person.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
    },
    "applicant.businessDetails.officeHolders[index].person.emailAddresses[index].value": {
        target: "applicant_details[index].applicant_email",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].person.emailAddresses[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },

    "applicant.businessDetails.officeHolders[index].person.phoneNumbers[index].type": {
        type: "string",
        defaultValue: "mobile",
    },
    "applicant.businessDetails.officeHolders[index].person.phoneNumbers[index].value": {
        target: "applicant_details[index].applicant_mobile_phone",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].person.phoneNumbers[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },

    "applicant.businessDetails.officeHolders[index].person.gender": {
        target: "applicant_details[index].gender",
        type: "string",
        enumMap: { male: "MALE", female: "FEMALE", other: "OTHER" },
    },

    "applicant.businessDetails.officeHolders[index].person.nationalities[index].country": {
        target: "applicant_details[index].nationality",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].person.nationalities[index].type": {
        type: "string",
        defaultValue: "citizen",
    },

    //91-116 
    "applicant.businessDetails.officeHolders[index].employment.category": {
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].employment.type": {
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].taxDetails[index].country": {
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].taxDetails[index].isSupplied": {
        type: "boolean",
    },
    "applicant.businessDetails.officeHolders[index].taxDetails[index].taxIdentificationNumber": {
        target: "applicant_details[index].tfn",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].taxDetails[index].nonSupplyReasonCode": {
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].identityVerification.status": {
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].identityVerification.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].screeningResults.status": {
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].screeningResults.agentName": {
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].role": {
        target: "applicant_details[index].role_in_company",
        type: "string",
    },
    "applicant.businessDetails.officeHolders[index].isBeneficialOwner": {

        type: "boolean",
    },
    "applicant.businessDetails.officeHolders[index].isSignatory": {
        type: "boolean",
    },

    //119-162 
    "applicant.businessDetails.beneficialOwners[index].entityType": {
        type: "string",
        defaultValue: "Individual",
    },
    "applicant.businessDetails.beneficialOwners[index].person.title": {
        target: "applicant_details[index].title",
        type: "string",
        enumMap: { mr: "MR", mrs: "MRS", ms: "MS", miss: "MISS" },
    },
    "applicant.businessDetails.beneficialOwners[index].person.firstName": {
        target: "applicant_details[index].first_name",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.middleName": {
        target: "applicant_details[index].middle_name",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.lastName": {
        target: "applicant_details[index].last_name",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.residentialAddress.streetAddress": {
        target: [
            "applicant_details[index].postal_address_address_line_1",
            "applicant_details[index].postal_address_address_line_2"
        ],
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.residentialAddress.city": {
        target: "applicant_details[index].residential_address_city_suburb",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.residentialAddress.region.code": {
        target: "applicant_details[index].residential_address_state",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.residentialAddress.postalCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.residentialAddress.country.code": {
        target: "applicant_details[index].residential_address_country",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.postalAddress.streetAddress": {
        target: [
            "applicant_details[index].postal_address_address_line_1",
            "applicant_details[index].postal_address_address_line_2"
        ],
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.postalAddress.city": {
        target: "applicant_details[index].postal_address_city_suburb",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.postalAddress.region.code": {
        target: "applicant_details[index].postal_address_state",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.postalAddress.region.code": {
        target: "applicant_details[index].postal_address_state",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.postalAddress.postalCode": {
        target: "applicant_details[index].postal_address_postcode",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.postalAddress.country.code": {
        target: "applicant_details[index].postal_address_country",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
    },
    "applicant.businessDetails.beneficialOwners[index].person.emailAddresses[index].value": {
        target: "applicant_details[index].applicant_email",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.emailAddresses[index].isPreferred": {
        type: "boolean",
    },
    "applicant.businessDetails.beneficialOwners[index].person.phoneNumbers[index].type": {
        type: "string",
        defaultValue: "mobile",
    },
    "applicant.businessDetails.beneficialOwners[index].person.phoneNumbers[index].value": {
        target: "applicant_details[index].applicant_mobile_phone",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.phoneNumbers[index].isPreferred": {

        type: "boolean",

    },
    "applicant.businessDetails.beneficialOwners[index].person.gender": {
        target: "applicant_details[index].gender",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.nationalities[index].country": {
        target: "applicant_details[index].nationality",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].person.nationalities[index].type": {

        type: "string",
        defaultValue: "citizen",
    },

    //164-178
    "applicant.businessDetails.beneficialOwners[index].employment.category": {

        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].employment.type": {
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].taxDetails[index].country": {
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].taxDetails[index].isSupplied": {
        type: "boolean",
    },
    "applicant.businessDetails.beneficialOwners[index].taxDetails[index].taxIdentificationNumber": {
        target: "applicant_details[index].tfn",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].identityVerification.status": {
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].identityVerification.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].screeningResults.status": {
        type: "string",
    },
    "applicant.businessDetails.beneficialOwners[index].screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },

    "applicant.businessDetails.taxDetails[index].country": {
        type: "string",
    },
    "applicant.businessDetails.taxDetails[index].isSupplied": {
        type: "boolean",
    },
    "applicant.businessDetails.taxDetails[index].taxIdentificationNumber": {
        target: "company_tfn",
        type: "string",
    },
    "applicant.businessDetails.taxDetails[index].nonSupplyReasonCode": {
        type: "string",
    },
    "applicant.businessDetails.registeredAddress.streetAddress": {
        target: [
            "company_registered_office_address_address_line_1",
            "company_registered_office_address_address_line_2"
        ],
        type: "string",

    },
    "applicant.businessDetails.registeredAddress.city": {
        target: "company_registered_office_address_city_suburb",
        type: "string",
    },
    "applicant.businessDetails.registeredAddress.region.code": {
        target: "company_registered_office_address_state",
        type: "string",
    },
    "applicant.businessDetails.registeredAddress.postalCode": {
        target: "company_registered_office_address_postcode",
        type: "string",
    },
    "applicant.businessDetails.registeredAddress.country.code": {
        target: "company_registered_office_address_country",
        type: "string",
    },
    "applicant.businessDetails.principalAddress.streetAddress": {
        target: [
            "company_principal_place_of_business_address_address_line_1",
            "company_principal_place_of_business_address_address_line_2"
        ],
        type: "string",

    },
    "applicant.businessDetails.principalAddress.city": {
        target: "company_principal_place_of_business_address_city_suburb",
        type: "string",

    },
    "applicant.businessDetails.principalAddress.region.code": {
        target: "company_principal_place_of_business_address_state",
        type: "string",

    },
    "applicant.businessDetails.principalAddress.postalCode": {
        target: "company_principal_place_of_business_address_postcode",
        type: "string",
    },
    "applicant.businessDetails.principalAddress.country.code": {
        target: "company_principal_place_of_business_address_country",
        type: "string",

    },
    "applicant.businessDetails.postalAddress.streetAddress": {
        target: [
            "company_registered_office_address_address_line_1",
            "company_registered_office_address_address_line_2"
        ],
        type: "string",

    },
    "applicant.businessDetails.postalAddress.city": {
        target: "company_registered_office_address_city_suburb",
        type: "string",
    },
    "applicant.businessDetails.postalAddress.region.code": {
        target: "company_registered_office_address_state",
        type: "string",

    },
    "applicant.businessDetails.postalAddress.postalCode": {
        target: "company_registered_office_address_postcode",
        type: "string",

    },
    "applicant.businessDetails.postalAddress.country.code": {
        target: "company_registered_office_address_country",
        type: "string",

    },
    "applicant.businessDetails.emailAddress": {
        target: "company_email",
        type: "string",

    },
    "applicant.businessDetails.phoneNumber": {
        target: "company_mobile_phone",
        type: "string",
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

        type: "string",

    },
    "tradingProduct.contractNote.type": {

        type: "string",
        defaultValue: "digital",
    },
    "tradingProduct.contractNote.generationType": {

        type: "string",
        defaultValue: "day",
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
        defaultValue: "TRUE",
    },
    "settlement.details[index].usedForDebits": {

        type: "boolean",
        defaultValue: "TRUE",
    },
    "settlement.details[index].usedForDividends": {

        type: "boolean",
        defaultValue: "TRUE",
    },
    "settlement.details[index].type": {

        type: "string",
        defaultValue: "dirct-entry",
    },
    "settlement.nettingPolicy": {

        type: "string",

    },
    "settlement.holdFunds": {

        type: "boolean",

    },
    "settlement.redirectDividends": {
        type: "boolean",
        defaultValue: true,
    },

    "adviser.code": {
        target: "advisor_code",
        type: "string",

    },
    "adviser.brokerageCode": {
        target: "tradeable_products.equity",
        type: "string",

    },

    "termsAndConditions.accepted": {

        type: "boolean",

    },
    "termsAndConditions.methodOfAcceptance": {

        type: "string",

    },
    "termsAndConditions.timestamp": {
        target: "submit_time",
        type: "string",

    },

    "holdingDetails.hin": {
        target: "settlement_existing_hin",
        type: "string",

    },
    "holdingDetails.pid": {
        target: "settlement_pid",
        type: "string",

    },

    "holdingDetails.address.addressLines": {
        target: "holdingDetails_addressLines",
        type: "array",

    },
    "holdingDetails.address.postCode": {
        target: "company_registered_office_address_postcode",
        type: "string",

    },
    "holdingDetails.emailAddress": {
        target: "applicant_details[0].applicant_email",
        type: "string",

    },
    "applicant.person.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
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
console.log(JSON.stringify(equixMapping, null, 2));

equixMapping[key] = equixMapping[key]
    .map(str => str.trim()) // Trim khoảng trắng của từng phần tử
    .join(", ");
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
