const compareArrayS = (arr1, arr2, fieldName = 'defaultField') => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const isEqual = set1.size === set2.size && [...set1].every(value => set2.has(value));
    return [{
        fieldName: fieldName,
        matchResult: isEqual ? "✅" : "❌",
    }];
};

module.exports = { compareArrayS };


// const arr1 = [1, 2, 3, 4];
// const arr2 = [1, 2, 3, 4];

// console.table(compareArrayS(arr1, arr2, 'Test1')); // ✅
