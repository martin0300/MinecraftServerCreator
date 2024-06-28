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
    let guidedMenuOrder = ["modeChooser", "serverType", "serverVersion", "buildChooser", "installLocation"];
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
                }
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
