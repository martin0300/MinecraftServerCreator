function checkRAM(inputRAM) {
    var ram
    if (/^\d+(\.\d+)?[gG][bB]?$/.test(inputRAM)) {
        ram = inputRAM.replace("gb", "G").replace("GB", "G").replace("gB", "G").replace("Gb", "G").replace("g", "G")
    }
    else if (/^\d+[mM][bB]?$/.test(inputRAM)) {
        ram = inputRAM.replace("mb", "M").replace("MB", "M").replace("mB", "M").replace("Mb", "M").replace("m", "M")
    }
    else {
        if (!isNaN(inputRAM)) {
            ram = inputRAM + "M"
        }
        else {
            return false
        }
    }
    return ram
}

function checkRAMBAD(inputRAM) {
    var ram
    if (/^\d+(\.\d+)?[gG][bB]?$/.test(inputRAM)) {
        ram = inputRAM.replace("gb", "G").replace("GB", "G").replace("g", "G").replace("gB", "G").replace("Gb", "G")
    }
    else if (/^\d+[mM][bB]?$/.test(inputRAM)) {
        ram = inputRAM.replace("mb", "M").replace("MB", "M").replace("m", "M").replace("mB", "M").replace("Mb", "M")
    }
    else {
        if (!isNaN(inputRAM)) {
            ram = inputRAM + "M"
        }
        else {
            return false
        }
    }
    return ram
}


const testCases = [
    // Test cases for GB
    { input: "1gb", expected: "1G" },
    { input: "1GB", expected: "1G" },
    { input: "2g", expected: "2G" },
    { input: "2gb", expected: "2G" },
    { input: "1.5gb", expected: "1.5G" },
    { input: "1.5GB", expected: "1.5G" },
    // Test cases for MB
    { input: "1024mb", expected: "1024M" },
    { input: "1024MB", expected: "1024M" },
    { input: "2048m", expected: "2048M" },
    { input: "2048MB", expected: "2048M" },
    { input: "512mb", expected: "512M" },
    { input: "512MB", expected: "512M" },
    // Test cases for Gb and mB
    { input: "1Gb", expected: "1G" },
    { input: "1gB", expected: "1G" },
    { input: "1GB", expected: "1G" },
    { input: "1mB", expected: "1M" },
    { input: "1mb", expected: "1M" },
    { input: "1Mb", expected: "1M" },
    // Test cases for no MB or GB
    { input: "1", expected: "1M" },
    { input: "1024", expected: "1024M" },
    { input: "2048", expected: "2048M" },
    // Test case with invalid input
    { input: "invalid", expected: false },
    { input: "1invalid", expected: false },
    { input: "1GBinvalid", expected: false },
    { input: "1mb invalid", expected: false },
    { input: "invalidMB", expected: false },
];

testCases.forEach((testCase) => {
    const result = checkRAMBAD(testCase.input);
    const isPassed = result === testCase.expected;
    console.log(
    `"${testCase.input}" => Expected: ${testCase.expected}, Result: ${result}, Passed: ${isPassed}`
    );
});