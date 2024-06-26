/*
    Copyright (C) 2024  Martin Magyar

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import process from "process";

/** @module errorHandler */

/**
 * Prints out a message using a toggleable label and a message.
 * @param {string} label
 * @param {string} msg
 * @param {boolean} showLabel
 * @returns
 */
function commonError(label, msg, showLabel) {
    console.log(`${showLabel ? `${label}: ` : ""}${msg}`);
    return;
}

/**
 * Prints out a message using a toggleable label and a message then returns the specified return value.
 * @param {string} label
 * @param {string} msg
 * @param {*} returnValue
 * @param {boolean} showLabel
 * @returns
 */
function commonReturn(label, msg, returnValue, showLabel) {
    commonError(label, msg, showLabel);
    return returnValue;
}

/**
 * Prints out a fatal error message and exits the program with code 1.
 * Label: FATAL
 * @param {string} msg
 * @param {boolean} showLabel
 */
export function fatalError(msg, showLabel = true) {
    commonError("FATAL", msg, showLabel);
    process.exit(1);
}

/**
 * Prints out an error message and returns the specified return value.
 * Label: ERROR
 * @param {string} msg
 * @param {*} returnValue
 * @param {boolean} showLabel
 * @returns
 */
export function error(msg, returnValue = undefined, showLabel = true) {
    return commonReturn("ERROR", msg, returnValue, showLabel);
}

/**
 * Prints out a warning message and returns the specified return value.
 * Label: WARN
 * @param {string} msg
 * @param {*} returnValue
 * @param {boolean} showLabel
 * @returns
 */
export function warn(msg, returnValue = undefined, showLabel = true) {
    return commonReturn("WARN", msg, returnValue, showLabel);
}

/**
 * Prints out an info message and returns the specified return value.
 * Label: INFO
 * @param {string} msg
 * @param {*} returnValue
 * @param {boolean} showLabel
 * @returns
 */
export function info(msg, returnValue = undefined, showLabel = true) {
    return commonReturn("INFO", msg, returnValue, showLabel);
}

/**
 * Prints out an success message and returns the specified return value.
 * Label: SUCCESS
 * @param {string} msg
 * @param {*} returnValue
 * @param {boolean} showLabel
 * @returns
 */
export function success(msg, returnValue = undefined, showLabel = true) {
    return commonReturn("SUCCESS", msg, returnValue, showLabel);
}

/**
 * Prints out a debug message.
 * Label: DEBUG
 * @param {string} msg
 * @param {boolean} showLabel
 * @returns
 */
export function debugLog(msg, showLabel = true) {
    commonError("DEBUG", msg, showLabel);
    return;
}

/**
 * Returns a standard function response object.
 * @param {boolean} success
 * @param {*} returnData
 * @param {*} returnCode
 * @returns
 */
export function functionResponse(success, returnCode = null, returnData = null) {
    return {
        success: success,
        returnCode: returnCode,
        returnData: returnData,
    };
}
