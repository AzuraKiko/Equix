// Các module chung
const { readJSONfile } = require("../../common/readJSONfile");
const { saveFile } = require("../../common/saveFile");
const { flattenObject, applyTypeCheck } = require("../base/processAusiexPro");
const { processEquixData } = require("../base/processEquixTrust");
const { compareObjects } = require("../../common/PareObject");

// Import cấu hình
let auseixData = readJSONfile("../onboarding/trust/auseix.json");
let equixData = readJSONfile("../onboarding/trust/equix.json");
const { generateAddressLines } = require("../base/addressLines");

// Gọi hàm generateAddressLines và lưu kết quả vào holdingDetails_addressLines
let holdingDetails_addressLines = generateAddressLines(equixData);

// Thêm holdingDetails_addressLines vào equixData
equixData.holdingDetails_addressLines = holdingDetails_addressLines;

const fieldMappings = {
    customerReferenceNumber: { target: "equix_id", type: "string" },
    status: { type: "string", defaultValue: "draft" },
    "applicant.entityType": {
        target: "account_type",
        type: "string",
        enumMap: { TRUST_INDIVIDUAL: "Trust" },
    },
    "applicant.industryClassification": {
        type: "object",
    },
    "applicant.industryClassification.categoryCode": {
        // target: "super_fund_industry",
        type: "string",
        defaultValue: "A"
    },
    "applicant.industryClassification.typeCode": {
        type: "string",
        defaultValue: "01"
    },
    "applicant.establishmentLocation": {
        target: "trust_country_of_establishment",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.name": {
        target: "trust_name",
        type: "string",
    },
    "applicant.type": {
        target: "trust_description",
        type: "string",
        enumMap: {
            FAMILY_TRUST: "family",
            CHARITABLE_TRUST: "charity",
            DECEASED_ESTATE: "deceased-estate",
            DISCRETIONARY_INVESMENT_TRUST: "discretionary",
            TESTAMENTARY_TRUST: "testamentary",
            UNIT_TRUST: "other",
            DISABILITY_TRUST: "other",
            PROPERTY_TRUST: "other",
            HYBRID_TRUST: "other",
            TRADING_TRUST: "other",
        },
    },
    // Nếu applicant.type là "other" thì sẽ có 1 field khác là "otherTrustType" để nhập loại trust khác
    // This is required if the type is other. Sent to Ausiex if applicant.type = "other"
    "applicant.otherTrustType": {
        target: "trust_description",
        type: ["string", null],
        enumMap: {
            UNIT_TRUST: "UNIT TRUST",
            DISABILITY_TRUST: "DISABILITY TRUST",
            PROPERTY_TRUST: "PROPERTY TRUST",
            HYBRID_TRUST: "HYBRID TRUST",
            TRADING_TRUST: "TRADING TRUST",
        },
    },
    "applicant.accountDesignation": {
        target: "account_designation",
        type: ["string", null],
    },
    // Maximum 1 Email Address
    "applicant.emailAddresses": {
        type: "array",
    },
    "applicant.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
    },
    // Get applicant_details.applicant_email of first applicant
    "applicant.emailAddresses[index].value": {
        target: "applicant_details[index].applicant_email",
        type: "string",
    },
    "applicant.emailAddresses[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    "applicant.abn": {
        target: "trust_abn",
        type: ["string", null],
    },
    "applicant.governedByTrustDeed": {
        type: "boolean",
        defaultValue: true,
    },
    "applicant.registeredAddress": {
        type: "object",
    },
    "applicant.registeredAddress.streetAddress": {
        target: ["trust_address_address_line_1", "trust_address_address_line_2"],
        type: "string",
    },
    "applicant.registeredAddress.city": {
        target: "trust_address_city_suburb",
        type: "string",
    },
    "applicant.registeredAddress.region": {
        type: "object",
    },
    "applicant.registeredAddress.region.code": {
        target: "trust_address_state",
        type: "string",
    },
    "applicant.registeredAddress.postalCode": {
        target: "trust_address_postcode",
        type: "string",
    },
    "applicant.registeredAddress.country": {
        type: "object",
    },
    "applicant.registeredAddress.country.code": {
        target: "trust_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.postalAddress": {
        type: "object",
    },
    "applicant.postalAddress.streetAddress": {
        target: [
            "mailing_address_address_line_1",
            "mailing_address_address_line_2",
        ],
        type: "string",
    },
    "applicant.postalAddress.city": {
        target: "mailing_address_city_suburb",
        type: "string",
    },
    "applicant.postalAddress.region": {
        type: "object",
    },
    "applicant.postalAddress.region.code": {
        target: "mailing_address_state",
        type: "string",
    },
    "applicant.postalAddress.postalCode": {
        target: "mailing_address_postcode",
        type: "string",
    },
    "applicant.postalAddress.country": {
        type: "object",
    },
    "applicant.postalAddress.country.code": {
        target: "mailing_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.trustees": {
        type: "array",
    },
    "applicant.trustees[index].identityVerification": {
        type: "object",
    },
    "applicant.trustees[index].identityVerification.status": {
        type: "string",
        defaultValue: "verified",
    },
    // Get last_updated of document_file_name starting with "passKYCReport"
    "applicant.trustees[index].identityVerification.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.trustees[index].screeningResults": {
        type: "object",
    },
    "applicant.trustees[index].screeningResults.status": {
        type: "string",
        defaultValue: "verified",
    },
    // Get last_updated of document_file_name starting with "passKYCReport"
    "applicant.trustees[index].screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.trustees[index].entityType": {
        type: "string",
        defaultValue: "Individual",
    },
    "applicant.trustees[index].person": {
        type: "object",
    },
    "applicant.trustees[index].person.title": {
        target: "applicant_details[index].title",
        type: "string",
        enumMap: { MR: "mr", MRS: "mrs", MS: "ms", MISS: "miss", DR: "dr", MSTR: "master" },
    },
    "applicant.trustees[index].person.firstName": {
        target: "applicant_details[index].first_name",
        type: "string",
    },
    "applicant.trustees[index].person.middleName": {
        target: "applicant_details[index].middle_name",
        type: ["string", null],
    },
    "applicant.trustees[index].person.lastName": {
        target: "applicant_details[index].last_name",
        type: "string",
    },
    "applicant.trustees[index].person.residentialAddress": {
        type: "object",
    },
    "applicant.trustees[index].person.residentialAddress.streetAddress": {
        target: [
            "applicant_details[index].residential_address_address_line_1",
            "applicant_details[index].residential_address_address_line_2",
        ],
        type: "string",
    },
    "applicant.trustees[index].person.residentialAddress.city": {
        target: "applicant_details[index].residential_address_city_suburb",
        type: "string",
    },
    "applicant.trustees[index].person.residentialAddress.region": {
        type: "object",
    },
    "applicant.trustees[index].person.residentialAddress.region.code": {
        target: "applicant_details[index].residential_address_state",
        type: "string",
    },
    "applicant.trustees[index].person.residentialAddress.postalCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: "string",
    },
    "applicant.trustees[index].person.residentialAddress.country": {
        type: "object",
    },
    "applicant.trustees[index].person.residentialAddress.country.code": {
        target: "applicant_details[index].residential_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.trustees[index].person.postalAddress": {
        type: "object",
    },
    "applicant.trustees[index].person.postalAddress.streetAddress": {
        target: [
            "applicant_details[index].postal_address_address_line_1",
            "applicant_details[index].postal_address_address_line_2",
        ],
        type: "string",
    },
    "applicant.trustees[index].person.postalAddress.city": {
        target: "applicant_details[index].postal_address_city_suburb",
        type: "string",
    },
    "applicant.trustees[index].person.postalAddress.region": {
        type: "object",
    },
    "applicant.trustees[index].person.postalAddress.region.code": {
        target: "applicant_details[index].postal_address_state",
        type: "string",
    },
    "applicant.trustees[index].person.postalAddress.postalCode": {
        target: "applicant_details[index].postal_address_postcode",
        type: "string",
    },
    "applicant.trustees[index].person.postalAddress.country": {
        type: "object",
    },
    "applicant.trustees[index].person.postalAddress.country.code": {
        target: "applicant_details[index].postal_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    // Maximum 1 Email Address
    "applicant.trustees[index].person.emailAddresses": {
        type: "array",
    },
    "applicant.trustees[index].person.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
    },
    "applicant.trustees[index].person.emailAddresses[index].value": {
        target: "applicant_details[index].applicant_email",
        type: "string",
    },
    "applicant.trustees[index].person.emailAddresses[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    // Maximum 4 Phone Numbers
    "applicant.trustees[index].person.phoneNumbers": {
        type: "array",
    },
    "applicant.trustees[index].person.phoneNumbers[index].type": {
        type: "string",
        defaultValue: "mobile",
    },
    "applicant.trustees[index].person.phoneNumbers[index].value": {
        target: "applicant_details[index].applicant_mobile_phone",
        type: "string",
    },
    "applicant.trustees[index].person.phoneNumbers[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    "applicant.trustees[index].person.dateOfBirth": {
        target: "applicant_details[index].dob",
        type: "string",
    },
    "applicant.trustees[index].person.gender": {
        target: "applicant_details[index].gender",
        type: "string",
        enumMap: { MALE: "male", FEMALE: "female", OTHER: "other" },
    },
    "applicant.trustees[index].person.nationalities": {
        type: "array",
    },
    "applicant.trustees[index].person.nationalities[index].country": {
        target: "applicant_details[index].nationality",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.trustees[index].person.nationalities[index].type": {
        type: "string",
        defaultValue: "citizen",
    },
    "applicant.trustees[index].employment": {
        type: "object",
    },
    "applicant.trustees[index].employment.type": {
        // target: "applicant_details[index].occupation_type",
        type: "string",
        defaultValue: "ICT Managers"
    },
    "applicant.trustees[index].employment.category": {
        // target: "applicant_details[index].occupation_category",
        type: "string",
        defaultValue: "Managers"
    },
    // Maximum 4 Tax Details
    "applicant.trustees[index].taxDetails": {
        type: "array",
    },
    "applicant.trustees[index].taxDetails[index].country": {
        type: "string",
        defaultValue: "AU",
    },
    // If applicant_details.tfn has value -> applicant.trustees.taxDetails.isSupplied = TRUE. Else, applicant.trustees.taxDetails.isSupplied = FALSE
    "applicant.trustees[index].taxDetails[index].isSupplied": {
        type: "boolean",
    },
    "applicant.trustees[index].taxDetails[index].taxIdentificationNumber": {
        target: "applicant_details[index].tfn",
        type: ["string", null],
    },
    //if isSupplied = FALSE -> send this field with default value
    "applicant.trustees[index].taxDetails[index].nonSupplyReasonCode": {
        type: ["string", null],
        defaultValue: "000000000",
    },
    "applicant.trustees[index].marketingOptedOut": {
        type: "boolean",
        defaultValue: false,
    },
    // Use applicant information with applicant_details.is_trust_beneficiary = true for this object (Update logic)
    "applicant.beneficiaryDetails": {
        type: "array",
    },
    "applicant.beneficiaryDetails[index].isBeneficiary": {
        target: "applicant_details[index].is_trust_beneficiary",
        type: "boolean",
    },
    "applicant.beneficiaryDetails[index].entityType": {
        type: "string",
        defaultValue: "trust-beneficiary-individual",
    },
    "applicant.beneficiaryDetails[index].isBeneficialOwner": {
        target: "applicant_details[index].is_trust_beneficial_owner",
        type: "boolean",
    },
    "applicant.beneficiaryDetails[index].person": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].person.title": {
        target: "applicant_details[index].title",
        type: "string",
        enumMap: { MR: "mr", MRS: "mrs", MS: "ms", MISS: "miss", DR: "dr", MSTR: "master" },
    },
    "applicant.beneficiaryDetails[index].person.firstName": {
        target: "applicant_details[index].first_name",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.middleName": {
        target: "applicant_details[index].middle_name",
        type: ["string", null],
    },
    "applicant.beneficiaryDetails[index].person.lastName": {
        target: "applicant_details[index].last_name",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress.streetAddress": {
        target: [
            "applicant_details[index].residential_address_address_line_1",
            "applicant_details[index].residential_address_address_line_2",
        ],
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress.city": {
        target: "applicant_details[index].residential_address_city_suburb",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress.region": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress.region.code": {
        target: "applicant_details[index].residential_address_state",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress.postalCode": {
        target: "applicant_details[index].residential_address_postcode",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress.country": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].person.residentialAddress.country.code": {
        target: "applicant_details[index].residential_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.beneficiaryDetails[index].person.postalAddress": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].person.postalAddress.streetAddress": {
        target: [
            "applicant_details[index].postal_address_address_line_1",
            "applicant_details[index].postal_address_address_line_2",
        ],
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.postalAddress.city": {
        target: "applicant_details[index].postal_address_city_suburb",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.postalAddress.region": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].person.postalAddress.region.code": {
        target: "applicant_details[index].postal_address_state",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.postalAddress.postalCode": {
        target: "applicant_details[index].postal_address_postcode",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.postalAddress.country": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].person.postalAddress.country.code": {
        target: "applicant_details[index].postal_address_country",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    // Maximum 1 Email Address
    "applicant.beneficiaryDetails[index].person.emailAddresses": {
        type: "array",
    },
    "applicant.beneficiaryDetails[index].person.emailAddresses[index].type": {
        type: "string",
        defaultValue: "work",
    },
    "applicant.beneficiaryDetails[index].person.emailAddresses[index].value": {
        target: "applicant_details[index].applicant_email",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.emailAddresses[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    // Maximum 4 Phone Numbers
    "applicant.beneficiaryDetails[index].person.phoneNumbers": {
        type: "array",
    },
    "applicant.beneficiaryDetails[index].person.phoneNumbers[index].type": {
        type: "string",
        defaultValue: "mobile",
    },
    "applicant.beneficiaryDetails[index].person.phoneNumbers[index].value": {
        target: "applicant_details[index].applicant_mobile_phone",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.phoneNumbers[index].isPreferred": {
        type: "boolean",
        defaultValue: true,
    },
    "applicant.beneficiaryDetails[index].person.dateOfBirth": {
        target: "applicant_details[index].dob",
        type: "string",
    },
    "applicant.beneficiaryDetails[index].person.gender": {
        target: "applicant_details[index].gender",
        type: "string",
        enumMap: { MALE: "male", FEMALE: "female", OTHER: "other" },
    },
    "applicant.beneficiaryDetails[index].person.nationalities": {
        type: "array",
    },
    "applicant.beneficiaryDetails[index].person.nationalities[index].country": {
        target: "applicant_details[index].nationality",
        type: "string",
        enumMap: { ANDORRA: "AD", AUSTRALIA: "AU", BAHRAIN: "BH" },
    },
    "applicant.beneficiaryDetails[index].person.nationalities[index].type": {
        type: "string",
        defaultValue: "citizen",
    },
    "applicant.beneficiaryDetails[index].employment": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].employment.type": {
        // target: "applicant_details[index].occupation_type",
        type: "string",
        defaultValue: "ICT Managers"
    },
    "applicant.beneficiaryDetails[index].employment.category": {
        // target: "applicant_details[index].occupation_category",
        type: "string",
        defaultValue: "Managers"
    },
    // Maximum 4 Tax Details
    "applicant.beneficiaryDetails[index].taxDetails": {
        type: "array",
    },
    "applicant.beneficiaryDetails[index].taxDetails[index].country": {
        type: "string",
        defaultValue: "AU",
    },
    // If applicant_details.tfn has value -> applicant.beneficiaryDetails.taxDetails.isSupplied = TRUE. Else, applicant.beneficiaryDetails.taxDetails.isSupplied = FALSE
    "applicant.beneficiaryDetails[index].taxDetails[index].isSupplied": {
        type: "boolean",
    },
    "applicant.beneficiaryDetails[index].taxDetails[index].taxIdentificationNumber": {
        target: "applicant_details[index].tfn",
        type: ["string", null],
    },
    //if isSupplied = FALSE -> send this field with default value
    "applicant.beneficiaryDetails[index].taxDetails[index].nonSupplyReasonCode": {
        type: ["string", null],
        defaultValue: "000000000",
    },
    "applicant.beneficiaryDetails[index].marketingOptedOut": {
        type: "boolean",
        defaultValue: false,
    },
    "applicant.beneficiaryDetails[index].screeningResults": {
        type: "object",
    },
    "applicant.beneficiaryDetails[index].screeningResults.status": {
        type: "string",
        defaultValue: "verified",
    },
    // Get last_updated of document_file_name starting with "passKYCReport"
    "applicant.beneficiaryDetails[index].screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
    "applicant.settlor": {
        type: "object",
    },
    //If is_10000 = true => applicant.settlor.assetContributionIsImmaterial = FALSE
    // Else, applicant.settlor.assetContributionIsImmaterial = TRUE
    "applicant.settlor.assetContributionIsImmaterial": {
        type: "boolean"
    },
    "applicant.settlor.isDeceased": {
        type: "boolean",
        defaultValue: false,
    },
    // Ausiex only support Individual settlor, please only select Individual settlor for testing
    "applicant.settlor.name": {
        type: "object",
    },
    "applicant.settlor.name.title": {
        target: "individual_settlor[0].settlor_title",
        type: "string",
        enumMap: { MR: "mr", MRS: "mrs", MS: "ms", MISS: "miss", DR: "dr", MSTR: "master" },
    },
    "applicant.settlor.name.firstName": {
        target: "individual_settlor[0].settlor_first_name",
        type: "string",
    },
    "applicant.settlor.name.middleName": {
        target: "individual_settlor[0].settlor_middle_name",
        type: ["string", null],
    },
    "applicant.settlor.name.lastName": {
        target: "individual_settlor[0].settlor_last_name",
        type: "string",
    },
    // Maximum 4 Tax Details
    "applicant.taxDetails": {
        type: "array",
    },
    "applicant.taxDetails[index].country": {
        type: "string",
        defaultValue: "AU",
    },
    // If trust_tfn has value -> applicant.taxDetails.isSupplied = TRUE. Else, applicant.taxDetails.isSupplied = FALSE (Updat logic)
    "applicant.taxDetails[index].isSupplied": {
        type: "boolean",
    },
    // Update trust_tfn
    "applicant.taxDetails[index].taxIdentificationNumber": {
        target: "trust_tfn",
        type: ["string", null],
    },
    //if isSupplied = FALSE -> send this field with default value
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
    "applicant.screeningResults.completionTimestamp": {
        target: "applicant_details[index].uploaded_documents[index].last_updated",
        type: "string",
    },
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
    // Update settlement.holdFunds, required
    "settlement.holdFunds": {
        type: ["boolean"],
        defaultValue: false,
    },
    "settlement.redirectDividends": {
        type: ["boolean", null],
        defaultValue: true,
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
    // Get information from all applicants (applicant_details.residential_address_address_line_1). Example: ["34 King Str", "106 HQV", "77 Walking Street"]
    "holdingDetails.address.addressLines": {
        target: "holdingDetails_addressLines",
        type: ["array", null],
    },
    // If account_type = TRUST_COMPANY/ SUPER_FUND_COMPANY/ TRUST_INDIVIDUAL/ SUPER_FUND_INDIVIDUAL: mailing_address_postcode
    "holdingDetails.address.postCode": {
        target: "mailing_address_postcode",
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
let equixMapping = processEquixData(equixData, fieldMappings);
// console.log(JSON.stringify(equixMapping, null, 2));
equixMapping[key] = equixMapping[key]
    .map(str => str.trim()) // Trim khoảng trắng của từng phần tử
    .join(", ");
const key2 = "holdingDetails.hin";
equixMapping[key2] = equixMapping[key2] !== null ? String(equixMapping[key2]) : equixMapping[key2];

const key3 = "applicant.otherTrustType";
const key4 = "applicant.type";
(equixMapping[key4] !== "other") ? equixMapping[key3] = undefined : equixMapping[key3];


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
function validateBeneficiaryDetails(data) {
    let isBeneficiaryMap = {};

    // First, map the isBeneficiary values
    Object.keys(data).forEach((key) => {
        const match = key.match(/applicant\.beneficiaryDetails\[(\d+)\]\.isBeneficiary/);
        if (match) {
            let index = match[1];
            isBeneficiaryMap[index] = data[key];
        }
    });

    // Then, iterate over all keys and set fields to undefined for non-beneficiaries
    Object.keys(data).forEach((key) => {
        const match = key.match(/applicant\.beneficiaryDetails\[(\d+)\]\.(.+)/);
        if (match) {
            let index = match[1];

            if (isBeneficiaryMap[index] !== true) {
                data[key] = undefined; // Set the specific field to undefined
            }
        }
    });

    let newIndex = 0;
    let updatedData = {};
    let indexMap = {};

    Object.keys(data).forEach((key) => {
        const match = key.match(/applicant\.beneficiaryDetails\[(\d+)\]\.(.+)/);
        if (match) {
            let oldIndex = match[1];
            let field = match[2];

            // Nếu giá trị không phải undefined, cập nhật lại chỉ số
            if (data[key] !== undefined) {
                // Nếu chỉ số cũ chưa được ánh xạ, tạo một chỉ số mới
                if (indexMap[oldIndex] === undefined) {
                    indexMap[oldIndex] = newIndex++;
                }
                let newKey = `applicant.beneficiaryDetails[${indexMap[oldIndex]}].${field}`;
                updatedData[newKey] = data[key];
            }
        } else {
            // Giữ nguyên các trường không thuộc beneficiaryDetails
            updatedData[key] = data[key];
        }
    });

    // Bước 4: Đặt isBeneficiary thành undefined cho các mục còn lại
    Object.keys(updatedData).forEach((key) => {
        const match = key.match(/applicant\.beneficiaryDetails\[(\d+)\]\.isBeneficiary/);
        if (match) {
            updatedData[key] = undefined; // Luôn đặt isBeneficiary thành undefined
        }
    });

    // Bước 5: Lọc các trường có giá trị undefined
    let finalData = {};
    Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== undefined) {
            finalData[key] = updatedData[key];
        }
    });

    return finalData;
}


// Duyệt qua tất cả các key trong equixMapping
Object.keys(equixMapping).forEach(key => {
    if (key.includes("streetAddress")) {
        equixMapping[key] = equixMapping[key].trim();
    }
});

// Duyệt qua tất cả các key trong ausiexMapping
Object.keys(ausiexMapping).forEach(key => {
    if (key.includes("streetAddress")) {
        ausiexMapping[key] = ausiexMapping[key].trim();
    }
});
equixMapping = validateBeneficiaryDetails(equixMapping);

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
loggerTable(resultTable, columnNames2, [50, 50, 50, 10]);

// Ghi kết quả vào file CSV
const { Parser } = require("json2csv");
const content = new Parser().parse(resultTable);

saveFile(content, "../onboarding/trust/result.csv");
