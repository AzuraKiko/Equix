// Hàm chuẩn hóa dữ liệu theo kiểu
const normalizeValue = (value, type) => {
    if (value === undefined || value === null) return value;

    switch (type) {
        case "string":
            if (typeof value !== "string") return value;

            // Chuyển đổi số điện thoại từ AU (au|0412312312 -> 61412312312)
            if (value.includes("au|")) {
                const parts = value.split("|");
                if (parts.length === 2 && parts[0].toLowerCase() === "au") {
                    return parts[1].replace(/^0/, "61"); // Chuyển đầu số 0 thành 61
                }
            }

            // Chuyển đổi ngày dd/mm/yyyy -> yyyy-mm-dd
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                const [dd, mm, yyyy] = value.split("/");
                return `${yyyy}-${mm}-${dd}`;
            }

            // Chuyển đổi timestamp (string dạng số) -> ISO 8601
            if (/^\d{13}$/.test(value)) {
                return new Date(Number(value)).toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
            }

            return value;
        case "number":
            if (typeof value === "number") return value;

        case "boolean":
            if (typeof value === "boolean") return value;

        default:
            return value;
    }
};
module.exports = { normalizeValue };