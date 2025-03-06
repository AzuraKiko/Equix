const { getValueArray } = require("./common/getValue");
const { normalizeValue } = require("./common/normalizeValue");

const processEquixData = (data, mappings) => {
    let result = {};
    const applicantDetails = getValueArray(data, "applicant_details") || [];

    for (const key in mappings) {
        const mapping = mappings[key];
        const target = mapping.target;
        let value;
        if (target || mapping.defaultValue) {
            if (key.includes("[index]")) {
                applicantDetails.forEach((applicant, applicantIdx) => {
                    if (applicantIdx >= 2) return; // ✅ Chỉ lấy đến applicantIdx = 1, bỏ qua 2 trở đi
                    // ✅ Thay thế "[index]" chỉ trong "parties[index]"
                    let replacedKey = key.replaceAll("parties[index]", `parties[${applicantIdx}]`);

                    if (Array.isArray(target)) {
                        let values = target
                            .map((t) => (typeof t === "string" ? getValueArray(data, t.replaceAll("[index]", `[${applicantIdx}]`)) : undefined))
                            .filter((v) => v !== undefined);

                        if (values.length > 0) {
                            value = values.join(" ");
                        } else if (mapping.defaultValue !== undefined) {
                            value = mapping.defaultValue;
                        }
                    } else if (typeof target === "string") {
                        let replacedTarget = target.replaceAll("[index]", `[${applicantIdx}]`);

                        // ✅ Check nếu target là `last_updated`, tìm timestamp mới nhất
                        if (replacedTarget.includes("last_updated")) {
                            let maxTimestamp = null;
                            const uploadedDocuments = getValueArray(applicant, "uploaded_documents");

                            if (Array.isArray(uploadedDocuments)) {
                                uploadedDocuments.forEach(doc => {
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
                        result[replacedKey.replace("[index]", `[0]`)] = normalizeValue(value, type);
                    }
                });
            } else {
                value = target ? getValueArray(data, target) : undefined;

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
                        if (["holdingDetails.address.postCode", "holdingDetails.emailAddress"].includes(key)) {
                            if (applicantIdx === 0) { // ✅ Chỉ lấy từ applicant đầu tiên
                                let firstApplicantValue = getValueArray(data, mapping.target.replace("[index]", "[0]"));
                                const type = Array.isArray(value) ? "array" : typeof firstApplicantValue;
                                result[key] = normalizeValue(firstApplicantValue, type);
                            }
                            return; // ✅ Không xử lý tiếp các applicant khác
                        }
                    });
                }
            }
        } else {
            if (key.includes("isSupplied")) {
                const superFundTfn = getValueArray(data, "super_fund_tfn");
                value = superFundTfn !== null && superFundTfn !== undefined;
                const type = Array.isArray(mapping.defaultValue) ? "array" : typeof value;
                applicantDetails.forEach((applicant, applicantIdx) => {
                    result[key.replace("[index]", `[${applicantIdx}]`)] = normalizeValue(value, type);
                });
            } else {
                continue;
            }
        }

    }
    return result;
};


const equixData = {
    "user_id": "eq1725524524354",
    "account_designation": null,
    "account_id": null,
    "account_name": "MR Bui YEn & MR Bui Yen",
    "account_status": "IN_PENDING_DEVELOPMENT",
    "account_type": "JOINT",
    "actor": "yen.adv.eq@novus-fintech.com",
    "advisor_code": "AFM",
    "advisor_name": "AFFLUENCE FUNDS MANAGEMENT",
    "applicant_count": 2,
    "applicant_details": [
      {
        "applicant_id": "a8d97870-d189-4afe-b69e-c005c09daf97",
        "ekyc_aml_consent": true,
        "title": "MR",
        "first_name": "Bui",
        "last_name": "YEn",
        "gender": "MALE",
        "nationality": "AUSTRALIA",
        "occupation_type": "Chief Executives, General Managers and Legislators",
        "occupation_category": "Administrative and Support Services",
        "source_of_wealth": "BUSINESS_OPERATIONS",
        "australian_tax_resident": true,
        "subclass_visa": false,
        "include_minor": false,
        "tax_exemption": false,
        "dob": "01/01/1992",
        "government_id": [
          {
            "type": "PASSPORT",
            "number": "a1111111",
            "first_name": "Bui",
            "last_name": "YEn",
            "document_id": [
              {
                "id": "460c0c462a3b9ae3948646e8b3a8258fa7a786e9f5af4dc8f15db03e5fc8d7c6650a9cbb2bfc6940a87c8d0f3cd8c2cfa7393d2438fd4f",
                "name": "IMG_1417.jpeg",
                "upload_time": 1725524418396,
                "extension": "jpeg"
              }
            ],
            "ekyc_govid_status": "EKYC_VERIFIED"
          }
        ],
        "relationship_type": "OWNER",
        "residential_address_country": "AUSTRALIA",
        "country_of_birth": "AUSTRALIA",
        "tos_consent": true,
        "same_as_ra": true,
        "applicant_email": "yen.bui+120@novus-fintech.com",
        "applicant_mobile_phone": "au|0423123213",
        "residential_address_full_address": "2262 Aarons Pass Road, AARONS PASS NSW 2850",
        "residential_address_street_number": "2262",
        "residential_address_street_name": "Aarons Pass",
        "residential_address_street_type": "Road",
        "residential_address_city_suburb": "AARONS PASS",
        "residential_address_postcode": "2850",
        "residential_address_state": "NSW",
        "residential_address_address_line_1": "2262 Aarons Pass Road",
        "postal_address_country": "AUSTRALIA",
        "postal_address_full_address": "2262 Aarons Pass Road, AARONS PASS NSW 2850",
        "postal_address_street_number": "2262",
        "postal_address_street_name": "Aarons Pass",
        "postal_address_street_type": "Road",
        "postal_address_city_suburb": "AARONS PASS",
        "postal_address_postcode": "2850",
        "postal_address_state": "NSW",
        "postal_address_address_line_1": "2262 Aarons Pass Road",
        "ekyc_overall_status": "EKYC_VERIFIED",
        "gbg_verification_id": "c3fWFtPo",
        "applicant_agreement": true,
        "uploaded_documents": [
          {
            "document_type": "EKYC_REPORT",
            "ekyc_document_status": "EKYC_PENDING",
            "actor": "yen.adv.eq@novus-fintech.com",
            "document_file_name": "passKYCReport_EQ-EQ-579-828-473-A.pdf",
            "last_updated": "1725524524384",
            "document_link": "https://dev2-retail-api.equix.app/v1/user/account-opening/stream/5715005621369bf69e903dbea6a7789da8a8cbfee19f4cd5f377a66214c4c89f355ecdb870a13c32ad78dc1268c0d793f6"
          }
        ]
      },
      {
        "applicant_id": "901837cb-a2e9-48a8-8130-b09f42dbed9e",
        "ekyc_aml_consent": true,
        "title": "MR",
        "first_name": "Bui",
        "last_name": "Yen",
        "gender": "MALE",
        "nationality": "AUSTRALIA",
        "occupation_type": "Chief Executives, General Managers and Legislators",
        "occupation_category": "Administrative and Support Services",
        "source_of_wealth": "BUSINESS_OPERATIONS",
        "australian_tax_resident": true,
        "subclass_visa": false,
        "include_minor": false,
        "tax_exemption": false,
        "dob": "11/11/1991",
        "government_id": [
          {
            "type": "PASSPORT",
            "number": "a1111111",
            "first_name": "Bui",
            "last_name": "Yen",
            "document_id": [
              {
                "id": "460c0c462a3b9ae3948646e8b3a8258fa7a786e9f5af4dc8f15db03e5fc8d7c6650a9cbb2bfc6940a02a8e0b31dd9f95a6393d2438fd4f",
                "name": "IMG_1417.jpeg",
                "upload_time": 1725524499663,
                "extension": "jpeg"
              }
            ],
            "ekyc_govid_status": "EKYC_VERIFIED"
          }
        ],
        "relationship_type": "OWNER",
        "residential_address_country": "AUSTRALIA",
        "country_of_birth": "AUSTRALIA",
        "tos_consent": true,
        "same_as_ra": true,
        "applicant_email": "yen.bui+121@novus-fintech.com",
        "applicant_mobile_phone": "au|0444444444",
        "residential_address_full_address": "2162 Aarons Pass Road, AARONS PASS NSW 2850",
        "residential_address_street_number": "2162",
        "residential_address_street_name": "Aarons Pass",
        "residential_address_street_type": "Road",
        "residential_address_city_suburb": "AARONS PASS",
        "residential_address_postcode": "2850",
        "residential_address_state": "NSW",
        "residential_address_address_line_1": "2162 Aarons Pass Road",
        "postal_address_country": "AUSTRALIA",
        "postal_address_full_address": "2162 Aarons Pass Road, AARONS PASS NSW 2850",
        "postal_address_street_number": "2162",
        "postal_address_street_name": "Aarons Pass",
        "postal_address_street_type": "Road",
        "postal_address_city_suburb": "AARONS PASS",
        "postal_address_postcode": "2850",
        "postal_address_state": "NSW",
        "postal_address_address_line_1": "2162 Aarons Pass Road",
        "ekyc_overall_status": "EKYC_VERIFIED",
        "gbg_verification_id": "6b1Wr5Rg"
      }
    ],
    "bank_account_name": "Bui Yen & Bui Yen",
    "bank_account_number": "000123456789",
    "bank_account_type": "BANK_ACCOUNT",
    "bank_bsb": "182-512",
    "bank_cmt_provider": "MBLA",
    "bank_transaction_type": "BOTH",
    "based_currency": "AUD",
    "branch": "BR00000000",
    "branch_code": "MO",
    "branch_name": "MO",
    "client_type": "PRIVATE",
    "cma_account_purpose": "PERSONAL_DAY_TO_DAY_USAGE",
    "cma_account_purpose_desc": null,
    "cma_new_download": null,
    "cma_source_of_funds": "INVESTMENTS_AND_DIVIDENDS_ASSET_SALE",
    "cma_source_of_funds_desc": null,
    "company_abn": null,
    "company_acn": null,
    "company_country_of_incorporation": null,
    "company_date_of_incorporation": null,
    "company_email": null,
    "company_fax_phone": null,
    "company_industry": null,
    "company_mobile_phone": null,
    "company_name": null,
    "company_nature_of_business_activity": null,
    "company_principal_place_of_business_address_city_suburb": null,
    "company_principal_place_of_business_address_country": null,
    "company_registered_office_address_full_address": null,
    "company_registered_office_address_address_line_1": null,
    "company_registered_office_address_address_line_2": null,
    "company_principal_place_of_business_address_full_address": null,
    "company_principal_place_of_business_address_address_line_1": null,
    "company_principal_place_of_business_address_address_line_2": null,
    "company_principal_place_of_business_address_postcode": null,
    "company_principal_place_of_business_address_state": null,
    "company_principal_place_of_business_address_street_name": null,
    "company_principal_place_of_business_address_street_number": null,
    "company_principal_place_of_business_address_street_type": null,
    "company_principal_place_of_business_address_unit_flat_number": null,
    "company_registered_office_address_city_suburb": null,
    "company_registered_office_address_country": null,
    "company_registered_office_address_postcode": null,
    "company_registered_office_address_state": null,
    "company_registered_office_address_street_name": null,
    "company_registered_office_address_street_number": null,
    "company_registered_office_address_street_type": null,
    "company_registered_office_address_unit_flat_number": null,
    "company_registered_office_address_unit_full_address": null,
    "company_same_as_roa": false,
    "company_tax_exemption": false,
    "company_tax_exemption_details": null,
    "company_tfn": null,
    "company_type": null,
    "company_work_phone": null,
    "currency": null,
    "date_created": "1725524451197",
    "equix_id": "EQ-EQ-579-828-473-A",
    "gst_payable": true,
    "hin": null,
    "last_updated": "1741058351784",
    "new_cma": "NEW_CMA",
    "organization_code": "TPMSEC",
    "organization_name": "TPMSEC",
    "send_registration_email": true,
    "settlement_existing_hin": null,
    "settlement_method": "SPONSORED_NEW_HIN",
    "settlement_pid": null,
    "settlement_supplementary_reference": null,
    "smsf": false,
    "super_fund_abn": null,
    "super_fund_name": null,
    "super_fund_tax_exemption": false,
    "super_fund_tax_exemption_details": null,
    "super_fund_tfn": null,
    "trade_confirmations": [
      {
        "client_address": true,
        "method": "EMAIL",
        "email": "yen.bui+120@novus-fintech.com",
        "attention": "yen.bui+120@novus-fintech.com"
      },
      {
        "method": "EMAIL",
        "email": "yen.bui+121@novus-fintech.com",
        "client_address": true,
        "attention": "yen.bui+121@novus-fintech.com"
      }
    ],
    "tradeable_products": {
      "equity": "GM-NIL"
    },
    "trust_abn": null,
    "trust_activity": null,
    "trust_asset_source_details": null,
    "trust_country_of_establishment": null,
    "trust_name": null,
    "trust_tax_exemption": false,
    "trust_tax_exemption_details": null,
    "trust_tfn": null,
    "trust_type": null,
    "cma_third_party_download": null,
    "tos_ip": "27.72.31.182",
    "tos_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
    "tos_dt": "1725524451197",
    "bank_macquarie_application_id": "232358",
    "draft_id": "9840bf606b5f11efa442eb7c0f85fe64",
    "actor_change": "qa-test-1@equix.com.au",
    "morrison_status": null,
    "environment": "tfg2",
    "company_sector": null,
    "industry_code": null,
    "trust_address_full_address": null,
    "trust_address_address_line_1": null,
    "trust_address_address_line_2": null,
    "trust_address_city_suburb": null,
    "trust_address_country": null,
    "trust_address_postcode": null,
    "trust_address_state": null,
    "trust_address_street_name": null,
    "trust_address_street_number": null,
    "trust_address_street_type": null,
    "trust_address_unit_flat_number": null,
    "trust_address_unit_full_address": null,
    "mailing_address_full_address": null,
    "mailing_address_address_line_1": null,
    "mailing_address_address_line_2": null,
    "mailing_address_city_suburb": null,
    "mailing_address_country": null,
    "mailing_address_postcode": null,
    "mailing_address_state": null,
    "mailing_address_street_name": null,
    "mailing_address_street_number": null,
    "mailing_address_street_type": null,
    "mailing_address_unit_flat_number": null,
    "mailing_address_unit_full_address": null,
    "super_fund_address_full_address": null,
    "super_fund_address_address_line_1": null,
    "super_fund_address_address_line_2": null,
    "super_fund_address_city_suburb": null,
    "super_fund_address_country": null,
    "super_fund_address_postcode": null,
    "super_fund_address_state": null,
    "super_fund_address_street_name": null,
    "super_fund_address_street_number": null,
    "super_fund_address_street_type": null,
    "super_fund_address_unit_flat_number": null,
    "super_fund_address_unit_full_address": null,
    "super_fund_activity": null,
    "type_of_trust": null,
    "tax_resident_of_australia": false,
    "tax_status": null,
    "global_intermediary_identification_number": null,
    "fatca_status": null,
    "fatca_status_other": null,
    "trustee_global_intermediary_identification_number": null,
    "is_fi_non_participarting_crs_managed_by_other_fi": false,
    "is_controlling_person_foreign_tax_resident": false,
    "country_of_tax_residency": null,
    "taxpayer_identification_number_exemption_reason": null,
    "is_initial_sum_of_trust_greater_than_10000": false,
    "name_of_regulator": null,
    "abn_or_registration_licensing_details": null,
    "trust_description": null,
    "beneficiaries_membership_of_a_class": false,
    "membership_class_details": null,
    "taxpayer_identification_number": null,
    "trust_deed": null,
    "company_source_of_wealth": null,
    "trust_source_of_wealth": null,
    "trust_industry": null,
    "super_fund_source_of_wealth": null,
    "super_fund_industry": null,
    "trust_settlor": false,
    "controlling_parties_related": false,
    "controlling_parties_beneficiaries": false,
    "submission_id": "46df1ed2-fd56-4328-92e8-5c99c0cb7785",
    "submission_status": null,
    "submit_time": "1725524524385",
    "is_submitted": 1,
    "gin_ask": null,
    "tin_ask": null,
    "trust_class_beneficiaries_trust_deed": false,
    "trust_class_beneficiaries": false,
    "trust_entity_beneficiary": false,
    "trust_entity_beneficiary_detail": null,
    "is_10000": null,
    "settlor_australia_tax": null,
    "settlor_other_australia_tax": null,
    "settlor_type": null,
    "individual_settlor": null,
    "trust_settlor_details": null,
    "company_settlor": null
  }

const fieldMappings = {

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
}


const equixMapping = processEquixData(equixData, fieldMappings);
console.log(equixMapping);