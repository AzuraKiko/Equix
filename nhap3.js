function validateBeneficiaryDetails(data) {
    let isBeneficiaryMap = {};

    // Bước 1: Tạo bản đồ isBeneficiary
    Object.keys(data).forEach((key) => {
        const match = key.match(/applicant\.beneficiaryDetails\[(\d+)\]\.isBeneficiary/);
        if (match) {
            let index = match[1];
            isBeneficiaryMap[index] = data[key];
        }
    });

    // Bước 2: Đặt các trường thành undefined nếu isBeneficiary là false
    Object.keys(data).forEach((key) => {
        const match = key.match(/applicant\.beneficiaryDetails\[(\d+)\]\.(.+)/);
        if (match) {
            let index = match[1];
            if (isBeneficiaryMap[index] === false) {
                data[key] = undefined; // Đặt giá trị thành undefined
            }
        }
    });

    // Bước 3: Xóa các mục undefined và cập nhật lại chỉ số
    let newIndex = 0;
    let updatedData = {};
    let indexMap = {}; // Bản đồ để lưu lại ánh xạ giữa chỉ số cũ và mới

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

// Dữ liệu đầu vào
const data = {
    "applicant.beneficiaryDetails[0].isBeneficiary": false,
    "applicant.beneficiaryDetails[1].isBeneficiary": true,
    "applicant.beneficiaryDetails[2].isBeneficiary": false,
    "applicant.beneficiaryDetails[0].entityType": "trust-beneficiary-individual",
    "applicant.beneficiaryDetails[1].entityType": "trust-beneficiary-individual",
    "applicant.beneficiaryDetails[2].entityType": "trust-beneficiary-individual",
    "applicant.beneficiaryDetails[0].isBeneficialOwner": false,
    "applicant.beneficiaryDetails[1].isBeneficialOwner": true,
    "applicant.beneficiaryDetails[2].isBeneficialOwner": false,
    "applicant.beneficiaryDetails[0].person.title": "ms",
    "applicant.beneficiaryDetails[1].person.title": "mr",
    "applicant.beneficiaryDetails[2].person.title": "miss",
    "applicant.beneficiaryDetails[0].person.firstName": "Huyen",
    "applicant.beneficiaryDetails[1].person.firstName": "Duc",
    "applicant.beneficiaryDetails[2].person.firstName": "Quynh",
    "applicant.beneficiaryDetails[0].person.middleName": "Khanh",
    "applicant.beneficiaryDetails[1].person.middleName": "Van",
    "applicant.beneficiaryDetails[2].person.middleName": "Diem",
    "applicant.beneficiaryDetails[0].person.lastName": "Tran",
    "applicant.beneficiaryDetails[1].person.lastName": "Pham",
    "applicant.beneficiaryDetails[2].person.lastName": "Bui",
    "applicant.beneficiaryDetails[0].person.residentialAddress.streetAddress": "10009/234 Ho Tung Mau ALLEY",
    "applicant.beneficiaryDetails[1].person.residentialAddress.streetAddress": "88888/43 Sword STREET",
    "applicant.beneficiaryDetails[2].person.residentialAddress.streetAddress": "676R Gilbert Road",
};

// Gọi hàm và in kết quả
const result = validateBeneficiaryDetails(data);
console.log(JSON.stringify(result, null, 2));