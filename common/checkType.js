
// Hàm kiểm tra kiểu dữ liệu của giá trị
const checkType = (value, expectedType) => {

  if (Array.isArray(expectedType)) {
    return expectedType.some(type => checkType(value, type));
  }

  // Nếu kiểu dữ liệu mong muốn là chuỗi
  if (expectedType === "string") {
    // Nếu là định dạng YYYY-MM-DD thì vẫn hợp lệ
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return true;
    }
    return typeof value === "string";
  }

  // Nếu kiểu dữ liệu mong muốn là số
  if (expectedType === "number")
    // Nếu là số và không phải NaN thì trả về true
    return typeof value === "number" && !isNaN(value);

  // Nếu kiểu dữ liệu mong muốn là boolean
  if (expectedType === "boolean") return typeof value === "boolean";

  // Nếu kiểu dữ liệu array
  if (expectedType === "array") return Array.isArray(value);
  // Nếu kiểu dữ liệu object
  if (expectedType === "object") return typeof value === "object" && value !== null;
  return false;
};
module.exports = { checkType };
