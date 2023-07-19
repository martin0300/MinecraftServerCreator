/*
    Copyright (C) 2023  Martin Magyar

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

import cliMenu from "./libs/cliMenu.js"
import config, { loadConfig } from "./libs/config.js"
import chalk from "chalk"

const mscVersion = "2.0-Beta"

var mainMenu = new cliMenu.Menu([
    {label: "about", shortcut: "a", callback: function() {
        console.log(`MinecraftServerCreator ${chalk.blue(`V${mscVersion}`)} written by martin0300.`)
        cliMenu.waitForEnter()
        mainMenu.showMenu()
    }},
    {label: "exit", shortcut: "e", callback: function() {
        process.exit(0)
    }},
    {label: "create", shortcut: "c", callback: function() {
        
    }}
], mainMenuPrint, function() {
    console.log(chalk.red("Not a choice!"))
    mainMenu.showMenu()
})

function mainMenuPrint() {
    console.log(`Welcome to MinecraftServerCreator ${chalk.blue(`V${mscVersion}`)}!`)
    console.log("Choices:")
    console.log(chalk.green(`-${chalk.underline("c")}reate`))
    console.log(chalk.green(`-${chalk.underline("a")}bout`))
    console.log(chalk.green(`-${chalk.underline("e")}xit`))
}

function init() {
    config.initConfig(true)
}

init()
var configFile = loadConfig(true, {})
mainMenu.showMenu()