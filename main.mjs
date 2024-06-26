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

import inquirer from "inquirer";
import chalk from "chalk";
import process from "process";
import pressEnterToContinue from "./libs/pressEnterToContinue.mjs";
import ServerDownloader from "./libs/serverDownloader.mjs";
import { info } from "./libs/errorHandler.mjs";

const ver = "2.0.0-Beta2";
const serverDownloader = new ServerDownloader();

/**
 * Create menu.
 */
async function createMenu() {
    let serverType = await inquirer.prompt([
        {
            name: "Select server type",
            type: "list",
            choices: serverDownloader.getServerTypes(),
        },
    ]);
    return;
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
    console.log(`Welcome to MinecraftServerCreator ${chalk.blue(`V${ver}`)}`);
    let choice = await inquirer.prompt([
        {
            name: "Select an option",
            type: "list",
            choices: ["create", "about", "help", "exit"],
        },
    ]);
    switch (choice["Select an option"]) {
        case "exit":
            process.exit(0);
            break;
        case "help":
            helpMenu();
            break;
        case "about":
            aboutMenu();
            break;
        case "create":
            await createMenu();
            break;
    }
    await mainMenu();
}

//Fetch database
info("Fetching database...");
await serverDownloader.fetchDatabase();

//Launch main menu
await mainMenu();
