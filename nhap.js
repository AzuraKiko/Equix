// Nhap 1
function formatAddressLines(applicants, chessDesignation, addressDetails) {
    let lines = [];
    
    // Format applicant lines
    applicants.forEach((applicant, index) => {
        let fullName = [
            applicant.title,
            applicant.first_name,
            applicant.middle_name,
            applicant.last_name
        ].filter(Boolean).join(' ');
        
        // Add "+" for 2 or 3 applicants
        if ((index === 0 && applicants.length > 1) || (index === 1 && applicants.length === 3)) {
            fullName += " +";
        }

        lines.push(fullName);
    });

    // Add chessDesignation
    if (chessDesignation) {
        lines.push(chessDesignation + ",");
    } else {
        // If no chessDesignation, add "," after the last applicant
        lines[lines.length - 1] += ",";
    }

    // Format address lines
    const addressLines = [
        [addressDetails.street_number, addressDetails.street_name, addressDetails.street_type].filter(Boolean).join(' '),
        [addressDetails.city_suburb, addressDetails.state].filter(Boolean).join(' ')
    ];

    // Only add non-empty lines
    addressLines.forEach(line => {
        if (line) lines.push(line);
    });

    return lines;
}

// Example data
const applicants = [
    { title: "MR", first_name: "PHAM", middle_name: "ANH", last_name: "DUC" },
    { title: "MRS", first_name: "DAO", middle_name: "VAN", last_name: "ANH" },
    { title: "MS", first_name: "LE", middle_name: "KHANH", last_name: "HUYEN" }
];
const chessDesignation = "ACCOUNT A";
const addressDetails = {
    street_number: "123",
    street_name: "Nguyen Trai",
    street_type: "Street",
    city_suburb: "District 1",
    state: "HCMC"
};

let sholdingDetails_addressLines = formatAddressLines(applicants, chessDesignation, addressDetails);
console.log(sholdingDetails_addressLines);


// Nhap 2
function generateAddressLines(dataAccount) {
    let arrayLine = [];
    let chessAccountName = "";
    const account_type = dataAccount.account_type;
    const applicantDetails = dataAccount.applicant_details;
    const chessDesignation = dataAccount.account_designation;
  
    // Xử lý applicant_details
    applicantDetails.forEach((applicant, index) => {
      const app_title = applicant.title || "";
      const app_first_name = applicant.first_name || "";
      const middle_name = applicant.middle_name || "";
      const app_last_name = applicant.last_name || "";
  
      let fullName = `${app_title} ${app_first_name} ${
        middle_name ? middle_name + " " : ""
      }${app_last_name}`;
  
      if (
        [
          "INDIVIDUAL",
          "JOINT",
          "TRUST_INDIVIDUAL",
          "SUPER_FUND_INDIVIDUAL",
        ].includes(account_type)
      ) {
        // Thêm dấu + khi có nhiều hơn 1 applicant
        if (applicantDetails.length > 1 && index < applicantDetails.length - 1) {
          fullName += "+";
        }
        arrayLine.push(fullName);
      }
    });
  
    // Xử lý chessDesignation
    if (chessDesignation) {
      chessAccountName += `<${chessDesignation.replace(" A/C", "")} A/C>`;
      arrayLine.push(`<${chessDesignation.replace(" A/C", "")} A/C>,`);
    } else {
      const lastApplicantName = arrayLine.pop();
      arrayLine.push(`${lastApplicantName}.replace(/\+$/, '')},`);
    }
  
    // Xử lý địa chỉ cho các loại account_type khác nhau
    if (["INDIVIDUAL", "JOINT"].includes(account_type)) {
      arrayLine.push(
        `${unitAddress(dataAccount.residential_address_unit_flat_number) || ""}${
          dataAccount.residential_address_street_number
        } ${dataAccount.residential_address_street_name} ${
          dataAccount.residential_address_street_type
        }`
      );
      arrayLine.push(
        `${dataAccount.residential_address_city_suburb} ${dataAccount.residential_address_state}`
      );
    } else if (account_type === "COMPANY") {
      arrayLine.push(`${dataAccount.company_name}`);
      arrayLine.push(
        `${
          unitAddress(
            dataAccount.company_registered_office_address_unit_flat_number
          ) || ""
        }${dataAccount.company_registered_office_address_street_number} ${
          dataAccount.company_registered_office_address_street_name
        } ${dataAccount.company_registered_office_address_street_type}`
      );
      arrayLine.push(
        `${dataAccount.company_registered_office_address_city_suburb} ${dataAccount.company_registered_office_address_state}`
      );
    } else if (
      [
        "TRUST_COMPANY",
        "SUPER_FUND_COMPANY",
        "TRUST_INDIVIDUAL",
        "SUPER_FUND_INDIVIDUAL",
      ].includes(account_type)
    ) {
      if (dataAccount.company_name) {
        arrayLine.push(`${dataAccount.company_name}`);
      }
      if (chessDesignation) {
        arrayLine.push(
          `<${cutText(chessDesignation.replace(" A/C", ""), 23)} A/C>,`
        );
      }
      arrayLine.push(
        `${unitAddress(dataAccount.mailing_address_unit_flat_number) || ""}${
          dataAccount.mailing_address_street_number
        } ${dataAccount.mailing_address_street_name} ${
          dataAccount.mailing_address_street_type
        }`
      );
      arrayLine.push(
        `${dataAccount.mailing_address_city_suburb} ${dataAccount.mailing_address_state}`
      );
    }
  
    // Xóa dòng trống và sắp xếp lại các dòng
    arrayLine = arrayLine.filter((line) => line.trim() !== "");
  
    return arrayLine;
  }
  
  // Function phụ: Cắt text theo độ dài
  function cutText(text, length) {
    return text.length > length ? text.substring(0, length) : text;
  }
  
  // Function phụ: Xử lý unit address
  function unitAddress(unit) {
    return unit.toLowerCase().includes('unit') ? unit : `Unit ${unit} `;
  }


  // // Xử lý dữ liệu holdingDetails_addressLines
