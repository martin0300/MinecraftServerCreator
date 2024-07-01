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

import Enquirer from "enquirer";
import chalk from "chalk";
import process from "process";
import pressEnterToContinue from "./libs/pressEnterToContinue.mjs";
import ServerDownloader from "./libs/serverDownloader.mjs";
import { info, error } from "./libs/errorHandler.mjs";
import fs from "fs";
import { checkRAM, isValidFolderName } from "./libs/common.mjs";

const ver = "2.0.0-Beta2";
const serverDownloader = new ServerDownloader();
const enquirer = new Enquirer();

/**
 * Create menu.
 */
async function createMenu() {
    let guidedMode = false;
    let currentMenu = "modeChooser";
    let buildVersionChoose = false;
    let currentConfig = {
        serverType: "",
        serverTypeID: "",
        serverTypeDownloaderID: "",
        serverVersion: "",
        buildNumber: "",
        installLocation: "",
        createDirectory: false,
        serverName: "",
        minRAM: "",
        maxRAM: "",
        createDataFile: true,
    };
    const guidedMenuOrder = ["modeChooser", "serverType", "serverVersion", "buildChooser", "installLocation", "serverName", "minRAM", "maxRAM", "createDataFile"];
    const back = () => {
        if (!guidedMode) {
            currentMenu = "selectMenu";
        }
        const currentMenuIndex = guidedMenuOrder.indexOf(currentMenu);
        if (currentMenuIndex - 1 >= 0) {
            let newCurrentMenu = guidedMenuOrder[currentMenuIndex - 1];
            if (newCurrentMenu === "buildChooser") {
                if (!buildVersionChoose) {
                    if (currentMenuIndex - 2 >= 0) {
                        newCurrentMenu = guidedMenuOrder[currentMenuIndex - 2];
                    } else {
                        return;
                    }
                }
            }
            currentMenu = newCurrentMenu;
        }
    };
    const next = () => {
        if (!guidedMode) {
            currentMenu = "selectMenu";
        }
        const currentMenuIndex = guidedMenuOrder.indexOf(currentMenu);
        if (currentMenuIndex + 1 <= guidedMenuOrder.length - 1) {
            let newCurrentMenu = guidedMenuOrder[currentMenuIndex + 1];
            if (newCurrentMenu === "buildChooser") {
                if (!buildVersionChoose) {
                    if (currentMenuIndex + 2 <= guidedMenuOrder.length + 2) {
                        newCurrentMenu = guidedMenuOrder[currentMenuIndex + 2];
                    } else {
                        return;
                    }
                }
            }
            currentMenu = newCurrentMenu;
        }
    };
    while (true) {
        switch (currentMenu) {
            case "modeChooser":
                var { mode } = await enquirer.prompt({
                    message: "Select mode",
                    type: "select",
                    name: "mode",
                    choices: [
                        {
                            message: "guided (step by step)",
                            name: "guided",
                        },
                        {
                            message: "select (select everything in a main list)",
                            name: "select",
                        },
                        {
                            message: "back",
                            name: "back",
                        },
                    ],
                });
                if (mode === "guided") {
                    guidedMode = true;
                    next();
                } else if (mode === "select") {
                    guidedMode = false;
                    next();
                } else {
                    return;
                }
                break;
            case "selectMenu":
                console.log("not implemented");
                return;
            case "serverType":
                var serverTypes = serverDownloader.getServerTypes();
                var { serverTypeChoice } = await enquirer.prompt({
                    message: "Select server type",
                    type: "select",
                    name: "serverTypeChoice",
                    choices: [...serverTypes.map((serverType) => serverType.serverTypeName), "back"],
                });
                if (serverTypeChoice === "back") {
                    back();
                } else {
                    currentConfig.serverType = serverTypeChoice;

                    //configure serverType stuff and buildlist requirement
                    var serverType = serverTypes.find((serverTypeFind) => serverTypeFind.serverTypeName === serverTypeChoice);
                    currentConfig.serverTypeDownloaderID = serverType.downloaderID;
                    currentConfig.serverTypeID = serverType.serverTypeID;

                    var getBuildlistRequirement = serverDownloader.downloaderBuildlist(serverType.downloaderID);
                    if (!getBuildlistRequirement.success) {
                        error("Invalid serverType! (Internal Error)");
                        back();
                    } else {
                        buildVersionChoose = getBuildlistRequirement.returnCode;
                        next();
                    }
                }
                break;
            case "serverVersion":
                if (currentConfig.serverTypeID === "") {
                    console.log("Select a server type first!");
                    back();
                    break;
                }
                var getServerVersionsResponse = serverDownloader.getServerVersions(currentConfig.serverTypeDownloaderID, currentConfig.serverTypeID);
                if (!getServerVersionsResponse.success) {
                    if (getServerVersionsResponse.returnCode == "invalidDownloaderID") {
                        error("Invalid downloaderID! (Internal Error)");
                    } else if (getServerVersionsResponse.returnCode == "invalidServerTypeID") {
                        error("Invalid serverTypeID! (Internal Error)");
                    }
                    back();
                    break;
                }
                var { serverVersion } = await enquirer.prompt({
                    message: "Select server version",
                    name: "serverVersion",
                    type: "autocomplete",
                    limit: 10,
                    choices: [...getServerVersionsResponse.returnData, "back"],
                });
                if (serverVersion === "back") {
                    back();
                } else {
                    currentConfig.serverVersion = serverVersion;
                    next();
                }
                break;
            case "buildChooser":
                if (currentConfig.serverVersion === "") {
                    console.log("Select a server version first!");
                    back();
                    break;
                }
                var builds = await serverDownloader.getBuildlist(currentConfig.serverTypeDownloaderID, currentConfig.serverTypeID, currentConfig.serverVersion);
                if (!builds.success) {
                    if (builds.returnCode === "invalidDownloaderID") {
                        error("Invalid downloaderID! (Internal Error)");
                    } else {
                        error("Failed to get buildlist! Please check your network connection!");
                    }
                    back();
                    break;
                }
                var { buildNumber } = await enquirer.prompt({
                    message: "Select build number",
                    name: "buildNumber",
                    type: "autocomplete",
                    limit: 10,
                    choices: ["latest", ...builds.returnData.map((build) => build.toString()), "back"],
                });
                if (buildNumber === "back") {
                    back();
                    break;
                } else if (buildNumber === "latest") {
                    currentConfig.buildNumber = "latest";
                } else {
                    currentConfig.buildNumber = Number(buildNumber);
                }
                next();
                break;
            case "installLocation":
                var { installLocation } = await enquirer.prompt({
                    message: "Enter install location: (enter nothing to go back)",
                    name: "installLocation",
                    type: "input",
                });
                if (installLocation === "") {
                    back();
                } else if (!fs.existsSync(installLocation)) {
                    console.log("Invalid path!");
                } else {
                    currentConfig.installLocation = installLocation;
                    next();
                }
                break;
            case "serverName":
                var { wantServerName } = await enquirer.prompt({
                    message: `Do you want to set a server name? [${chalk.underline("y")}es/${chalk.underline("n")}o/${chalk.underline("b")}ack]`,
                    type: "input",
                    name: "wantServerName",
                });
                var continuePrompt = false;
                switch (wantServerName) {
                    case "yes":
                    case "y":
                        continuePrompt = true;
                        next();
                        break;
                    case "no":
                    case "n":
                        currentConfig.serverName = "";
                        currentConfig.createDirectory = false;
                        next();
                        break;
                    case "back":
                    case "b":
                        back();
                        break;
                    default:
                        console.log("Not a valid option!");
                        break;
                }
                if (continuePrompt) {
                    var { serverName } = await enquirer.prompt({
                        message: `Enter server name:`,
                        type: "input",
                        name: "serverName",
                    });
                    currentConfig.serverName = serverName;

                    if (isValidFolderName(currentConfig.serverName)) {
                        var { createDirectory } = await enquirer.prompt({
                            message: "Do you want to create a directory with this name?",
                            type: "toggle",
                            enabled: "Yes",
                            disabled: "No",
                            name: "createDirectory",
                        });
                        currentConfig.createDirectory = createDirectory;
                    } else {
                        currentConfig.createDirectory = false;
                    }
                }
                break;
            case "minRAM":
                var { minRAMInput } = await enquirer.prompt({
                    message: `Enter the minimum amount of RAM for the server: (${chalk.green("MB")} or ${chalk.green("GB")}, defaults to ${chalk.green(
                        "MB"
                    )}) Leave it empty or type '${chalk.underline("b")}ack' to go back.`,
                    type: "input",
                    name: "minRAMInput",
                });
                if (minRAMInput === "") {
                    currentConfig.minRAM = "default";
                    next();
                } else if (minRAMInput === "back" || minRAMInput === "b") {
                    back();
                } else {
                    var minRAM = checkRAM(minRAMInput);
                    if (minRAM === false) {
                        console.log("Not a number or a valid ram amount!");
                        break;
                    }
                    currentConfig.minRAM = minRAM;
                    next();
                }
                break;
            case "maxRAM":
                var { maxRAMInput } = await enquirer.prompt({
                    message: `Enter the maximum amount of RAM for the server: (${chalk.green("MB")} or ${chalk.green("GB")}, defaults to ${chalk.green(
                        "MB"
                    )}) Leave it empty or type '${chalk.underline("b")}ack' to go back.`,
                    type: "input",
                    name: "maxRAMInput",
                });
                if (maxRAMInput === "") {
                    currentConfig.maxRAM = "default";
                    next();
                } else if (maxRAMInput === "back" || maxRAMInput === "b") {
                    back();
                } else {
                    var maxRAM = checkRAM(maxRAMInput);
                    if (maxRAM === false) {
                        console.log("Not a number or a valid ram amount!");
                        break;
                    }
                    currentConfig.maxRAM = maxRAM;
                    next();
                }
                break;
            case "createDataFile":
                var { createDataFile } = await enquirer.prompt({
                    message: `Create server data file? (helps MinecraftServerCreator manage the server) [${chalk.underline("y")}es/${chalk.underline("n")}o/${chalk.underline("b")}ack]`,
                    type: "input",
                    name: "createDataFile",
                });
                switch (createDataFile) {
                    case "yes":
                    case "y":
                        currentConfig.createDataFile = true;
                        next();
                        break;
                    case "no":
                    case "n":
                        currentConfig.createDataFile = false;
                        next();
                        break;
                    case "back":
                    case "b":
                        back();
                        break;
                    default:
                        console.log("Not a valid option!");
                        break;
                }
                break;
        }
    }
}

/**
 * Help menu.
 */
function helpMenu() {
    console.log("Coming soon!");
    pressEnterToContinue();
}

/**
 * About menu.
 */
function aboutMenu() {
    console.log(`MinecraftServerCreator ${chalk.blue(`V${ver} written by martin0300.`)}`);
    pressEnterToContinue();
}

/**
 * Main menu of MinecraftServerCreator.
 */
async function mainMenu() {
    while (true) {
        console.log(`Welcome to MinecraftServerCreator ${chalk.blue(`V${ver}`)}`);
        let { choice } = await enquirer.prompt([
            {
                message: "Select an option",
                name: "choice",
                type: "select",
                choices: ["create", "about", "help", "exit"],
            },
        ]);
        switch (choice) {
            case "exit":
                process.exit(0);
                break;
            case "help":
                await helpMenu();
                break;
            case "about":
                await aboutMenu();
                break;
            case "create":
                await createMenu();
                break;
        }
    }
}

//Fetch database
info("Fetching database...");
await serverDownloader.fetchDatabase();

//Launch main menu
await mainMenu();
