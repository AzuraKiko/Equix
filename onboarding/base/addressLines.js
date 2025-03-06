// Function phụ: Xử lý unit address
// function unitAddress(unit) {
//     if (!unit) return "Unit "; // Tránh thêm khoảng trắng thừa khi unit là null/undefined

//     return unit.toLowerCase().includes("unit") ? unit : `Unit ${unit}`;
// }
// Xử lý dữ liệu holdingDetails_addressLines
// const generateAddressLines = (dataAccount) => {
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

//     // Push địa chỉ của tất cả applicant trước
//     let addressLines = [];
//     applicantDetails.forEach((applicant) => {
//         const app_residential_address_unit_flat_number = applicant.residential_address_unit_flat_number || "";
//         const app_residential_address_street_number = applicant.residential_address_street_number || "";
//         const app_residential_address_street_name = applicant.residential_address_street_name || "";
//         const app_residential_address_street_type = applicant.residential_address_street_type || "";

//         // Line 5: Địa chỉ chi tiết của applicant hiện tại
//         // let addressLine = `${unitAddress(app_residential_address_unit_flat_number) || ""}${app_residential_address_street_number} ${app_residential_address_street_name} ${app_residential_address_street_type}`.trim();
//         let addressLine = `${app_residential_address_street_number} ${app_residential_address_street_name} ${app_residential_address_street_type}`.trim();

//         if (addressLine) {
//             addressLines.push(addressLine);
//         }
//     });

//     // Push thành phố và bang sau địa chỉ của từng applicant
//     applicantDetails.forEach((applicant) => {
//         const app_residential_address_city_suburb = applicant.residential_address_city_suburb || "";
//         const app_residential_address_state = applicant.residential_address_state || "";

//         // Line 6: Thành phố và bang của applicant hiện tại
//         let cityStateLine = `${app_residential_address_city_suburb} ${app_residential_address_state}`.trim();
//         if (cityStateLine) {
//             addressLines.push(cityStateLine);
//         }
//     });

//     // Kết hợp addressLines vào arrayLine
//     arrayLine = arrayLine.concat(addressLines);

//     // Loại bỏ dòng không có dữ liệu và sắp xếp lại các dòng có dữ liệu
//     arrayLine = arrayLine.filter(line => line);

//     return arrayLine;
// };

const generateAddressLines = (dataAccount) => {
    let arrayLine = [];
    const applicantDetails = dataAccount.applicant_details;

    // Push thành phố và bang sau địa chỉ của từng applicant
    applicantDetails.forEach((applicant) => {
        const app_residential_address_address_line_1 = applicant.residential_address_address_line_1.trim() || "";
        if (app_residential_address_address_line_1) {
            arrayLine.push(app_residential_address_address_line_1);
        }
    });

    return arrayLine;
};


module.exports = { generateAddressLines };


// "Add + and , rule:
// - If there is no chessDesignation --> add , after the last applicant
// - If there is chessDesignation --> add , after chessDesignation
// - If there are 2 applicants --> add + after 1st applicant
// - If there are 3 applicants --> add + after 1st applicant and 2nd applicant

// The order of line:
// - line1:
// applicant_details.title (1st applicant)
// applicant_details.first_name (1st applicant)
// applicant_details.middle_name (1st applicant)
// applicant_details.last_name (1st applicant)
// - line2
// applicant_details.title (2nd applicant-if any)
// applicant_details.first_name (2nd applicant- if any)
// applicant_details.middle_name (2nd applicant- if any)
// applicant_details.last_name (2nd applicant- if any)
// - line3:
// applicant_details.title (3rd applicant)
// applicant_details.first_name (3rd applicant-if any)
// applicant_details.middle_name (3rd applicant- if any)
// applicant_details.last_name (3rd applicant-if any)
// - line4:
// <chessDesignation>
// - line5:
// _address_street_number
// _address_street_name
// _address_street_type
// - line6:
// _address_city_suburb
// _address_state
// ->> If the line has no data, move to the next line with data to this line"
