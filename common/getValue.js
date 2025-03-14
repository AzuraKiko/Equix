// Hàm lấy giá trị từ object, hỗ trợ đường dẫn key kiểu `a.b[index].c`
const getValueArray = (obj, key) => {
  if (!key || typeof key !== "string") {
    console.error("❌ Invalid key:", key);
    return undefined;
  }

  return key.split(".").reduce((acc, k) => {
    if (!acc) return undefined;

    // Xử lý trường hợp key dạng `array[index]`
    const match = k.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const [, arrayKey, index] = match;
      return Array.isArray(acc[arrayKey]) ? acc[arrayKey][parseInt(index)] : undefined;
    }

    return acc[k] !== undefined && acc[k] !== null ? acc[k] : undefined;
  }, obj);
};



// Hàm lấy giá trị từ object, hỗ trợ đường dẫn key kiểu `a.b.c`
const getValueObject = (obj, key) => {
  return key.split('.').reduce((acc, k) => acc ? acc[k] : undefined, obj);
};

module.exports = { getValueArray, getValueObject };