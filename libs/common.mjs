import process from "process";

/**
 * Check if a string is a valid folder name
 * @param {string} filename
 * @returns {boolean}
 */
export function isValidFolderName(foldername) {
    // eslint-disable-next-line no-control-regex
    const invalidChars = /[<>:"/\\|?*\u0000-\u001F]/;

    if (typeof foldername !== "string" || foldername.trim() === "") {
        return false;
    }

    if (invalidChars.test(foldername)) {
        return false;
    }

    if (foldername === "." || foldername === "..") {
        return false;
    }

    if (foldername.length > 255) {
        return false;
    }

    const reservedNames = ["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"];

    const isWindows = process.platform === "win32";
    if (isWindows && reservedNames.includes(foldername.toUpperCase())) {
        return false;
    }

    return true;
}

/**
 * Checks and converts ram input.
 * @param {string} inputRAM
 * @returns
 */
export function checkRAM(inputRAM) {
    var ram;
    if (/^\d+(\.\d+)?[gG][bB]?$/.test(inputRAM)) {
        ram = inputRAM.toUpperCase().replace("GB", "G");
    } else if (/^\d+[mM][bB]?$/.test(inputRAM)) {
        ram = inputRAM.toUpperCase().replace("MB", "M");
    } else {
        if (!isNaN(inputRAM)) {
            ram = inputRAM + "M";
        } else {
            return false;
        }
    }
    return ram;
}
