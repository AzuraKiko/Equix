// Truncate string end
function truncateStringEnd(str, maxLength) {
    return str && str.length > maxLength
        ? str.substring(0, maxLength) + "..."
        : str;
}


// Truncate string start
function truncateStringStart(str, maxLength) {
    return str && str.length > maxLength
        ? '...' + str.slice(-maxLength) // Lấy maxLength ký tự cuối cùng
        : str;
}

// Hàm xử lý wrap text theo định dạng
const wrapText = (value, maxLength) => {
    // Hàm xử lý ngắt dòng cho chuỗi
    const wrapString = (str) => {
        const regex = new RegExp(`(.{1,${maxLength}})`, 'g');
        const matches = str.match(regex);
        return matches ? matches.join('\n') : str;
    };

    // Nếu là string hoặc number, chuyển thành string rồi ngắt dòng
    if (typeof value === 'string' || typeof value === 'number') {
        return wrapString(value.toString());
    }

    // Nếu là array, ngắt dòng từng phần tử và giữ nguyên định dạng array
    if (Array.isArray(value)) {
        return value.map(item => wrapText(item, maxLength)).join(',\n');
    }
    // Các kiểu dữ liệu khác (null, undefined, boolean)
    return String(value);
};

module.exports = { truncateStringEnd, truncateStringStart, wrapText };