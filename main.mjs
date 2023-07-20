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
import * as cheerio from 'cheerio';
import axios from "axios"
import fs from "fs"

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
}, chalk.yellow("?"))

function mainMenuPrint() {
    console.log(`Welcome to MinecraftServerCreator ${chalk.blue(`V${mscVersion}`)}!`)
    console.log("Choices:")
    console.log(chalk.green(`-${chalk.underline("c")}reate`))
    console.log(chalk.green(`-${chalk.underline("a")}bout`))
    console.log(chalk.green(`-${chalk.underline("e")}xit`))
}

function getBukkitParser(url, versionName, versionCollector, callback) {
    axios({
        method: "get",
        url: url
    }).then(function(response) {
        var parsedHTML = cheerio.load(response.data)
        var downloadLinks = parsedHTML(".download-pane")
        versionCollector[versionName] = {}
        downloadLinks.each(function() {
            var versionNumber = parsedHTML(this).find(".col-sm-3 h2").text()
            var downloadLink = parsedHTML(this).find(".btn-download").attr("href")
            versionCollector[versionName][versionNumber] = downloadLink
        })
        callback()
    })
}

function getBukkitDownloadParser(url, callback) {
    axios({
        method: "get",
        url: url
    }).then(function(response) {
        var parsedHTML = cheerio.load(response.data)
        var downloadLink = parsedHTML(".well h2 a").attr("href")
        callback(downloadLink)
    })
}

function fetchMCJars(callback) {
    console.log("Downloading database...")
    versionCollectorVars.versionLocationsKeys = Object.keys(versionLocations.nonapi)
    versionCollectorVars.doneFunction = callback
    var versionName = versionCollectorVars.versionLocationsKeys[versionCollectorVars.versionLocationsIndex]
    var url = versionLocations.nonapi[versionName]
    getBukkitParser(url, versionName, versions, versionCollectorVars.callbackFunction)
}

function init() {
    config.initConfig(true)
}

init()
var configFile = loadConfig(true, {})

//async sux
var versionCollectorVars = {
    versionLocationsKeys: [],
    versionLocationsIndex: 0,
    callbackFunction: function() {
        versionCollectorVars.versionLocationsIndex++
        if (versionCollectorVars.versionLocationsIndex != versionCollectorVars.versionLocationsKeys.length) {
            var versionName = versionCollectorVars.versionLocationsKeys[versionCollectorVars.versionLocationsIndex]
            var url = versionLocations.nonapi[versionName]
            getBukkitParser(url, versionName, versions, versionCollectorVars.callbackFunction)
        }
        else {
            versionCollectorVars.doneFunction()
        }
    },
    doneFunction: function() {}
}

/*
nonapi links will get parsed by getbukkit parser
api will get parsed using the specified api
*/
var versionLocations = {
    nonapi: {
        craftbukkit: "https://getbukkit.org/download/craftbukkit",
        vanilla: "https://getbukkit.org/download/vanilla",
        spigot: "https://getbukkit.org/download/spigot",
    },
    api: {
        paper: "paperapi"
    }
}

//parsed versions
var versions = {}

fetchMCJars(function() {
    mainMenu.showMenu()
})