// function generateAddressLines(dataAccount) {
//     let arrayLine = [];
//     const applicantDetails = dataAccount.applicant_details;
//     const chessDesignation = dataAccount.account_designation;

//     // Xử lý applicant_details
//     applicantDetails.forEach((applicant, index) => {
//         const app_title = applicant.title || "";
//         const app_first_name = applicant.first_name || "";
//         const app_middle_name = applicant.middle_name ? applicant.middle_name + " " : "";
//         const app_last_name = applicant.last_name || "";

//         // Xử lý tên đầy đủ
//         let fullName = `${app_title} ${app_first_name} ${app_middle_name}${app_last_name}`.trim();

//         // Thêm dấu + nếu có từ 2 applicant trở lên và không phải applicant cuối
//         if (applicantDetails.length > 1 && index < applicantDetails.length - 1) {
//             fullName += "+";
//         }
//         arrayLine.push(fullName);
//     });

//     // Xử lý chessDesignation
//     if (chessDesignation) {
//         arrayLine.push(`<${chessDesignation.replace(" A/C", "")} A/C>,`);
//     } else {
//         // Thêm dấu , sau applicant cuối cùng nếu không có chessDesignation
//         const lastIndex = arrayLine.length - 1;
//         arrayLine[lastIndex] = arrayLine[lastIndex].replace(/\+$/, '') + ",";
//     }

//     // Đảm bảo chỉ có 1 dòng địa chỉ dù có nhiều applicant
//     const firstApplicant = applicantDetails[0];
//     if (firstApplicant) {
//         const app_residential_address_unit_flat_number = firstApplicant.residential_address_unit_flat_number || "";
//         const app_residential_address_street_number = firstApplicant.residential_address_street_number || "";
//         const app_residential_address_street_name = firstApplicant.residential_address_street_name || "";
//         const app_residential_address_street_type = firstApplicant.residential_address_street_type || "";
//         const app_residential_address_city_suburb = firstApplicant.residential_address_city_suburb || "";
//         const app_residential_address_state = firstApplicant.residential_address_state || "";

//         // Line 5: Địa chỉ chi tiết
//         let addressLine = `${app_residential_address_unit_flat_number} ${app_residential_address_street_number} ${app_residential_address_street_name} ${app_residential_address_street_type}`.trim();
//         if (addressLine) {
//             arrayLine.push(addressLine);
//         }

//         // Line 6: Thành phố và bang
//         let cityStateLine = `${app_residential_address_city_suburb} ${app_residential_address_state}`.trim();
//         if (cityStateLine) {
//             arrayLine.push(cityStateLine);
//         }
//     }

//     // Loại bỏ dòng không có dữ liệu và sắp xếp lại các dòng có dữ liệu
//     arrayLine = arrayLine.filter(line => line);

//     return arrayLine;
// }
